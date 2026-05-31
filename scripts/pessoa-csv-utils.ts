import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { normalizePhone, normalizeText } from "./analyze-lead-spreadsheet-utils.js";

export type PessoaCsvRow = {
  rowNumber: number;
  nome: string;
  telefonesRaw: string;
  normalizedPhones: string[];
};

export type PessoaPhoneInfo = {
  phone: string;
  countRows: number;
  names: Set<string>;
  sampleName: string;
};

export type PessoaCsvData = {
  header: string[];
  rows: PessoaCsvRow[];
  totalLines: number;
  linesWithoutPhone: number;
  uniquePhones: number;
  phonesWithMultiplePets: number;
  phonesWithConflictingNames: number;
  phonesIndex: Map<string, PessoaPhoneInfo>;
  conflictingPhoneSamples: string[];
};

export function readPessoaCsv(path: string): PessoaCsvData {
  const absolute = resolve(path);
  const content = readFileSync(absolute, "utf8").replace(/^\uFEFF/, "");
  const rows = parseDelimited(content, ";");
  if (rows.length === 0) throw new Error("Pessoa.csv vazio.");

  const header = rows[0] ?? [];
  const nomeIndex = findHeaderIndex(header, ["nome"]);
  const phonesIndex = findHeaderIndex(header, ["telefones", "telefone"]);
  if (nomeIndex === -1 || phonesIndex === -1) {
    throw new Error("Pessoa.csv sem colunas obrigatorias Nome/Telefones.");
  }

  const parsedRows: PessoaCsvRow[] = [];
  const phoneMap = new Map<string, PessoaPhoneInfo>();
  let linesWithoutPhone = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const nome = (row[nomeIndex] ?? "").trim();
    const telefonesRaw = (row[phonesIndex] ?? "").trim();
    const normalizedPhones = extractPhonesFromText(telefonesRaw);

    parsedRows.push({ rowNumber: i + 1, nome, telefonesRaw, normalizedPhones });
    if (normalizedPhones.length === 0) linesWithoutPhone++;

    for (const phone of normalizedPhones) {
      const nameKey = normalizeText(nome);
      const current = phoneMap.get(phone);
      if (current) {
        current.countRows += 1;
        if (nameKey) current.names.add(nameKey);
      } else {
        phoneMap.set(phone, {
          phone,
          countRows: 1,
          names: new Set(nameKey ? [nameKey] : []),
          sampleName: nome
        });
      }
    }
  }

  let phonesWithMultiplePets = 0;
  let phonesWithConflictingNames = 0;
  const conflictingPhoneSamples: string[] = [];

  for (const info of phoneMap.values()) {
    if (info.countRows > 1) phonesWithMultiplePets++;
    if (info.names.size > 1) {
      phonesWithConflictingNames++;
      if (conflictingPhoneSamples.length < 20) {
        conflictingPhoneSamples.push(
          `phone ${maskPhone(info.phone)} names ${Array.from(info.names).slice(0, 3).join("|")}`
        );
      }
    }
  }

  return {
    header,
    rows: parsedRows,
    totalLines: Math.max(rows.length - 1, 0),
    linesWithoutPhone,
    uniquePhones: phoneMap.size,
    phonesWithMultiplePets,
    phonesWithConflictingNames,
    phonesIndex: phoneMap,
    conflictingPhoneSamples
  };
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return "****";
  return `${digits.slice(0, 4)}*****${digits.slice(-4)}`;
}

export function maskName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "unknown";
  if (trimmed.length <= 3) return `${trimmed[0]}*`;
  return `${trimmed.slice(0, 2)}***${trimmed.slice(-1)}`;
}

export function truncateSafe(value: string, max = 32): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max)}...`;
}

function extractPhonesFromText(raw: string): string[] {
  if (!raw.trim()) return [];
  const allMatches = raw.match(/\d[\d()\s+\-]{7,}\d/g) ?? [];
  const phones = new Set<string>();

  if (allMatches.length === 0) {
    const fallback = normalizePhone(raw);
    if (fallback) phones.add(fallback);
  } else {
    for (const chunk of allMatches) {
      const normalized = normalizePhone(chunk);
      if (normalized) phones.add(normalized);
    }
  }
  return Array.from(phones);
}

function parseDelimited(content: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i] ?? "";
    const next = content[i + 1] ?? "";

    if (insideQuotes) {
      if (char === "\"" && next === "\"") {
        cell += "\"";
        i++;
      } else if (char === "\"") {
        insideQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === "\"") {
      insideQuotes = true;
      continue;
    }
    if (char === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\r") continue;
    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function findHeaderIndex(header: string[], aliases: string[]): number {
  for (let i = 0; i < header.length; i++) {
    const normalized = normalizeText(header[i] ?? "");
    if (aliases.some((alias) => normalized.includes(normalizeText(alias)))) return i;
  }
  return -1;
}

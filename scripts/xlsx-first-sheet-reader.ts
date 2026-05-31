import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export type SpreadsheetRow = {
  rowNumber: number;
  cells: Record<string, string>;
};

export type FirstSheetData = {
  sheetNames: string[];
  firstSheetName: string;
  rows: SpreadsheetRow[];
};

const pythonExtractor = String.raw`
import json, re, sys, zipfile
import xml.etree.ElementTree as ET

path = sys.argv[1]
ns = {
  "x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
  "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
  "pr": "http://schemas.openxmlformats.org/package/2006/relationships"
}

def col_to_index(ref):
  m = re.match(r"([A-Z]+)", ref or "")
  if not m:
    return 0
  letters = m.group(1)
  value = 0
  for ch in letters:
    value = value * 26 + (ord(ch) - 64)
  return value - 1

def shared_strings(book):
  if "xl/sharedStrings.xml" not in book.namelist():
    return []
  root = ET.fromstring(book.read("xl/sharedStrings.xml"))
  values = []
  for si in root.findall("x:si", ns):
    txt = "".join(t.text or "" for t in si.iterfind(".//x:t", ns))
    values.append(txt)
  return values

def cell_value(cell, strings):
  t = cell.attrib.get("t")
  if t == "s":
    idx = int(cell.findtext("x:v", default="0", namespaces=ns) or "0")
    return strings[idx] if 0 <= idx < len(strings) else ""
  if t == "inlineStr":
    return "".join(t.text or "" for t in cell.iterfind(".//x:t", ns))
  return cell.findtext("x:v", default="", namespaces=ns) or ""

with zipfile.ZipFile(path, "r") as book:
  wb = ET.fromstring(book.read("xl/workbook.xml"))
  sheet_nodes = wb.find("x:sheets", ns).findall("x:sheet", ns)
  if not sheet_nodes:
    raise RuntimeError("Workbook sem abas")

  names = [n.attrib.get("name", "") for n in sheet_nodes]
  first = sheet_nodes[0]
  rel_id = first.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
  if not rel_id:
    raise RuntimeError("Primeira aba sem relationship id")

  rels = ET.fromstring(book.read("xl/_rels/workbook.xml.rels"))
  target = None
  for rel in rels.findall("pr:Relationship", ns):
    if rel.attrib.get("Id") == rel_id:
      target = rel.attrib.get("Target")
      break
  if not target:
    raise RuntimeError("Nao foi possivel resolver XML da primeira aba")

  sheet_xml = target if target.startswith("xl/") else "xl/" + target
  sheet = ET.fromstring(book.read(sheet_xml))
  strings = shared_strings(book)

  rows = []
  sheet_data = sheet.find("x:sheetData", ns)
  if sheet_data is not None:
    for row in sheet_data.findall("x:row", ns):
      row_num = int(row.attrib.get("r", "0") or "0")
      cells = {}
      for cell in row.findall("x:c", ns):
        ref = cell.attrib.get("r", "")
        col = col_to_index(ref)
        value = cell_value(cell, strings).strip()
        if value:
          cells[str(col)] = value
      if cells:
        rows.append({"rowNumber": row_num, "cells": cells})

  print(json.dumps({
    "sheetNames": names,
    "firstSheetName": names[0],
    "rows": rows
  }, ensure_ascii=True))
`;

export function readFirstSheet(filePath: string): FirstSheetData {
  const absolute = resolve(filePath);
  if (!existsSync(absolute)) {
    throw new Error(`Arquivo nao encontrado: ${absolute}`);
  }

  const result = spawnSync("python", ["-c", pythonExtractor, absolute], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  });

  if (result.error) {
    throw new Error(`Falha ao executar Python: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const stderr = result.stderr?.trim() || "sem detalhes";
    throw new Error(`Falha ao ler XLSX via Python: ${stderr}`);
  }

  const stdout = result.stdout?.trim();
  if (!stdout) {
    throw new Error("Leitura XLSX retornou vazio.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Falha ao interpretar JSON do extrator XLSX: ${message}`);
  }

  if (!isFirstSheetData(parsed)) {
    throw new Error("Estrutura inesperada retornada pelo extrator XLSX.");
  }
  return parsed;
}

function isFirstSheetData(value: unknown): value is FirstSheetData {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    Array.isArray(item.sheetNames) &&
    typeof item.firstSheetName === "string" &&
    Array.isArray(item.rows)
  );
}

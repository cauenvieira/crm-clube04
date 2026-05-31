export type DateStats = {
  validCount: number;
  invalidCount: number;
  suspectCount: number;
  min: Date | null;
  max: Date | null;
  invalidSamples: string[];
  suspectSamples: string[];
};

export const normalizeText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

export function canonicalFromHeaderFactory<T extends string>(
  aliases: Record<T, string[]>
) {
  return (header: string) => {
    const normalizedHeader = normalizeText(header);
    let best: { key: T; score: number } | null = null;
    for (const key of Object.keys(aliases) as T[]) {
      for (const alias of aliases[key]) {
        const normalizedAlias = normalizeText(alias);
        if (!normalizedAlias || !normalizedHeader.includes(normalizedAlias)) continue;
        const score = normalizedAlias.length;
        if (!best || score > best.score) best = { key, score };
      }
    }
    return best?.key;
  };
}

export const toIndexMap = (cells: Record<string, string>) =>
  Object.fromEntries(Object.entries(cells).map(([k, v]) => [Number(k), v]));

export const createCounter = () => new Map<string, { count: number; sample: string }>();

export function addCounter(counter: ReturnType<typeof createCounter>, raw: string) {
  const key = normalizeText(raw);
  if (!key) return;
  const previous = counter.get(key);
  if (previous) previous.count += 1;
  else counter.set(key, { count: 1, sample: raw.trim() });
}

export function topCounter(counter: ReturnType<typeof createCounter>, limit: number) {
  return Array.from(counter.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length === 12 || digits.length === 13) {
    return digits.startsWith("55") ? digits : `55${digits}`;
  }
  return "";
}

export function createDateStats(): DateStats {
  return {
    validCount: 0,
    invalidCount: 0,
    suspectCount: 0,
    min: null,
    max: null,
    invalidSamples: [],
    suspectSamples: []
  };
}

export function updateDateStats(stats: DateStats, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return;
  const parsed = parseDateValue(trimmed);
  if (!parsed.date) {
    stats.invalidCount++;
    if (stats.invalidSamples.length < 10) stats.invalidSamples.push(trimmed);
    return;
  }

  stats.validCount++;
  if (!stats.min || parsed.date < stats.min) stats.min = parsed.date;
  if (!stats.max || parsed.date > stats.max) stats.max = parsed.date;
  if (parsed.suspect) {
    stats.suspectCount++;
    if (stats.suspectSamples.length < 10) stats.suspectSamples.push(trimmed);
  }
}

function parseDateValue(input: string): { date?: Date; suspect: boolean } {
  if (/^\d+(\.\d+)?$/.test(input)) {
    const serial = Number(input);
    if (serial > 20000 && serial < 90000) {
      const epochMs = (serial - 25569) * 86400 * 1000;
      const date = new Date(epochMs);
      return { date, suspect: isSuspectDate(date) };
    }
  }

  const br = input.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (br) {
    const year = br[3].length === 2 ? Number(`20${br[3]}`) : Number(br[3]);
    const date = new Date(Date.UTC(year, Number(br[2]) - 1, Number(br[1])));
    return { date, suspect: isSuspectDate(date) };
  }

  const iso = new Date(input);
  if (!Number.isNaN(iso.getTime())) return { date: iso, suspect: isSuspectDate(iso) };
  return { suspect: true };
}

function isSuspectDate(date: Date) {
  const year = date.getUTCFullYear();
  const now = new Date().getUTCFullYear();
  return year < 2018 || year > now + 2;
}

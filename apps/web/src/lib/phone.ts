export function normalizePhoneDigits(raw: string) {
  return raw.replace(/\D/g, "");
}

export function formatPhone(raw: string | null | undefined) {
  const digits = normalizePhoneDigits(raw ?? "");
  if (!digits) return "Sem telefone";
  if (digits.length === 13 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 12 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return raw ?? "Sem telefone";
}

export function buildWhatsappUrl(raw: string | null | undefined) {
  const digits = normalizePhoneDigits(raw ?? "");
  if (!digits) return null;
  return `https://web.whatsapp.com/send?phone=${digits}`;
}

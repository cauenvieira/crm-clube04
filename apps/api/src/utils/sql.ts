export function compactObject<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

export function buildUpdateSet(
  data: Record<string, unknown>,
  startIndex = 1
): { assignments: string; values: unknown[]; nextIndex: number } {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  const assignments = entries
    .map(([key], index) => `${key} = $${startIndex + index}`)
    .join(", ");
  const values = entries.map(([, value]) => value);

  return {
    assignments,
    values,
    nextIndex: startIndex + entries.length
  };
}

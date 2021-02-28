export function isBlank(s: string): boolean {
  return !s || s.trim().length == 0;
}

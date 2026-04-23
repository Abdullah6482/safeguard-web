export function normalizeSearchTerm(str) {
  if (!str) return '';
  return str.trim().toLowerCase();
}

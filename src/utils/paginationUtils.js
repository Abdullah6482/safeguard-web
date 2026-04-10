export function paginate(items = [], page = 1, pageSize = 10) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * pageSize;
  const data = items.slice(start, start + pageSize);

  return { data, totalPages, totalItems, currentPage: safePage };
}

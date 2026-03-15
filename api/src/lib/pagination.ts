export const clampInt = (
  value: unknown,
  fallback: number,
  min: number,
  max: number
) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
};

export const getPagination = (page: unknown, limit: unknown, max = 100) => {
  const currentPage = clampInt(page, 1, 1, Number.MAX_SAFE_INTEGER);
  const limitPerPage = clampInt(limit, 10, 1, max);
  const offset = (currentPage - 1) * limitPerPage;

  return {
    page: currentPage,
    limit: limitPerPage,
    offset,
  };
};

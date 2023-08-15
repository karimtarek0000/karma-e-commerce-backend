export const paginationHandler = (page = 1, limit = 3) => {
  const pagin = { page, limit };

  if (page < 1) pagin.page = 1;
  if (limit < 1) pagin.limit = 2;

  const skip = (pagin.page - 1) * limit;

  return { page, limit, skip };
};

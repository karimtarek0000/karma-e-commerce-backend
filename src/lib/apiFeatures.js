import { paginationHandler } from '../utils/pagination.js';

export class ApiFeatures {
  constructor(mongooseQueryCount, mongooseQuery, queryParams) {
    this.mongooseQueryCount = mongooseQueryCount;
    this.mongooseQuery = mongooseQuery;
    this.queryParams = queryParams;
  }

  // ---------- Pagination -------------
  pagination() {
    const { page, size } = this.queryParams;
    const { limit, skip } = paginationHandler(page, size);

    this.mongooseQuery.limit(limit).skip(skip);

    this.page = +page || 1;
    this.limit = +limit;

    return this;
  }

  // ---------- Sort -------------
  sort() {
    this.mongooseQuery.sort(this.queryParams?.sort?.replaceAll(',', ' '));
    return this;
  }

  // ---------- Select -------------
  select() {
    this.mongooseQuery.select(this.queryParams?.select?.replaceAll(',', ' '));
    return this;
  }

  // ---------- Search -------------
  search() {
    const searchQuery = this.queryParams?.search;

    this.querySearch = {
      $or: [
        {
          title: { $regex: searchQuery ?? '', $options: 'i' },
        },
        {
          description: { $regex: searchQuery ?? '', $options: 'i' },
        },
      ],
    };

    this.mongooseQuery.find(this.querySearch);

    return this;
  }

  // ---------- Filter -------------
  filter() {
    const queries = { ...this.queryParams };
    // -------- Exclude operators from req.query --------
    const excludeKeys = ['page', 'size', 'sort', 'select', 'search'];
    excludeKeys.forEach((key) => delete queries[key]);

    // -------- Convert req.query to string to make add $ before operator --------
    this.queryFilter = JSON.parse(
      JSON.stringify(queries).replace(/\b(gt|gte|lt|lte|in|nin|eq)/g, (operator) => `$${operator}`)
    );

    this.mongooseQuery.find(this.queryFilter);

    return this;
  }

  // ------------ Total count -----------------
  totalCount() {
    this.mongooseQueryCount.count({ ...this.querySearch, ...this.queryFilter });

    return this;
  }
}

import JOI from 'joi';

export const productSchema = {
  body: JOI.object({
    title: JOI.string().trim().required(),
    description: JOI.string().required(),
    price: JOI.number().required(),
    categoryId: JOI.string().required(),
    subCategoryId: JOI.string().required(),
    brandId: JOI.string().required(),
    discount: JOI.number(),
    stock: JOI.number().required(),
  }),
  files: JOI.array().min(1).required(),
};

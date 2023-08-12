import JOI from 'joi';

export const productSchema = {
  body: JOI.object({
    title: JOI.string().trim().required(),
    description: JOI.string().required(),
    price: JOI.number().required(),
    categoryId: JOI.string().required(),
    subCategoryId: JOI.string().required(),
    brandId: JOI.string().required(),
    stock: JOI.number().required(),
    discount: JOI.number(),
    colors: JOI.array().items(JOI.string().trim()),
    sizes: JOI.array().items(JOI.string().trim()),
  }),
  files: JOI.array().min(1).required(),
};

import JOI from 'joi';

export const productSchema = {
  body: JOI.object({
    title: JOI.string().trim().required(),
    description: JOI.string().required(),
    price: JOI.number().required(),
    categoryId: JOI.string().required(),
    subCategoryId: JOI.string().required(),
    brandId: JOI.string().required(),
    stock: JOI.number().min(1).integer().required(),
    discount: JOI.number().min(1).integer().optional(),
    colors: JOI.array().items(JOI.string().trim()),
    sizes: JOI.array().items(JOI.string().trim()),
  }),

  files: JOI.array().min(1).required(),
};

export const updateProductSchema = {
  body: JOI.object({
    title: JOI.string().trim(),
    description: JOI.string(),
    price: JOI.number(),
    categoryId: JOI.string(),
    subCategoryId: JOI.string(),
    brandId: JOI.string(),
    stock: JOI.number().min(1).integer(),
    discount: JOI.number().min(1).integer(),
    colors: JOI.array().items(JOI.string().trim()),
    sizes: JOI.array().items(JOI.string().trim()),
  }),

  files: JOI.array().min(1),
};

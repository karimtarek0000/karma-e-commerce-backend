import JOI from 'joi';

const share = {
  name: JOI.string().trim(),
  // createdBy: JOI.string().trim(),
};

export const brandSchema = {
  body: JOI.object({
    categoryId: JOI.string().trim(),
    subCategoryId: JOI.string().trim(),
    ...share,
  }).options({ presence: 'required' }),
  file: JOI.object().required(),
};

export const updateBrandSchema = {
  body: JOI.object({
    id: JOI.string().trim().required(),
    ...share,
  }),
  file: JOI.object(),
};

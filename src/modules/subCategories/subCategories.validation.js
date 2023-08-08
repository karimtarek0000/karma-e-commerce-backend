import JOI from "joi";

const share = {
  name: JOI.string().trim(),
  // createdBy: JOI.string().trim(),
};

export const subCategorySchema = {
  body: JOI.object({
    ...share,
  }).options({ presence: "required" }),
  file: JOI.object().required(),
};

export const updateSubCategorySchema = {
  body: JOI.object({
    id: JOI.string().trim().required(),
    ...share,
  }),
  file: JOI.object(),
};

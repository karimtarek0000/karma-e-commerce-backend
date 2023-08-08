import JOI from "joi";

const share = {
  name: JOI.string().trim(),
  // createdBy: JOI.string().trim(),
};

export const categorySchema = {
  body: JOI.object({
    ...share,
  }).options({ presence: "required" }),
  file: JOI.object().required(),
};

export const updateCategorySchema = {
  body: JOI.object({
    id: JOI.string().trim().required(),
    ...share,
  }),
  file: JOI.object(),
};

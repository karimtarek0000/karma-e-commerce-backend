import JOI from "joi";

export const categorySchema = {
  body: JOI.object({
    name: JOI.string().trim(),
    // createdBy: JOI.string().trim(),
  }).options({ presence: "required" }),
  file: JOI.object().required(),
};

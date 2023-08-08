import multer from "multer";

export const allowExtensionsTypes = {
  image: ["image/jpeg", "image/jpg", "image/png"],
  file: ["application/pdf"],
  video: ["video/mp4"],
};

export const uploadFilesWithCloud = (allowExtensions = []) => {
  const storage = multer.diskStorage({});

  // ============== FILTER ===================
  const fileFilter = function (req, file, cb) {
    if (allowExtensions.includes(file.mimetype)) return cb(null, true);

    // Error handling
    cb(new Error(`${file.mimetype} not valid`, { cause: "400" }), false);
  };

  return multer({ fileFilter, storage });
};

import multer from "multer";
import path from "path";

// Storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // make sure "uploads" folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1690001234567.png or .pdf
  },
});

// File filter (images and PDFs allowed)
function fileFilter(req, file, cb) {
  // Allowed extensions: images and pdf
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed!"), false);
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
  fileFilter: fileFilter,
});

export default upload;

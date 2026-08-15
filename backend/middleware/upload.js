import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "student-faculty-achievements",
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "image",
  },
});

const upload = multer({ storage });

export default upload;
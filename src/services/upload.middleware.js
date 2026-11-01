import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (![".docx", ".txt"].includes(extension)) {
        return cb(new Error("Only DOCX and TXT files are allowed."));
    }

    cb(null, true);
};

export const uploadBlogFile = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 3 * 1024 * 1024,
        files: 1,
    },
});
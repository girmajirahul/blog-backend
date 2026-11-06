import express from "express";

import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
  getBlogByUser,
  importBlogController,
  getCommonBlogs
}
from "../controller/blog.controller.js";

import { uploadBlogFile } from "../services/upload.middleware.js"
import { protect } from "../services/auth.middleware.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/commonblogs",getCommonBlogs);

router.get("/:id", getBlogById);

router.get("/slug/:slug", getBlog);

router.get("/users/:id",getBlogByUser)

router.post("/", createBlog);

router.put("/:id", updateBlog);

router.delete("/:id", deleteBlog);


router.post(
    "/import",
    protect,
    uploadBlogFile.single("file"),
    importBlogController
);

export default router;
import express from "express";

import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById
}
from "../controller/blog.controller.js";

const router = express.Router();

router.get("/", getBlogs);

router.get("/:id", getBlogById);

router.get("/slug/:slug", getBlog);

router.post("/", createBlog);

router.put("/:id", updateBlog);

router.delete("/:id", deleteBlog);

export default router;
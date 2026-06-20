import express from "express";

import {
    getTechBlogs,
    getTechBlogBySlug,
    createTechBlog,
    updateTechBlog,
    deleteTechBlog,
} from "../controller/techBlog.controller.js";

const router = express.Router();

//all blogs
router.get("/", getTechBlogs);

//blogs by slus
router.get("/:slug", getTechBlogBySlug);

//create 
router.post("/", createTechBlog);

//update blogs
router.put("/:id", updateTechBlog);

//delete blod by Id
router.delete("/:id", deleteTechBlog);

export default router;
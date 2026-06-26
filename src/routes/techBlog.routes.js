import express from "express";

import {
    getTechBlogs,
    getTechBlogBySlug,
    createTechBlog,
    updateTechBlog,
    deleteTechBlog,
    getTechBlogById,
} from "../controller/techBlog.controller.js";

const router = express.Router();

//all blogs
router.get("/", getTechBlogs);

//get by id 
router.get("/:id", getTechBlogById);

//blogs by slus
router.get("/slug/:slug", getTechBlogBySlug);

//create 
router.post("/", createTechBlog);

//update blogs
router.put("/:id", updateTechBlog);

//delete blod by Id
router.delete("/:id", deleteTechBlog);

export default router;
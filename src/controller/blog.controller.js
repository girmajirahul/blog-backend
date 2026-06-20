import * as blogService
from "../services/blog.services.js";

export const getBlogs = async (req,res) => {

  const blogs =
    await blogService.getAllBlogs();

  res.status(200).json({ 
    success: true,
    data: blogs
  });
};

export const getBlog = async (req,res) => {

  const blog =
    await blogService.getBlogBySlug(req.params.slug);

  res.status(200).json({
    success: true,
    data: blog
  });
};

export const createBlog = async (req,res) => {

  const blog =
    await blogService.createBlog(req.body);

  res.status(201).json({
    success: true,
    data: blog
  });
};

export const updateBlog = async (req,res) => {

  const blog =
    await blogService.updateBlog(req.params.id,req.body);

  res.status(200).json({
    success: true,
    data: blog
  });
};

export const deleteBlog = async (req,res) => {

  await blogService.deleteBlog(req.params.id);

  res.status(200).json({
    success: true,
    message:
      "Blog deleted successfully"
  });
};
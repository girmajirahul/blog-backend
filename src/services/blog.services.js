import Blog from "../models/blog.model.js";

export const getAllBlogs = async () => {
  return await Blog.find()
    .sort({ createdAt: -1 });
};

export const getBlogBySlug = async (slug) => {
  return await Blog.findOne({ slug });
};

export const createBlog = async (data) => {
  return await Blog.create(data);
};

export const updateBlog = async (  id, data) => {
  return await Blog.findByIdAndUpdate(id,data,{new: true});
};

export const deleteBlog = async (id) => {
  return await Blog.findByIdAndDelete(id);
};
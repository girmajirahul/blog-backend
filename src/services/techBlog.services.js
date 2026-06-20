import TechBlog from "../models/techBlog.model.js";

export const getAllTechBlogs = async () => {
    return TechBlog.find().sort({createdAt: -1,});
};

export const getTechBlogBySlug = async (slug) => {
    return TechBlog.findOne({ slug });
};

export const createTechBlog = async (data) => {
    return TechBlog.create(data);
};

export const updateTechBlog = async (id,data) => {
    return TechBlog.findByIdAndUpdate(id, data, { new: true });
};

export const deleteTechBlog = async (id) => {
    return TechBlog.findByIdAndDelete(id);
};
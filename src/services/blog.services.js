import Blog from "../models/blog.model.js";

// export const getAllBlogs = async () => {
//   return await Blog.find()
//     .sort({ createdAt: -1 });
// };


export const getAllBlogs = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [blogs, totalBlogs] = await Promise.all([
    Blog.find().select(
      "_id slug title excerpt date readingTime tags stack featured difficulty"
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Blog.countDocuments(),
  ]);


  return {
    count: blogs.length,
    totalBlogs,
    currentPage: page,
    totalPages: Math.ceil(totalBlogs / limit),
    hasNextPage: page < Math.ceil(totalBlogs / limit),
    hasPreviousPage: page > 1,
    data: blogs,
  };
};


export const getBlogBySlug = async (slug) => {
  return await Blog.findOne({ slug });
};

export const getBlogByIdService = async (id) => {
  return await Blog.findById(id);
};

export const createBlog = async (data) => {
  return await Blog.create(data);
};

export const updateBlog = async (id, data) => {
  return await Blog.findByIdAndUpdate(id, data, { new: true });
};

export const deleteBlog = async (id) => {
  return await Blog.findByIdAndDelete(id);
};
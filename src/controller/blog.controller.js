import * as blogService
  from "../services/blog.services.js";

export const getBlogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const blogs =
    await blogService.getAllBlogs(page,limit);

  res.status(200).json({
    success: true,
    data: blogs
  });
};

export const getBlog = async (req, res) => {

  const blog =
    await blogService.getBlogBySlug(req.params.slug);

  res.status(200).json({
    success: true,
    data: blog
  });
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await blogService.getBlogByIdService(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createBlog = async (req, res) => {

  const blog =
    await blogService.createBlog(req.body);

  res.status(201).json({
    success: true,
    data: blog
  });
};

export const updateBlog = async (req, res) => {

  const blog =
    await blogService.updateBlog(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: blog
  });
};

export const deleteBlog = async (req, res) => {

  await blogService.deleteBlog(req.params.id);

  res.status(200).json({
    success: true,
    message:
      "Blog deleted successfully"
  });
};
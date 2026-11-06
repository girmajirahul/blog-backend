import * as blogService
  from "../services/blog.services.js";

import { importBlogService } from "../services/blog.services.js";


export const getBlogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const blogs =
    await blogService.getAllBlogs(page, limit);

  res.status(200).json({
    success: true,
    data: blogs
  });
};


export const getCommonBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type = "all",
    } = req.query;

    const blogs = await blogService.fetchCommonBlogs(
      page,
      limit,
      type
    );

    return res.status(200).json({
      success: true,
      ...blogs,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBlog = async (req, res) => {

  const blog =
    await blogService.getBlogBySlug(req.params.slug);

  res.status(200).json({
    success: true,
    data: blog
  });
};

export const getBlogByUser = async (req, res) => {
  try {
    const blog = await blogService.getBlogByUserId(req.params.id);
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
}

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


// export const importBlogController = async (req, res, next) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please upload a DOCX or TXT document.",
//             });
//         }

//         const blog = await importBlogService(
//             req.file,
//             req.user.id
//         );

//         return res.status(201).json({
//             success: true,
//             message: "Blog imported successfully.",
//             data: blog,
//         });

//     } catch (error) {
//         next(error);
//     }
// };


export const importBlogController = async (req, res) => {
  try {
    const documentFile = req.file;
    if (!documentFile) {
      return res.status(400).json({
        success: false,
        message: "Please upload a DOCX or TXT document.",
      });
    }

    const blog = await importBlogService({
      documentFile,
      coverImageFile: req.files?.coverImage?.[0] || null,
      formData: req.body,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Blog imported successfully.",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
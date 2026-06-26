import * as techBlogService from "../services/techBlog.services.js";

/**
 * GET /api/tech
 */
export const getTechBlogs = async (req, res) => {
    try {
        const page=parseInt(req.query.page) || 1;
        const limit =parseInt(req.query.limit) || 10;

        const blogs = await techBlogService.getAllTechBlogs(page,limit);

        res.status(200).json({
            success: true,
            count: blogs.length,
            data: blogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//get blog by id

export const getTechBlogById = async (req, res) => {
    try {
        const blog = await techBlogService.getTechBlogByIdService(
            req.params.id
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Tech blog not found",
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

/**
 * GET /api/tech/:slug
 */
export const getTechBlogBySlug = async (req, res) => {
    try {
        const blog = await techBlogService.getTechBlogBySlug(
            req.params.slug
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Tech blog not found",
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

/**
 * POST /api/tech
 */
export const createTechBlog = async (req, res) => {
    try {
        const blog = await techBlogService.createTechBlog(
            req.body
        );

        res.status(201).json({
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

/**
 * PUT /api/tech/:id
 */
export const updateTechBlog = async (req, res) => {
    try {
        const blog = await techBlogService.updateTechBlog(
            req.params.id,
            req.body
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Tech blog not found",
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

/**
 * DELETE /api/tech/:id
 */
export const deleteTechBlog = async (req, res) => {
    try {
        const blog = await techBlogService.deleteTechBlog(
            req.params.id
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Tech blog not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Tech blog deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
import TechBlog from "../models/techBlog.model.js";

// export const getAllTechBlogs = async (page=1,limit=10) => {
//     const blogs=TechBlog.find().sort({createdAt: -1,})
//     return blogs;
// };


export const getAllTechBlogs = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [blogs, totalBlogs] = await Promise.all([
        TechBlog.find().select(
            "_id slug title excerpt date readingTime tags stack featured difficulty"
        )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        TechBlog.countDocuments(),
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

export const getTechBlogBySlug = async (slug) => {
    return TechBlog.findOne({ slug });
};

export const getTechBlogByIdService = async (id) => {
    return await TechBlog.findById(id);
};


export const createTechBlog = async (data) => {
    return TechBlog.create(data);
};

export const updateTechBlog = async (id, data) => {
    return TechBlog.findByIdAndUpdate(id, data, { new: true });
};

export const deleteTechBlog = async (id) => {
    return TechBlog.findByIdAndDelete(id);
};
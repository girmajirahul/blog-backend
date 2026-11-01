import Blog from "../models/blog.model.js";
import mammoth from "mammoth";
import path from "path";

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

export const getBlogByUserId=async (id)=>{
  return await Blog.find({
    author:id,
  })
}

export const createBlog = async (data) => {
  return await Blog.create(data);
};

export const updateBlog = async (id, data) => {
  return await Blog.findByIdAndUpdate(id, data, { new: true });
};

export const deleteBlog = async (id) => {
  return await Blog.findByIdAndDelete(id);
};



// import Blog from "../models/blog.model.js";
// import connectDB from "../config/db.config.js";

const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

const extractBlogData = (text) => {
    const marker = /^BLOG CONTENT\s*:?\s*$/im;
    const match = marker.exec(text);

    if (!match) {
        throw new Error("BLOG CONTENT section is missing.");
    }

    const metadataText = text.slice(0, match.index);
    const articleText = text.slice(match.index + match[0].length);

    const fieldNames = {
        TITLE: "title",
        SLUG: "slug",
        EXCERPT: "excerpt",
        DATE: "date",
        "READING TIME": "readingTime",
        TAGS: "tags",
        "COVER IMAGE": "coverImage",
    };

    const metadata = {};
    let currentField = null;

    for (const line of metadataText.split(/\r?\n/)) {
        const trimmed = line.trim();

        const field = Object.keys(fieldNames).find((key) =>
            trimmed.toUpperCase().startsWith(`${key}:`)
        );

        if (field) {
            currentField = fieldNames[field];

            metadata[currentField] = trimmed
                .slice(field.length + 1)
                .trim();
        } else if (currentField && trimmed) {
            metadata[currentField] += `\n${trimmed}`;
        }
    }

    const title = metadata.title?.trim();

    const content = articleText
        .split(/\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    return {
        title,
        slug: metadata.slug?.trim() || generateSlug(title || ""),
        excerpt: metadata.excerpt?.trim(),
        date: metadata.date?.trim(),
        readingTime: metadata.readingTime?.trim(),
        tags: (metadata.tags || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        coverImage: metadata.coverImage?.trim() || "",
        content,
    };
};

const validateBlog = (blog) => {
    const required = [
        "title",
        "slug",
        "excerpt",
        "date",
        "readingTime",
    ];

    for (const field of required) {
        if (!blog[field]) {
            throw new Error(`${field} is required.`);
        }
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(blog.date)) {
        throw new Error("Date must be in YYYY-MM-DD format.");
    }

    const parsedDate = new Date(`${blog.date}T00:00:00.000Z`);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== blog.date
    ) {
        throw new Error("Please provide a valid calendar date.");
    }

    if (!blog.content?.length) {
        throw new Error("Blog content cannot be empty.");
    }

    if (blog.content.join("\n").length > 200000) {
        throw new Error("Blog content exceeds the allowed length.");
    }

    if (blog.slug.length > 150 || blog.title.length > 200) {
        throw new Error("Title or slug is too long.");
    }
};

export const importBlogService = async (file, userId) => {
    
    const extension = path.extname(file.originalname).toLowerCase();

    let extractedText;

    if (extension === ".txt") {
        extractedText = file.buffer.toString("utf8");
    } else if (extension === ".docx") {
        const result = await mammoth.extractRawText({
            buffer: file.buffer,
        });

        extractedText = result.value;
    } else {
        throw new Error("Unsupported file format.");
    }

    if (!extractedText.trim()) {
        throw new Error("Uploaded document is empty.");
    }

    const blogData = extractBlogData(extractedText);

    validateBlog(blogData);

    try {
        const blog = await Blog.create({
            ...blogData,
            author: userId,
        });

        return blog;

    } catch (error) {
        if (error.code === 11000) {
            const duplicateError = new Error(
                "A blog with this slug already exists."
            );

            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        throw error;
    }
};
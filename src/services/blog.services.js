import Blog from "../models/blog.model.js";
import mammoth from "mammoth";
import path from "path";
import techBlogModel from "../models/techBlog.model.js";

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




export const fetchCommonBlogs = async (
  page = 1,
  limit = 10,
  type = "all"
) => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.max(1, Number(limit) || 10);

  const skip = (page - 1) * limit;

  // Validate type
  const allowedTypes = ["all", "blog", "techBlog"];

  if (!allowedTypes.includes(type)) {
    throw new Error("Invalid type. Use all, blog, or techBlog");
  }

  const fetchTechBlogs = type === "all" || type === "techBlog";
  const fetchBlogs = type === "all" || type === "blog";

  const [techBlogs, blogs, totalTechBlogs, totalBlogs] =
    await Promise.all([
      fetchTechBlogs
        ? techBlogModel.find()
            .select("_id slug title excerpt date readingTime tags stack featured difficulty createdAt")
            .lean()
        : [],

      fetchBlogs
        ? Blog.find()
            .select("_id slug title excerpt date readingTime tags stack featured difficulty createdAt")
            .lean()
        : [],

      fetchTechBlogs ? techBlogModel.countDocuments() : 0,
      fetchBlogs ? Blog.countDocuments() : 0,
    ]);

  const allBlogs = [
    ...blogs.map(blog => ({
      ...blog,
      type: "blog",
    })),

    ...techBlogs.map(blog => ({
      ...blog,
      type: "techBlog",
    })),
  ];

  allBlogs.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const totalItems = totalTechBlogs + totalBlogs;
  const totalPages = Math.ceil(totalItems / limit);

  const data = allBlogs.slice(skip, skip + limit);

  return {
    count: data.length,
    totalItems,
    totalTechBlogs,
    totalBlogs,
    currentPage: page,
    totalPages,
    limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    type,
    data,
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



// Generate slug using title only
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

// Extract content from DOCX or TXT
const extractBlogContent = async (file) => {
    const extension = path.extname(file.originalname).toLowerCase();

    let extractedText = "";

    if (extension === ".txt") {
        extractedText = file.buffer.toString("utf8");
    } else if (extension === ".docx") {
        const result = await mammoth.extractRawText({
            buffer: file.buffer,
        });

        extractedText = result.value;
    } else {
        throw new Error("Only DOCX and TXT files are supported.");
    }

    if (!extractedText.trim()) {
        throw new Error("Uploaded document is empty.");
    }

    // Convert document text into paragraphs
    const content = extractedText
        .split(/\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    return content;
};

// Generate excerpt automatically
const generateExcerpt = (content, maxLength = 180) => {
    const text = content.join(" ").replace(/\s+/g, " ").trim();

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength).trim()}...`;
};

// Calculate reading time automatically
const generateReadingTime = (content) => {
    const text = content.join(" ");
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    const minutes = Math.max(1, Math.ceil(wordCount / 200));

    return `${minutes} min read`;
};

// Parse tags submitted by frontend
const parseTags = (tags) => {
    if (!tags) return [];

    // If tags are already an array
    if (Array.isArray(tags)) {
        return [...new Set(
            tags.map((tag) => String(tag).trim()).filter(Boolean)
        )];
    }

    if (typeof tags !== "string") {
        throw new Error("Tags must be a valid string or array.");
    }

    const trimmedTags = tags.trim();

    if (!trimmedTags) return [];

    let parsedTags;

    // Support JSON array: ["React", "Node.js"]
    if (trimmedTags.startsWith("[")) {
        try {
            parsedTags = JSON.parse(trimmedTags);
        } catch {
            throw new Error("Tags must be a valid JSON array.");
        }

        if (!Array.isArray(parsedTags)) {
            throw new Error("Tags must be a valid JSON array.");
        }
    } else {
        // Support comma-separated text: React, Node.js
        parsedTags = trimmedTags.split(",");
    }

    return [...new Set(
        parsedTags
            .map((tag) => String(tag).trim())
            .filter(Boolean)
    )];
};

// Validate form data and content
const validateBlog = ({ title, date, content, tags }) => {
    if (!title?.trim()) {
        throw new Error("Blog title is required.");
    }

    if (title.trim().length > 200) {
        throw new Error("Blog title cannot exceed 200 characters.");
    }

    if (!date) {
        throw new Error("Publication date is required.");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error("Date must be in YYYY-MM-DD format.");
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== date
    ) {
        throw new Error("Please provide a valid calendar date.");
    }

    if (!content?.length) {
        throw new Error("Blog content cannot be empty.");
    }

    if (content.join("\n").length > 200000) {
        throw new Error("Blog content exceeds the allowed length.");
    }

    if (tags.length > 20) {
        throw new Error("You can add a maximum of 20 tags.");
    }
};

// Main import service
export const importBlogService = async ({
    documentFile,
    coverImageFile,
    formData,
    userId,
}) => {
    const title = formData.title?.trim();
    const date = formData.date;
    const tags = parseTags(formData.tags);

    // Extract only the main content from the document
    const content = await extractBlogContent(documentFile);

    validateBlog({
        title,
        date,
        content,
        tags,
    });

    // Generate remaining fields in backend
    const slug = generateSlug(title);
    const excerpt = generateExcerpt(content);
    const readingTime = generateReadingTime(content);

    // Replace this with your image-storage URL if using Cloudinary/S3.
    // Do not store the raw image buffer in this field.
    const coverImage = coverImageFile
        ? await uploadCoverImage(coverImageFile)
        : "";

    try {
        const blog = await Blog.create({
            title,
            slug,
            excerpt,
            date,
            readingTime,
            tags,
            coverImage,
            content,
            author: userId,
        });

        return blog;
    } catch (error) {
        if (error.code === 11000) {
            const duplicateError = new Error(
                "A blog with this title already exists. Please use a different title."
            );

            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        throw error;
    }
};

// const generateSlug = (title) => {
//     return title
//         .toLowerCase()
//         .trim()
//         .replace(/[^a-z0-9]+/g, "-")
//         .replace(/^-|-$/g, "");
// };

// const extractBlogData = (text) => {
//     const marker = /^BLOG CONTENT\s*:?\s*$/im;
//     const match = marker.exec(text);

//     if (!match) {
//         throw new Error("BLOG CONTENT section is missing.");
//     }

//     const metadataText = text.slice(0, match.index);
//     const articleText = text.slice(match.index + match[0].length);

//     const fieldNames = {
//         TITLE: "title",
//         SLUG: "slug",
//         EXCERPT: "excerpt",
//         DATE: "date",
//         "READING TIME": "readingTime",
//         TAGS: "tags",
//         "COVER IMAGE": "coverImage",
//     };

//     const metadata = {};
//     let currentField = null;

//     for (const line of metadataText.split(/\r?\n/)) {
//         const trimmed = line.trim();

//         const field = Object.keys(fieldNames).find((key) =>
//             trimmed.toUpperCase().startsWith(`${key}:`)
//         );

//         if (field) {
//             currentField = fieldNames[field];

//             metadata[currentField] = trimmed
//                 .slice(field.length + 1)
//                 .trim();
//         } else if (currentField && trimmed) {
//             metadata[currentField] += `\n${trimmed}`;
//         }
//     }

//     const title = metadata.title?.trim();

//     const content = articleText
//         .split(/\r?\n/)
//         .map((paragraph) => paragraph.trim())
//         .filter(Boolean);

//     return {
//         title,
//         slug: metadata.slug?.trim() || generateSlug(title || ""),
//         excerpt: metadata.excerpt?.trim(),
//         date: metadata.date?.trim(),
//         readingTime: metadata.readingTime?.trim(),
//         tags: (metadata.tags || "")
//             .split(",")
//             .map((tag) => tag.trim())
//             .filter(Boolean),
//         coverImage: metadata.coverImage?.trim() || "",
//         content,
//     };
// };

// const validateBlog = (blog) => {
//     const required = [
//         "title",
//         "slug",
//         "excerpt",
//         "date",
//         "readingTime",
//     ];

//     for (const field of required) {
//         if (!blog[field]) {
//             throw new Error(`${field} is required.`);
//         }
//     }

//     if (!/^\d{4}-\d{2}-\d{2}$/.test(blog.date)) {
//         throw new Error("Date must be in YYYY-MM-DD format.");
//     }

//     const parsedDate = new Date(`${blog.date}T00:00:00.000Z`);

//     if (
//         Number.isNaN(parsedDate.getTime()) ||
//         parsedDate.toISOString().slice(0, 10) !== blog.date
//     ) {
//         throw new Error("Please provide a valid calendar date.");
//     }

//     if (!blog.content?.length) {
//         throw new Error("Blog content cannot be empty.");
//     }

//     if (blog.content.join("\n").length > 200000) {
//         throw new Error("Blog content exceeds the allowed length.");
//     }

//     if (blog.slug.length > 150 || blog.title.length > 200) {
//         throw new Error("Title or slug is too long.");
//     }
// };

// export const importBlogService = async (file, userId) => {
    
//     const extension = path.extname(file.originalname).toLowerCase();

//     let extractedText;

//     if (extension === ".txt") {
//         extractedText = file.buffer.toString("utf8");
//     } else if (extension === ".docx") {
//         const result = await mammoth.extractRawText({
//             buffer: file.buffer,
//         });

//         extractedText = result.value;
//     } else {
//         throw new Error("Unsupported file format.");
//     }

//     if (!extractedText.trim()) {
//         throw new Error("Uploaded document is empty.");
//     }

//     const blogData = extractBlogData(extractedText);

//     validateBlog(blogData);

//     try {
//         const blog = await Blog.create({
//             ...blogData,
//             author: userId,
//         });

//         return blog;

//     } catch (error) {
//         if (error.code === 11000) {
//             const duplicateError = new Error(
//                 "A blog with this slug already exists."
//             );

//             duplicateError.statusCode = 409;
//             throw duplicateError;
//         }

//         throw error;
//     }
// };
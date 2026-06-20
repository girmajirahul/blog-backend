import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },


        title: {
            type: String,
            required: true,
            trim: true,
        },

        excerpt: {
            type: String,
            required: true,
            trim: true,
        },

        date: {
            type: String,
            required: true,
        },

        readingTime: {
            type: String,
            required: true,
        },

        tags: {
            type: [String],
            default: [],
        },

        coverImage: {
            type: String,
            default: "",
        },

        content: {
            type: [String],
            required: true,
            default: [],
        },


    },
    {
        timestamps: true,
    }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;

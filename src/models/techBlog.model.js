import mongoose from "mongoose";

const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },

    text: String,

    items: [String],

    language: String,

    filename: String,

    code: String,

    tone: String,

    src: String,

    alt: String,
  },
  { _id: false }
);

const techBlogSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },

    excerpt: {
      type: String,
      required: true,
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

    stack: {
      type: [String],
      default: [],
    },

    featured: {
      type: Boolean,
      default: false,
    },

    difficulty: {
      type: String,
      enum: [
        "Beginner",
        "Intermediate",
        "Advanced",
      ],
      default: "Intermediate",
    },

    content: [contentBlockSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "TechBlog",
  techBlogSchema
);
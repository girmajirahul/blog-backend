import express from "express";
import cors from "cors";
import helmet from "helmet";

import blogRoutes from "./routes/blog.routes.js";
import techBlogRoutes from "./routes/techBlog.routes.js";
const app = express();


app.use(cors({
  origin: "*",             // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(helmet());

app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Blog Backend Running 🚀"
  });
});

app.use("/api/blogs", blogRoutes);
app.use("/api/tech", techBlogRoutes);

export default app;
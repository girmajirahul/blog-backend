import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import techBlogRoutes from "./routes/techBlog.routes.js";
import contactRoutes from "./portfoliocontact/contact.route.js";
import subscribeRoutes from "./subscribe/subscribe.route.js";

const app = express();

// ✅ CORS FIX
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",  // Vite default
    "http://localhost:4173",  // Vite preview
    "https://blog-frontend-rahul.vercel.app",
    process.env.FRONTEND_URL, // Vercel URL production mein
  ].filter(Boolean),
  credentials: true,          // ← YEH ADD KARO
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());
app.use(helmet({
  crossOriginResourcePolicy: false, // ← helmet ko thoda relax karo
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Blog Backend Running 🚀"
  });
});

app.use("/api/auth",  authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/tech",  techBlogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/subscribe", subscribeRoutes);

export default app;
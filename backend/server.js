// server.js (ESM version)
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import diagramRoutes from "./routes/diagramRoutes.js";
import studentIdeaRoutes from "./routes/studentIdeaRoutes.js";
import teacherUploadRoutes from "./routes/teacherUploadRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import teacherDashboardRoutes from "./routes/teacherDashboardRoutes.js";
import teacherProgressRoutes from "./routes/teacherProgressRoutes.js";
import teacherIssueRoutes from "./routes/teacherIssueRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { seedAdminUser } from "./models/User.js";
import { seedRoles } from "./models/Role.js";
import { errorHandler } from "./middleware/errorHandler.js";

console.log("🚀 Server.js file started (ESM)...");

// Load environment variables
dotenv.config();

console.log("📋 After dotenv, MONGODB_URI =", process.env.MONGODB_URI);

const app = express();

// Prefer .env PORT but default 4000 to match admin backend
const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/diagram-editor";

console.log("🔧 PORT =", PORT);
console.log("🗄️ MONGODB_URI =", MONGODB_URI);

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Diagram Editor API running",
    status: "active",
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Try to load diagram routes
app.use("/api/diagrams", diagramRoutes);
console.log("✅ Diagram routes loaded successfully");

// Load student panel routes
app.use("/api/student-ideas", studentIdeaRoutes);
console.log("✅ Student ideas routes loaded successfully");

app.use("/api/teacher-uploads", teacherUploadRoutes);
console.log("✅ Teacher uploads routes loaded successfully");

app.use("/api/tasks", taskRoutes);
console.log("✅ Tasks routes loaded successfully");

app.use("/api/teams", teamRoutes);
console.log("✅ Teams routes loaded successfully");

app.use("/api/feedback", feedbackRoutes);
console.log("✅ Feedback routes loaded successfully");

app.use("/api/notifications", notificationRoutes);
console.log("✅ Notifications routes loaded successfully");

// Load teacher panel routes
app.use("/api/teacher/dashboard", teacherDashboardRoutes);
console.log("✅ Teacher dashboard routes loaded successfully");

app.use("/api/teacher/progress", teacherProgressRoutes);
console.log("✅ Teacher progress routes loaded successfully");

app.use("/api/teacher/issues", teacherIssueRoutes);
console.log("✅ Teacher issues routes loaded successfully");

// Load admin/auth routes
app.use("/api/auth", authRoutes);
console.log("✅ Auth routes loaded successfully");

app.use("/api/admin", adminRoutes);
console.log("✅ Admin routes loaded successfully");

// MongoDB Connection with better error handling
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("🔗 Mongoose connected to MongoDB");
    console.log("✅ MongoDB connected successfully!");
    console.log(`📊 Database: ${MONGODB_URI}`);

    // Seed admin user and roles
    await seedAdminUser();
    await seedRoles();


    // Start server after successful DB connection
    const server = app.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log("=====================================");
    });

    // Graceful shutdown signals
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        try {
          await mongoose.connection.close();
          console.log("✅ MongoDB connection closed");
          process.exit(0);
        } catch (error) {
          console.error("❌ Error during shutdown:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.error("💡 Please make sure MongoDB is running on your system");
    process.exit(1);
  });

// MongoDB connection events
mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose disconnected from MongoDB");
});

export default app;
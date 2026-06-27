import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // ✅ NEW

import { protect } from "./middleware/authMiddleware.js";

import path from "path";

// ================= CONFIG =================
dotenv.config();
connectDB();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ✅ serve uploaded files
app.use("/uploads", express.static("uploads"));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/achievements", achievementRoutes);

// ✅ NEW: Admin Report Routes
app.use("/api/admin", adminRoutes);

// ================= TEST ROUTES =================
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/test", protect, (req, res) => {
  res.json({ message: "Protected route working" });
});

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You are authorized",
    user: req.user,
  });
});

// ================= ERROR HANDLING =================
app.use((err, req, res, next) => {
  console.error("ERROR:", err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
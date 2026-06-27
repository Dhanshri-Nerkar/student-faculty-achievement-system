import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js"; // ✅ ADD THIS

import {
  addAchievement,
  getMyAchievements,
  getAllAchievements,
  updateAchievement,
  deleteAchievement,
  updateAchievementStatus,
} from "../controllers/achievementController.js";

const router = express.Router();

// ================= STUDENT & FACULTY =================

// ✅ ADD with file upload
router.post("/", protect, upload.single("certificate"), addAchievement);

// GET MY
router.get("/my", protect, getMyAchievements);


// ================= ADMIN =================

// GET ALL
router.get("/all", protect, getAllAchievements);

// UPDATE STATUS
router.put("/status/:id", protect, updateAchievementStatus);

// UPDATE FULL DATA
router.put("/:id", protect, updateAchievement);

// DELETE
router.delete("/:id", protect, deleteAchievement);


export default router;


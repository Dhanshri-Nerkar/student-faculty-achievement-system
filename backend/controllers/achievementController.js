import Achievement from "../models/Achievement.js";

// ================= ADD ACHIEVEMENT =================
export const addAchievement = async (req, res) => {
  try {
    const {
      event,
      achievementType,
      description,
      details,
      class: studentClass,
      department, // ✅ take from frontend also
    } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const achievement = await Achievement.create({
      // ✅ USER INFO
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,

      // ✅ COMMON FIELDS
      event,
      achievementType,
      description,
      details,

      // ✅ ROLE-BASED FIELDS (IMPORTANT FIX)
      prn: req.user.role === "student" ? req.user.prn : undefined,
      class: req.user.role === "student" ? studentClass : undefined,

      empId: req.user.role === "faculty" ? req.user.empId : undefined,

      // ✅ FIXED DEPARTMENT
      department: department || req.user.department || "",

      // ✅ CERTIFICATE
      certificate: req.file
        ? `http://localhost:5000/uploads/${req.file.filename}`
        : "",

      status: "pending",
    });

    res.status(201).json(achievement);
  } catch (error) {
    console.error("ADD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET MY ACHIEVEMENTS =================
export const getMyAchievements = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    let filter = {};

    // 👨‍🎓 STUDENT
    if (req.user.role === "student") {
      filter = {
        role: "student",
        prn: req.user.prn,
      };
    }

    // 👨‍🏫 FACULTY
    else if (req.user.role === "faculty") {
      filter = {
        role: "faculty",
        empId: req.user.empId,
      };
    }

    const achievements = await Achievement.find(filter).sort({
      createdAt: -1,
    });

    res.json(achievements);
  } catch (error) {
    console.error("GET MY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL =================
export const getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({
      createdAt: -1,
    });

    res.json(achievements);
  } catch (error) {
    console.error("GET ALL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE (ADMIN EDIT) =================
export const updateAchievement = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    // ✅ if new certificate uploaded
    if (req.file) {
      updateData.certificate = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const updated = await Achievement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Achievement not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE =================
export const deleteAchievement = async (req, res) => {
  try {
    const deleted = await Achievement.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Achievement not found" });
    }

    res.json({ message: "Achievement deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE STATUS =================
export const updateAchievementStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Achievement.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Achievement not found" });
    }

    res.json({
      message: "Status updated successfully",
      updated,
    });
  } catch (error) {
    console.error("STATUS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
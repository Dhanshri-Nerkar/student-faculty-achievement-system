import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "faculty"],
      required: true,
    },

    // 👨‍🎓 Student fields
    prn: {
      type: String,
    },

    class: {
      type: String,
      enum: ["FY", "SY", "TY", "B.Tech"],
    },

    // 👨‍🏫 Faculty fields
    empId: {
      type: String,
    },

    // 📌 Common fields
    department: {
      type: String,
    },

    event: {
      type: String,
      required: true,
    },

    // 🎯 Student Achievement Type
    achievementType: {
      type: String,
      enum: [
        "Participation",
        "Winner 1st Position",
        "Winner 2nd Position",
        "Winner 3rd Position",
        "1st Runner Up",
        "2nd Runner Up",
        "Intern",
        "Other",
      ],
    },

    // 📝 Description (for BOTH student & faculty)
    description: {
      type: String,
    },

    // 👨‍🏫 Faculty Details (extra info)
    details: {
      type: String,
    },

    // 📄 Certificate File
    certificate: {
      type: String, // file URL/path
    },

    // 📊 Status (Admin control)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;
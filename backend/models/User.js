import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      required: true,
    },

    // Student PRN
    prn: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      default: null,
    },

    // Faculty Employee ID
    empId: {
      type: String,
      required: function () {
        return this.role === "faculty";
      },
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
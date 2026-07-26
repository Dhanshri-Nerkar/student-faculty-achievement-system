import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import nodemailer from "nodemailer";

// temporary OTP store
let otpStore = {};

console.log("Sending OTP using Brevo...");
// ================= SEND OTP =================
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 465,
      secure: false,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "OTP Verification - Student & Faculty Achievement System",
      text: `Your OTP is ${otp}`,
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for a short time.</p>
      `,
    });

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("========== OTP ERROR ==========");
    console.error(error);
    console.error("BREVO_USER:", process.env.BREVO_USER);
    console.error("BREVO_PASS exists:", !!process.env.BREVO_PASS);
    console.error("SENDER_EMAIL:", process.env.SENDER_EMAIL);
    console.error("===============================");

    res.status(500).json({
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

console.log("OTP sent successfully!");

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, prn, empId, otp, department } = req.body;

    // OTP check
    if (otpStore[email] != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      prn: role === "student" ? prn : undefined,
      empId: role === "faculty" ? empId : undefined,
      department: department || "", 
    });

    delete otpStore[email];

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user), 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { password, prn, empId, role, email } = req.body;

    // ADMIN LOGIN
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return res.json({
        name: "Admin",
        email,
        role: "admin",
        token: generateToken({
          _id: "admin123",
          name: "Admin",
          email,
          role: "admin",
        }), 
      });
    }

    let user;

    // 👨‍🎓 STUDENT LOGIN
    if (role === "student") {
      user = await User.findOne({ prn });
    }

    // 👨‍🏫 FACULTY LOGIN
    else if (role === "faculty") {
      user = await User.findOne({ empId });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid PRN/EmpID or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        prn: user.prn,
        empId: user.empId,
        department: user.department,
        token: generateToken(user), 
      });
    } else {
      res.status(401).json({
        message: "Invalid PRN/EmpID or password",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
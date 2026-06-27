import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ADMIN LOGIN
      if (decoded.role === "admin") {
        req.user = decoded;
        return next();
      }

      // STUDENT / FACULTY
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } else {
      return res.status(401).json({ message: "No token" });
    }
  } catch (error) {
    console.log("AUTH ERROR:", error.message);

    return res.status(401).json({ message: "Invalid token" });
  }
};
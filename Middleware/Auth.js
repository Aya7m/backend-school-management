import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
console.log("USER ROLE:", req.user.role);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const role = (...roles) => {
  return (req, res, next) => {
    console.log("ROLES ARRAY:", roles);
    console.log("USER ROLE:", req.user.role);

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
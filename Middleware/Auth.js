import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// export const auth = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({ message: "No token" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id).select("-password");

//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     req.user = user;
// console.log("USER ROLE:", req.user.role);
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
// };

export const auth = async (req, res, next) => {
   console.log("🔥 AUTH HIT");
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    console.log("USER SET:", user._id, user.role);

    next();
  } catch (error) {
    console.log("AUTH ERROR:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
export const role = (...roles) => {
  return (req, res, next) => {
    console.log("ROLES ARRAY:", roles);
    console.log("USER ROLE:", req.user?.role); // 👈 safe

    if (!req.user?.role) {
      return res.status(403).json({ message: "No role found" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
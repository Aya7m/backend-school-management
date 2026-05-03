import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../Middleware/cloudinary.js";

// geneate token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "5d" },
  );
};

// signup
export const SignUp = async (req, res) => {
  try {
    const { firstName, secondName, email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "email already exists" });
    }
    // check length of password
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at lest 6 char " });
    }
    // check email pater

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName,
      secondName,
      email,
      password: hashPassword,
      role: role || "student",
    });
    const token = generateToken(newUser);
    res
      .status(201)
      .json({ message: "user created successfully", newUser, token });
  } catch (error) {
    res.json({ message: "error in signup", error });
  }
};

// signin
export const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "email not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "invalid password" });
    }
    const token = generateToken(user);

    const { password: _, ...safeUser } = user._doc;

    return res.json({
      message: "user signed in successfully",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.log("SIGNIN ERROR:", error); // 👈 مهم جدًا

    return res.status(500).json({
      message: "error in signin",
      error: error.message,
    });
  }
};

// controllers/user.controller.js

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const { firstName, secondName, email, password } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update fields
    if (firstName) user.firstName = firstName;
    if (secondName) user.secondName = secondName;
    if (email) user.email = email;

    // 🔐 update password
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }

    await user.save();

    const { password: _, ...safeUser } = user._doc;

    res.json({
      message: "Profile updated",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/user.controller.js

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("FILE:", req.file);
    // تحويل الصورة لـ base64
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "school/users",
    });

    console.log("CLOUD RESULT:", result);

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: result.secure_url },
      { new: true },
    );

    res.json({
      message: "Image uploaded",
      image: result.secure_url,
      user,
    });
  } catch (error) {
    console.log("CLOUD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

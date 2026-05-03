import { Router } from "express";
import {
  getAllUsers,
  SignIn,
  SignUp,
  updateProfile,
  uploadProfileImage,
} from "../controllers/userController.js";
import { auth } from "../Middleware/Auth.js";
import { upload } from "../Middleware/multer.js";

const userRouter = Router();

userRouter.post("/register", SignUp);
userRouter.post("/login", SignIn);
userRouter.put("/profile", auth, updateProfile);
userRouter.post(
  "/upload-image",
  auth,
  upload.single("image"),
  uploadProfileImage,
);
userRouter.get("/user/all", auth, getAllUsers);
export default userRouter;

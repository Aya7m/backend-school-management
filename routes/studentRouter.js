import { Router } from "express";
import {   getStudentDashboard, getStudentGrades } from "../controllers/studentController.js";
import { auth, role } from "../Middleware/Auth.js";

const studentRouter = Router();

studentRouter.get(
  "/dashboard",
  auth,
  role("student"),
  getStudentDashboard,
)
studentRouter.get(
  "/grades",
  auth,
  role("student"),
  getStudentGrades
);


export default studentRouter
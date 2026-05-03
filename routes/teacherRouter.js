import { Router } from "express";
import { createAttendance, getMyClasses, getMyStudents, getMySubjects, getStudentReport, getTeacherDashboard, saveExams, saveWeeklyGrades } from "../controllers/teacherCreater.js";
import { auth, role } from "../Middleware/Auth.js";

const teacherRouter = Router();
teacherRouter.get('/classes', auth, role("teacher"), getMyClasses);
teacherRouter.get('/students/:classId', auth, role("teacher"), getMyStudents);
teacherRouter.get('/subjects', auth, role("teacher"), getMySubjects);
teacherRouter.post('/attendance',auth,role("teacher"),createAttendance)
teacherRouter.get("/report/:studentId",  role("teacher", "admin"), getStudentReport);
teacherRouter.post("/grades/weekly", auth, role("teacher"), saveWeeklyGrades);
teacherRouter.post("/grades/exams", auth, role("teacher"), saveExams);
teacherRouter.get(
  "/dashboard",
  auth,
  role("teacher"),
  getTeacherDashboard
);
export default teacherRouter;

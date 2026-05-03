import {Router} from 'express'
import {
  addStudent,
  assignSubjectToTeacher,
  createAttendance,
  createClass,
  createSubject,
  createTeachers,
  deleteStudent,
  deleteTeacher,
  getAdminDashboard,
  getAllClasses,
  getAllStudents,
  getAllSubjects,
  getAllTeachers,
  getClassAttendance,
  getStudentAttendance,
 
} from "../controllers/adminCreater.js";
import { auth, role } from "../Middleware/Auth.js";

const adminRouter = Router();
adminRouter.post("/create-teacher", auth, role("admin"), createTeachers);
adminRouter.get("/teachers", auth, role("admin"), getAllTeachers);
adminRouter.delete(
  "/delete-teacher/:teacherId",
  auth,
  role("admin"),
  deleteTeacher,
);
adminRouter.post("/create-class", auth, role("admin"), createClass);
adminRouter.get("/classes", auth, role("admin"), getAllClasses);
adminRouter.post("/create-subject", auth, role("admin"), createSubject);
adminRouter.get("/subjects", auth, role("admin"), getAllSubjects);
adminRouter.post("/create-attendance", auth, role("teacher"), createAttendance);
adminRouter.get(
  "/student-attendance/:studentId",
  auth,
  role("admin", "teacher"),
  getStudentAttendance,
);
adminRouter.get(
  "/class-attendance/:classId",
  auth,
  role("admin", "teacher"),
  getClassAttendance,
);
adminRouter.get("/dashboard", auth, role("admin"), getAdminDashboard);
adminRouter.put(
  "/assign-subject-to-teacher",
  auth,
  role("admin"),
  assignSubjectToTeacher,
);


adminRouter.post('/create-student',auth,role('admin'),addStudent)
adminRouter.get('/students',auth,role('admin'),getAllStudents)
adminRouter.delete('/delete-student/:studentId',auth,role('admin'),deleteStudent)

export default adminRouter;

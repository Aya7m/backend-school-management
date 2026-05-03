import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { Class } from "../models/class.model.js";
import { Subject } from "../models/subject.js";
import { Attendance } from "../models/attendance.model.js";

import mongoose from "mongoose";

export const createTeachers = async (req, res) => {
  try {
    const {
      firstName,
      secondName,
      email,
      password,
      subject,
      classes,
      profilePicture,
    } = req.body;

    // validation
    if (!firstName || !secondName || !email || !password) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // check exists
    const existingTeacher = await User.findOne({ email });

    if (existingTeacher) {
      return res.status(400).json({
        message: "Teacher already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create teacher
    const teacher = await User.create({
      firstName,
      secondName,
      email,
      password: hashedPassword,
      role: "teacher",
      subject,
      classes,
      profilePicture,
    });

    const { password: _, ...safeTeacher } = teacher._doc;

    return res.status(201).json({
      message: "Teacher created successfully",
      teacher: safeTeacher,
    });
  } catch (error) {
    console.log("CREATE TEACHER ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// create class

export const createClass = async (req, res) => {
  try {
    const { name, section, students } = req.body;

    // 1️⃣ validation
    if (!name || !section) {
      return res.status(400).json({
        message: "Name and section are required",
      });
    }

    // 2️⃣ check if class already exists (اختياري)
    const existingClass = await Class.findOne({ name, section });

    if (existingClass) {
      return res.status(400).json({
        message: "Class already exists",
      });
    }

    // 4️⃣ create class
    const newClass = await Class.create({
      name,
      section,
      students: students || [],
    });

    return res.status(201).json({
      message: "Class created successfully",
      class: newClass,
    });
  } catch (error) {
    console.log("CREATE CLASS ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// get all classes
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()

      .populate("students", "firstName secondName email");

    return res.status(200).json({
      message: "Classes fetched successfully",
      classes,
    });
  } catch (error) {
    console.log("GET ALL CLASSES ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// create subject

export const createSubject = async (req, res) => {
  try {
    const { name, classId, teacherId } = req.body;

    // 1️⃣ validation
    if (!name || !classId || !teacherId) {
      return res.status(400).json({
        message: "Name, classId and teacherId are required",
      });
    }

    // 2️⃣ check class exists
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return res.status(404).json({
        message: "Class not found",
      });
    }

    // 3️⃣ check teacher exists + role
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({
        message: "Invalid teacher",
      });
    }

    // 4️⃣ منع تكرار نفس المادة في نفس الكلاس
    const subjectExists = await Subject.findOne({
      name,
      class: classId,
    });

    if (subjectExists) {
      return res.status(400).json({
        message: "Subject already exists in this class",
      });
    }

    // 5️⃣ create subject
    const subject = await Subject.create({
      name,
      class: classId,
      teacher: teacherId,
    });

    return res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    console.log("CREATE SUBJECT ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("class", "name section")
      .populate("teacher", "firstName secondName email");

    return res.status(200).json({
      message: "Subjects fetched successfully",
      subjects,
    });
  } catch (error) {
    console.log("GET ALL SUBJECTS ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// create attendance

export const createAttendance = async (req, res) => {
  try {
    const { studentId, subjectId, classId, date, present, teacherId } =
      req.body;

    // 1️⃣ validation
    if (!studentId || !subjectId || !classId || !date) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2️⃣ check student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({
        message: "Invalid student",
      });
    }

    // 3️⃣ check subject
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // 4️⃣ create attendance
    const attendance = await Attendance.create({
      student: studentId,
      subject: subjectId,
      class: classId,
      date,
      present: present ?? false,
      takenBy: teacherId,
    });
 

    return res.status(201).json({
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    console.log("ATTENDANCE ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// get student attendance

export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const attendance = await Attendance.find({ student: studentId })
      .populate("student", "firstName secondName")
      .populate("subject", "name")
      .populate("class", "name section");

    return res.status(200).json({
      message: "Student attendance fetched",
      attendance,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching attendance",
      error: error.message,
    });
  }
};

// get class attendance

export const getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;

    const attendance = await Attendance.find({ class: classId })
      .populate("student", "firstName secondName")
      .populate("subject", "name");

    return res.status(200).json({
      message: "Class attendance fetched",
      attendance,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching class attendance",
      error: error.message,
    });
  }
};

// admin dashboard
export const getAdminDashboard = async (req, res) => {
  try {
    const studentsCount = await User.countDocuments({
      role: "student",
    });
    const teachersCount = await User.countDocuments({ role: "teacher" });
    const classesCount = await Class.countDocuments();
    const subjectsCount = await Subject.countDocuments();

    return res.status(200).json({
      studentsCount,
      teachersCount,
      classesCount,
      subjectsCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error loading admin dashboard",
      error: error.message,
    });
  }
};

export const getStudentChart = async (req, res) => {
  try {
    const { studentId } = req.params;

    // درجات الطالب
    const grades = await Grade.find({ student: studentId }).populate(
      "subject",
      "name",
    );

    // الحضور
    const attendance = await Attendance.find({ student: studentId });

    // تجهيز بيانات الدرجات
    const gradesData = grades.map((g) => ({
      subject: g.subject.name,
      score: g.score,
    }));

    // نسبة الحضور
    const presentCount = attendance.filter((a) => a.present).length;
    const attendanceRate =
      attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;

    return res.status(200).json({
      gradesData,
      attendanceRate,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error generating chart data",
      error: error.message,
    });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .populate("subject", "name")
      .select("-password -__v");
    return res.status(200).json({
      message: "Teachers fetched successfully",
      teachers,
    });
  } catch (error) {
    console.log("GET TEACHERS ERROR:", error);
    return res.status(500).json({
      message: "Error fetching teachers",
      error: error.message,
    });
  }
};

// delete teacher
export const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({
        message: "Invalid teacher",
      });
    }
    await User.findByIdAndDelete(teacherId);

    return res.status(200).json({
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting teacher",
      error: error.message,
    });
  }
};

export const assignSubjectToTeacher = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.body;

    console.log(req.body);

    if (!teacherId || !subjectId) {
      return res.status(400).json({ message: "Missing data" });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    teacher.subject = subjectId;
    await teacher.save();

    const updatedTeacher = await User.findById(teacherId).populate("subject");

    return res.status(200).json({
      message: "Assigned successfully",
      teacher: updatedTeacher,
    });
  } catch (error) {
    console.log("ASSIGN ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// add student
export const addStudent = async (req, res) => {
  try {
    const { firstName, secondName, email, password, classId, age } = req.body;

    if (!firstName || !secondName || !email || !password || !classId || !age) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "password must be 6 at lest",
      });
    }

    // check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already in use",
      });
    }

    // hash-password
    const hashPassword = await bcrypt.hash(password, 10);
    // create student
    const student = await User.create({
      firstName,
      secondName,
      email,
      password: hashPassword,
      role: "student",
      age,

      class: classId,
    });

    return res.status(201).json({
      message: "Student added successfully",
      student,
    });
  } catch (error) {
    console.log("ADD STUDENT ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).populate(
      "class",
      "name section",
    );
    return res.status(200).json({
      message: "Students fetched successfully",
      students,
    });
  } catch (error) {
    console.log("GET STUDENTS ERROR:", error);
    return res.status(500).json({
      message: "Error fetching students",
      error: error.message,
    });
  }
};

// delete student
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({
        message: "Invalid student",
      });
    }
    await User.findByIdAndDelete(studentId);

    return res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting student",
      error: error.message,
    });
  }
};

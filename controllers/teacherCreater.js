// get class by teacher
import { User } from "../models/user.model.js";
import { Subject } from "../models/subject.js";
import { Attendance } from "../models/attendance.model.js";
import { Grade } from "../models/grids.js";

export const getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const classes = await Subject.find({ teacher: teacherId }).populate(
      "class",
      "name section",
    );

    console.log("TEACHER ID:", teacherId);
    console.log("CLASSES:", classes);

    res.status(200).json({ classes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// get my students
export const getMyStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const students = await User.find({
      class: classId,
      role: "student",
    }).select("firstName secondName email");
    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get my subjects
export const getMySubjects = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const subjects = await Subject.find({ teacher: teacherId });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAttendance = async (req, res) => {
  try {
    const { classId, subjectId, date, attendance } = req.body;
    const teacherId = req.user._id;

    const formattedDate = date || new Date().toISOString().split("T")[0];

    const data = attendance.map((item) => ({
      student: item.studentId,
      class: classId,
      subject: subjectId,
      date: formattedDate,
      status: item.present ? "present" : "absent",
      takenBy: teacherId,
    }));

    await Attendance.insertMany(data, { ordered: false });

    res.status(201).json({
      message: "Attendance saved successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Attendance already taken for some students",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

export const getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 📊 Attendance
    const attendance = await Attendance.find({ student: studentId });

    const totalAttendance = attendance.length;
    const presentCount = attendance.filter(
      (a) => a.status === "present",
    ).length;

    const absentCount = totalAttendance - presentCount;

    const attendancePercentage =
      totalAttendance === 0
        ? 0
        : ((presentCount / totalAttendance) * 100).toFixed(2);

    // 📊 Grades
    const grades = await Grade.find({ student: studentId });

    const totalGrades = grades.reduce((acc, g) => acc + g.total, 0);

    // 🎯 performance logic
    let status = "Weak";

    if (attendancePercentage >= 85 && totalGrades >= 80) {
      status = "Excellent";
    } else if (attendancePercentage >= 70 && totalGrades >= 60) {
      status = "Good";
    }

    res.json({
      attendance: {
        total: totalAttendance,
        present: presentCount,
        absent: absentCount,
        percentage: attendancePercentage,
      },
      grades: {
        total: totalGrades,
      },
      status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const createGrades = async (req, res) => {
//   try {
//     const { classId, subjectId, grades } = req.body;
//     const teacherId = req.user._id;

//     if (!grades?.length) {
//       return res.status(400).json({ message: "No grades provided" });
//     }

//     const data = grades.map((g) => {
//       // 🎯 validation
//       if (g.exam > 40) throw new Error("Exam max is 40");
//       if (g.behavior > 10) throw new Error("Behavior max is 10");
//       if (g.homework > 10) throw new Error("Homework max is 10");
//       if (g.weekly > 20) throw new Error("Weekly max is 20");

//       // 🎯 total (من 100)
//       const total =
//         (g.weekly || 0) +
//         (g.behavior || 0) +
//         (g.homework || 0) +
//         (g.exam || 0);

//       return {
//         student: g.studentId,
//         class: classId,
//         subject: subjectId,
//         weekly: g.weekly,
//         behavior: g.behavior,
//         homework: g.homework,
//         exam: g.exam,
//         total,
//         takenBy: teacherId,
//       };
//     });

//     await Grade.insertMany(data);

//     res.status(201).json({
//       message: "Grades saved successfully",
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const saveWeeklyGrades = async (req, res) => {
  const { classId, subjectId, weekNumber, grades } = req.body;

  for (const g of grades) {
    let record = await Grade.findOne({
      student: g.studentId,
      class: classId,
      subject: subjectId,
    });

    if (!record) {
      record = await Grade.create({
        student: g.studentId,
        class: classId,
        subject: subjectId,
        weeks: [],
      });
    }

    const exists = record.weeks.find((w) => w.weekNumber === weekNumber);

    if (!exists) {
      record.weeks.push({
        weekNumber,
        weekly: g.weekly,
        behavior: g.behavior,
        homework: g.homework,
      });

      await record.save();
    }
  }

  res.json({ message: "Weekly saved" });
};

export const saveExams = async (req, res) => {
  const { studentId, classId, subjectId, monthExam1, monthExam2, finalExam } =
    req.body;

  let grade = await Grade.findOne({
    student: studentId,
    class: classId,
    subject: subjectId,
  });

  if (!grade) {
    grade = await Grade.create({
      student: studentId,
      class: classId,
      subject: subjectId,
    });
  }

  grade.monthExam1 = monthExam1;
  grade.monthExam2 = monthExam2;
  grade.finalExam = finalExam;

  await grade.save();

  res.json({ message: "Exams saved" });
};
export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // 📚 subjects (classes linked to teacher)
    const subjects = await Subject.find({ teacher: teacherId });

    // 👨‍🎓 students (unique by classes teacher teaches)
    const classIds = subjects.map((s) => s.class);

    const students = await User.find({
      class: { $in: classIds },
      role: "student",
    });

    // 📊 attendance count
    const attendanceCount = await Attendance.countDocuments({
      takenBy: teacherId,
    });

    // 📝 grades count
    const gradesCount = await Grade.countDocuments({
      takenBy: teacherId,
    });

    res.json({
      classes: subjects.length,
      students: students.length,
      attendance: attendanceCount,
      grades: gradesCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

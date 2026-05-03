import { Attendance } from "../models/attendance.model.js";
import { Grade } from "../models/grids.js";



export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 📊 Attendance
    const attendance = await Attendance.find({ student: studentId });

    const total = attendance.length;
    const present = attendance.filter(
      (a) => a.status === "present"
    ).length;
    const absent = total - present;

    const percentage =
      total === 0 ? 0 : Number(((present / total) * 100).toFixed(2));

    // 🎓 Grades
    const grades = await Grade.find({ student: studentId }).populate(
      "subject",
      "name"
    );

    // 🔥 تنظيف البيانات
    const cleanGrades = grades.filter(
      (g) => g && g.subject
    );

    // 📊 تحويل الداتا
    const subjectsGrades = cleanGrades.map((g) => {
      const weeks = g.weeks || [];

      // 🔥 آخر أسبوع فعلي
      const lastWeek =
        weeks.length > 0
          ? Math.max(...weeks.map((w) => w.weekNumber || 0))
          : 0;

      // 📊 عدد الأسابيع
      const weeksCount = weeks.length;

      // 🎯 Grade Letter
      let gradeLetter = "F";
      if (g.total >= 80) gradeLetter = "A";
      else if (g.total >= 70) gradeLetter = "B";
      else if (g.total >= 60) gradeLetter = "C";
      else if (g.total >= 50) gradeLetter = "D";

      return {
        subjectName: g.subject?.name || "Unknown",

        total: g.total || 0,
        grade: gradeLetter,

        weeksCount,
        lastWeek,
      };
    });

    // 🔢 Average Grades
    const totalGradesSum = cleanGrades.reduce(
      (acc, g) => acc + (g.total || 0),
      0
    );

    const avgGrades =
      cleanGrades.length === 0
        ? 0
        : Number((totalGradesSum / cleanGrades.length).toFixed(2));

    // 🎯 Status logic
    let status = "Weak";

    if (percentage >= 85 && avgGrades >= 80) {
      status = "Excellent";
    } else if (percentage >= 70 && avgGrades >= 60) {
      status = "Good";
    }

    // 🚀 Response النهائي
    res.json({
      name:
        req.user.firstName + " " + req.user.secondName,

      attendance: {
        total,
        present,
        absent,
        percentage,
      },

      grades: {
        average: avgGrades,
        subjects: subjectsGrades,
      },

      status,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const getStudentGrades = async (req, res) => {
  try {
    const studentId = req.user._id;

    const grades = await Grade.find({ student: studentId }).populate(
      "subject",
      "name",
    );

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

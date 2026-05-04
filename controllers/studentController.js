import { Attendance } from "../models/attendance.model.js";



import { Grade } from "../models/grades.js";

// 🎓 Grade Letter
const getGradeLetter = (total = 0) => {
  const t = Number(total) || 0;

  if (t >= 80) return "A";
  if (t >= 70) return "B";
  if (t >= 60) return "C";
  if (t >= 50) return "D";
  return "F";
};

export const getStudentDashboard = async (req, res) => {
  console.log("🔥 DASHBOARD HIT");
  try {
    const studentId = req.user._id;

    // attendance
    const attendance = await Attendance.find({ student: studentId });

    // grades
    const grades = await Grade.find({ student: studentId })
      .populate("subject", "name")
      .lean();

    const subjects = grades.map((g) => {
      const weeks = g.weeks || [];

      const total =
        weeks.reduce((a, w) => a + (w.weekly || 0), 0) +
        (g.monthExam1 || 0) +
        (g.monthExam2 || 0) +
        (g.finalExam || 0);

      const weeksCount = weeks.filter((w) => w.weekly > 0).length;

      return {
        subjectName: g.subject?.name,
        weeksCount,
        monthExam1: g.monthExam1,
        monthExam2: g.monthExam2,
        finalExam: g.finalExam,
        total,
        grade: getGradeLetter(total),
      };
    });

    const average =
      subjects.length > 0
        ? subjects.reduce((a, s) => a + s.total, 0) / subjects.length
        : 0;

    res.json({
      name: req.user.name,
      status: req.user.status || "Active",

      attendance: {
        present: attendance.length,
        absent: 0,
        percentage: 100,
      },

      grades: {
        subjects,
        average: Number(average.toFixed(1)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentGrades = async (req, res) => {
  try {
    const studentId = req.user._id;

    const grades = await Grade.find({ student: studentId })
      .populate("subject", "name")
      .lean();

    const formatted = grades.map((g) => ({
      _id: g._id,
      subject: g.subject,
      weeks: g.weeks || [],

      monthExam1: g.monthExam1 || 0,
      monthExam2: g.monthExam2 || 0,
      finalExam: g.finalExam || 0,

      total:
        (g.weeks?.reduce((a, w) => a + (w.weekly || 0), 0) || 0) +
        (g.monthExam1 || 0) +
        (g.monthExam2 || 0) +
        (g.finalExam || 0),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

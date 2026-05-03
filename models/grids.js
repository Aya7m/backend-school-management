import mongoose from "mongoose";

const weekSchema = new mongoose.Schema({
  weekNumber: Number,
  weekly: { type: Number, default: 0 },
  behavior: { type: Number, default: 0 },
  homework: { type: Number, default: 0 },
});

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },

  weeks: [weekSchema],

  monthExam1: { type: Number, default: 0 },
  monthExam2: { type: Number, default: 0 },
  finalExam: { type: Number, default: 0 },

  total: { type: Number, default: 0 },
});

gradeSchema.methods.calculateTotal = function () {
  const weeks = this.weeks || [];

  const weeklyAvg =
    weeks.reduce((s, w) => s + (w.weekly || 0), 0) / 13;

  const behaviorAvg =
    weeks.reduce((s, w) => s + (w.behavior || 0), 0) / 13;

  const homeworkAvg =
    weeks.reduce((s, w) => s + (w.homework || 0), 0) / 13;

  const weeklyScore =
    (weeklyAvg + behaviorAvg + homeworkAvg); // 60%

  const examsScore =
    (this.monthExam1 || 0) +
    (this.monthExam2 || 0) +
    (this.finalExam || 0); // 40%

  this.total = weeklyScore + examsScore;
};

gradeSchema.index({ student: 1, class: 1, subject: 1 }, { unique: true });
gradeSchema.pre("save", async function () {
  this.calculateTotal();
});

export const Grade = mongoose.model("Grade", gradeSchema);

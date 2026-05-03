import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // مثال: Grade 1
    },

    section: {
      type: String,
      required: true,
      trim: true, // مثال: A / B
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // اختياري: المدرس المسؤول عن الكلاس (مش مدرس المواد)
    // classTeacher: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   default: null,
    // },
  },
  { timestamps: true }
);

export const Class = mongoose.model("Class", classSchema);
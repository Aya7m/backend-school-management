import express from "express";
import { connectToDB } from "./lib/dbConnection.js";
import cors from "cors";
import dotenv from "dotenv";

import userRouter from "./routes/userRouter.js";
import teacherRouter from "./routes/teacherRouter.js";
import studentRouter from "./routes/studentRouter.js";
import adminRouter from "./routes/adminRouter.js";

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/student", studentRouter);

app.get("/", (req, res) => res.send("Hello World!"));

// 🚀 start server بعد الاتصال بالـ DB
const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
};

startServer();
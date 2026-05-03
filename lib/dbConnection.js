import mongoose from "mongoose";

export const connectToDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL);

    console.log("Connected to MongoDB ✅");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
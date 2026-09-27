import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resume_reviewer";

export async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log("mongodb connected:", mongoose.connection.name);
}
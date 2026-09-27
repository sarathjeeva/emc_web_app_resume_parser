import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    sizeKB: { type: Number, required: true },
    pages: { type: Number, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", resumeSchema);

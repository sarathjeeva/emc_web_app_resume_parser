import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    sizeKB: { type: Number, required: true },
    pages: { type: Number, required: true },
    content: { type: String, required: true },
    jobDescription: { type: String, required: true },
    analysis: {
      score: { type: Number, required: true },
      summary: { type: String, required: true },
      strengths: [String],
      gaps: [String],
      recommendations: [String],
      matchedKeywords: [String],
      missingKeywords: [String],
    },
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", resumeSchema);
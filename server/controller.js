import { connectDB } from "./db.js";
import { compareResumeToJob, extractResumeText, getResume, listResumes, saveResume } from "./service.js";

export async function analyzeResume(req, res) {
  if (!req.file) return res.status(400).json({ success: false, error: "Add a PDF in the 'resume' field." });

  const jobDescription = String(req.body?.jobDescription || "").trim();
  if (jobDescription.length < 50) {
    return res.status(400).json({ success: false, error: "The job description must contain at least 50 characters." });
  }
  if (jobDescription.length > 15000) {
    return res.status(400).json({ success: false, error: "The job description must be 15,000 characters or fewer." });
  }

  try {
    await connectDB();
    const { text, pages } = await extractResumeText(req.file.buffer);
    const { analysis, creditsPercentLeft } = await compareResumeToJob({ resumeText: text, jobDescription });
    const record = {
      fileName: req.file.originalname,
      sizeKB: +(req.file.size / 1024).toFixed(1),
      pages,
      content: text,
      jobDescription,
      analysis,
    };
    const saved = await saveResume(record);

    return res.json({
      success: true,
      id: saved._id,
      file: { name: record.fileName, sizeKB: record.sizeKB, pages },
      analysis,
      credits: { percentLeft: creditsPercentLeft },
    });
  } catch (err) {
    console.error("resume analysis failed:", err.error || err.message);
    const isDatabaseError = err.name?.startsWith("Mongo") || err.name === "MongooseError";
    return res.status(err.status || (isDatabaseError ? 503 : 500)).json({
      success: false,
      error: err.error || (isDatabaseError ? "The database is unavailable. Please try again." : "Something went wrong while reviewing the resume."),
    });
  }
}

export const uploadResume = analyzeResume;

export async function getAllResumes(req, res) {
  try {
    await connectDB();
    const resumes = await listResumes();
    return res.json({ success: true, count: resumes.length, resumes });
  } catch {
    return res.status(503).json({ success: false, error: "Could not load previous reviews." });
  }
}

export async function getResumeById(req, res) {
  try {
    await connectDB();
    const resume = await getResume(req.params.id);
    if (!resume) return res.status(404).json({ success: false, error: "Resume not found." });
    return res.json({ success: true, resume });
  } catch (err) {
    const invalidId = err.name === "CastError";
    return res.status(invalidId ? 400 : 503).json({
      success: false,
      error: invalidId ? "Invalid resume ID." : "Database unavailable.",
    });
  }
}

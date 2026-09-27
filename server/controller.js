import { extractResumeText, saveResume, listResumes, getResume } from "./service.js";

export async function uploadResume(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No file uploaded. Send a PDF in the 'resume' field.",
    });
  }

  try {
    const { text, pages } = await extractResumeText(req.file.buffer);

    const saved = await saveResume({
      fileName: req.file.originalname,
      sizeKB: +(req.file.size / 1024).toFixed(1),
      pages,
      content: text,
    });

    return res.status(201).json({
      success: true,
      message: "Resume received and content extracted successfully.",
      id: saved._id,
      file: {
        name: saved.fileName,
        sizeKB: saved.sizeKB,
        pages: saved.pages,
      },
      content: saved.content,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      error: err.error || "Something went wrong while processing the resume.",
    });
  }
}

export async function getAllResumes(req, res) {
  const resumes = await listResumes();
  res.json({ success: true, count: resumes.length, resumes });
}

export async function getResumeById(req, res) {
  const resume = await getResume(req.params.id);
  if (!resume) {
    return res.status(404).json({ success: false, error: "Resume not found." });
  }
  res.json({ success: true, resume });
}
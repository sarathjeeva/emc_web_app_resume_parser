import { Router } from "express";
import multer from "multer";
import { uploadResume, getAllResumes, getResumeById } from "./controller.js";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(), // keep the PDF in memory — nothing written to disk
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error("ONLY_PDF"));
  },
});

const router = Router();

router.get("/health", (req, res) => res.json({ status: "ok" }));
router.post("/resume", upload.single("resume"), uploadResume);
router.get("/resumes", getAllResumes);
router.get("/resumes/:id", getResumeById);

// Convert multer errors (size limit, wrong type) into JSON responses
export function uploadErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      error: "File too large — maximum size is 5 MB.",
    });
  }
  if (err?.message === "ONLY_PDF") {
    return res.status(415).json({
      success: false,
      error: "Only PDF files are accepted.",
    });
  }
  next(err);
}

export default router;
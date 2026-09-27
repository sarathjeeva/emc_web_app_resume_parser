import { PDFParse } from "pdf-parse";
import { Resume } from "./models/Resume.js";

// Extract text from a PDF buffer. Throws { status, error } on failure.
export async function extractResumeText(buffer) {
  let parser;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = (result.text || "").trim();

    if (!text) {
      throw {
        status: 422,
        error: "The PDF was read but contains no extractable text — it may be a scanned image.",
      };
    }
    return { text, pages: result.total };
  } catch (err) {
    if (err.status) throw err; // our own error above
    throw {
      status: 422,
      error: "Could not parse the PDF — the file may be corrupted or password-protected.",
    };
  } finally {
    if (parser) await parser.destroy().catch(() => {});
  }
}

// Persist an extracted resume and return the saved document.
export async function saveResume({ fileName, sizeKB, pages, content }) {
  return Resume.create({ fileName, sizeKB, pages, content });
}

export async function listResumes() {
  return Resume.find().select("-content").sort({ createdAt: -1 });
}

export async function getResume(id) {
  return Resume.findById(id);
}

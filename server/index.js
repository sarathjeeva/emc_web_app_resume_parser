import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import express from "express";
import { connectDB, isDatabaseConfigured } from "./db.js";
import router, { uploadErrorHandler } from "./routes.js";

try {
  loadEnvFile(fileURLToPath(new URL(".env", import.meta.url)));
} catch (err) {
  if (err.code !== "ENOENT") console.warn("could not load server/.env:", err.message);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.disable("x-powered-by");
app.use("/api", router);
app.use(uploadErrorHandler);
app.use((err, req, res, next) => {
  console.error("unhandled request error:", err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ success: false, error: "Unexpected server error." });
});

export default app;

if (isDatabaseConfigured()) {
  connectDB().catch((err) => console.warn("database unavailable:", err.message));
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log("server listening on http://localhost:" + PORT));
}

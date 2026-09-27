import express from "express";
import { connectDB } from "./db.js";
import router, { uploadErrorHandler } from "./routes.js";

const app = express();
const PORT = process.env.PORT || 3001;
let connectionPromise;

app.use("/api", (req, res, next) => {
  if (!process.env.VERCEL || req.path === "/health") return next();
  if (!process.env.MONGO_URI) {
    return res.status(503).json({ success: false, error: "MONGO_URI is not configured." });
  }

  connectionPromise ??= connectDB().catch((err) => {
    connectionPromise = undefined;
    throw err;
  });
  connectionPromise.then(() => next()).catch((err) => {
    console.error("failed to connect to mongodb:", err.message);
    res.status(503).json({ success: false, error: "Database unavailable." });
  });
});
app.use("/api", router);
app.use(uploadErrorHandler);

export default app;

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log("server listening on http://localhost:" + PORT);
      });
    })
    .catch((err) => {
      console.error("failed to connect to mongodb:", err.message);
      process.exit(1);
    });
}

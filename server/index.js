import express from "express";
import { connectDB } from "./db.js";
import router, { uploadErrorHandler } from "./routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use("/api", router);
app.use(uploadErrorHandler);

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
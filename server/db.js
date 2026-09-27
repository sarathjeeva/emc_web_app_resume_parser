import mongoose from "mongoose";

const ATLAS_HOST = "cluster0.i3labgi.mongodb.net";
const DEFAULT_DATABASE = "resume_match";
let connectionPromise;

export function isDatabaseConfigured() {
  return Boolean(
    process.env.MONGO_URI ||
    (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) ||
    !process.env.VERCEL
  );
}

export function getMongoUri() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;

  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;
  if (username && password) {
    const database = process.env.MONGODB_DATABASE || DEFAULT_DATABASE;
    return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${ATLAS_HOST}/${encodeURIComponent(database)}?retryWrites=true&w=majority&appName=Cluster0`;
  }

  if (!process.env.VERCEL) return "mongodb://127.0.0.1:27017/resume_match";
  throw new Error("MongoDB credentials are not configured");
}

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose.connect(getMongoUri(), { serverSelectionTimeoutMS: 10000 })
    .then(() => mongoose.connection)
    .catch((error) => {
      connectionPromise = undefined;
      throw error;
    });

  await connectionPromise;
  console.log("mongodb connected:", mongoose.connection.name);
  return mongoose.connection;
}

import dotenv from "dotenv";

dotenv.config();

const maxFileSize = 20 * 1024 * 1024; // 10MB

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  qdrant: {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collectionName: process.env.QDRANT_COLLECTION || "documents",
  },
  server: {
    port: process.env.PORT || 3000,
  },
  uploads: {
    directory: process.env.UPLOAD_FOLDER || "./uploads",
    maxFileSize: maxFileSize,
  },
};

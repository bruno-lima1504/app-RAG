import fs from "node:fs";
import { config } from "./config.js";
import express from "express";
import queryRouter from "./routes/queryRouter.js";
import documentRouter from "./routes/documentRouter.js";
import qdrantService from "./services/qdrant.js";

const app = express();

const port = config.server.port;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.json());
app.get("/", (_, res) => res.json({ message: "RAG APP is running" }));
app.use("/query", queryRouter);
app.use("/documents", documentRouter);

if (!fs.existsSync(config.uploads.directory)) {
  fs.mkdirSync(config.uploads.directory);
  console.log(`Created upload directory: ${config.uploads.directory}`);
}

async function start() {
  try {
    await qdrantService.initQdrantCollection();
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

await start();

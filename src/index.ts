import { config } from "./config.js";
import express from "express";

const app = express();

const port = config.server.port;

app.get("/", (_, res) => res.json({ message: "RAG APP is running" }));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

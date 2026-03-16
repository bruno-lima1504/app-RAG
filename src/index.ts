import { config } from "./config.js";
import express from "express";
import queryRouter from "./routes/queryRouter.js";
import documentRouter from "./routes/documentRouter.js";

const app = express();

const port = config.server.port;

app.use(express.json());

app.get("/", (_, res) => res.json({ message: "RAG APP is running" }));

app.use("/query", queryRouter);
app.use("/documents", documentRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

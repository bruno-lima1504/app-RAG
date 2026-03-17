import { Router } from "express";
import ragServices from "../services/rag.js";

const queryRouter = Router();

queryRouter.post("/", async (req, res) => {
  try {
    const { question, topK } = req.body;
    const result = await ragServices.generateRAGResponse({ question, topK });
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao processar a consulta:", error);
    res.status(500).json({ error: "Erro ao processar a consulta" });
  }
});

queryRouter.post("/stream", async (req, res) => {
  try {
    const startTime = Date.now();
    const { question, topK } = req.body;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await ragServices.generateRAGStreamingResponse({ question, topK, res });
    const duration = Date.now() - startTime;
    console.log(`Streaming response completed in ${duration}ms`);
  } catch (error) {}
});

export default queryRouter;

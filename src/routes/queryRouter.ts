import { Router } from "express";
import { generateRAgResponse } from "../services/rag.js";

const queryRouter = Router();

queryRouter.post("/", async (req, res) => {
  try {
    const { question, topK } = req.body;
    const result = await generateRAgResponse({ question, topK });
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao processar a consulta:", error);
    res.status(500).json({ error: "Erro ao processar a consulta" });
  }
});

export default queryRouter;

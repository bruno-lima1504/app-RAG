import { Router } from "express";
import documentService from "../services/document.js";
import { uploadMiddleware } from "../middleware/uploadMiddleware.js";
import fs from "node:fs/promises";

const documentRouter = Router();

documentRouter.post(
  "/upload",
  uploadMiddleware.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }
      const result = await documentService.processDocument(
        file.path,
        file.originalname,
      );
      await fs.unlink(file.path);
      res.json(result);
    } catch (error) {
      console.error("Erro ao processar o documento:", error);
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      res.status(500).json({ error: "Erro ao processar o documento" });
    }
  },
);

export default documentRouter;

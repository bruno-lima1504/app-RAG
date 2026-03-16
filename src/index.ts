// import { config } from "./config.js";
// import express from "express";

// const app = express();

// const port = config.server.port;

// app.get("/", (_, res) => res.json({ message: "RAG APP is running" }));

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

import { generateRAgResponse } from "./services/rag.js";

async function main() {
  console.log("Iniciando a geração de resposta RAG...");
  const result = await generateRAgResponse({
    question: "Qual a receita liquida da nike em 2023?",
    topK: 3,
  });
  console.log("Resultado da geração de resposta RAG:", result);
}

main();

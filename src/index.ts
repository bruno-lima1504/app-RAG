// import { config } from "./config.js";
// import express from "express";

// const app = express();

// const port = config.server.port;

// app.get("/", (_, res) => res.json({ message: "RAG APP is running" }));

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

import { searchDocuments } from "./services/quey.js";

async function main() {
  console.log("Iniciando a busca...");
  const result = await searchDocuments({
    question: "Qual a receita liquida da nike em 2022?",
    topK: 3,
  });
  console.log("Resultado da busca:", result);
}

main();

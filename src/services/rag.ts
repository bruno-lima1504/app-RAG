import type { Response } from "express";
import openAiService from "./openai.js";
import { searchDocuments } from "./query.js";
import type { QueryRequest, RAGResponse } from "../types.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const PROMPT_TEMPLATE = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
        Você é um assistente de IA que responde perguntas com base em documentos fornecidos. 
        Regras:
        - Use apenas as informações dos documentos para responder a pergunta.
        - Se a pergunta não puder ser respondida com base no contexto, responda que não há informações disponíveis.
        - Se a informação não estiver no contexto, responda "Desculpe, não tenho informações sobre isso."
        - Forneça respostas concisas e diretas.
        - Cite as fontes usadas para gerar a resposta no formato: [1], [2], etc
        - Responda em português brasileiro.
    `,
  ],
  [
    "user",
    `CONTEXT:
    {context}
    QUESTION:
    {question}
    ANSWER:
    `,
  ],
]);

async function generateRAGResponse({
  question,
  topK = 3,
}: QueryRequest): Promise<RAGResponse> {
  const searchResults = await searchDocuments({ question, topK });

  if (searchResults.answer.length === 0) {
    return {
      question,
      answer:
        "Não foi possível encontrar informações relacionadas à sua pergunta.",
    };
  }

  //construir o context a partir dos resultados da busca
  const context = searchResults.answer
    .map((item, index) => `[${index + 1}]: ${item.text}`)
    .join("\n\n");

  // Chain de prompts para gerar a resposta
  const chain = PROMPT_TEMPLATE.pipe(openAiService.llm).pipe(
    new StringOutputParser(),
  );

  const answer = await chain.invoke({
    context,
    question,
  });

  const sources = searchResults.answer.map((item, index) => ({
    fileName: item.metadata.fileName,
    page: item.metadata.page,
    score: item.score,
  }));

  return { answer, question, sources };
}

async function generateRAGStreamingResponse({
  question,
  topK = 3,
  res,
}: QueryRequest & { res: Response }): Promise<void> {
  const searchResults = await searchDocuments({ question, topK });

  if (searchResults.answer.length === 0) {
    res.write(
      `data: ${JSON.stringify({ answer: "Desculpe, não encontrei informações relacionadas à sua pergunta." })}`,
    );
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
    return;
  }

  const sourcers = searchResults.answer.map((item) => ({
    fileName: item.metadata?.fileName ?? "Documento",
    page: item.metadata?.page,
    score: item.score ?? 0,
  }));

  res.write(
    `data: ${JSON.stringify({ type: "sources", content: sourcers })}\n\n`,
  );

  const context = searchResults.answer
    .map((item, index) => `[${index + 1}]: ${item.text}`)
    .join("\n\n");

  const chains = PROMPT_TEMPLATE.pipe(openAiService.llm).pipe(
    new StringOutputParser(),
  );

  const stream = await chains.stream({
    context,
    question,
  });

  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`);
  }

  res.write("data: [DONE]\n\n");
  res.end();
}

const ragServices = {
  generateRAGResponse,
  generateRAGStreamingResponse,
};

export default ragServices;

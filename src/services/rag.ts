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

export async function generateRAgResponse({
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

import { config } from "../config.js";
import qdrantService from "./qdrant.js";
import openAiService from "./openai.js";
import type { QueryRequest, QueryResponse, searchResult } from "../types.js";

// função: recuperar chuncks relevantes a aprtir de uma query

export async function searchDocuments({
  question,
  topK = 3,
}: QueryRequest): Promise<QueryResponse> {
  const queryVector = await openAiService.embeddings.embedQuery(question);

  const searchResult = await qdrantService.qdrantClient.search(
    config.qdrant.collectionName,
    {
      vector: queryVector,
      limit: topK,
      with_payload: true,
    },
  );

  //mapear os resultados para o formato searchResult
  const answer: searchResult[] = searchResult.map((item) => ({
    id: item.id as string,
    text: item.payload?.text as string,
    score: item.score,
    metadata: item.payload as {
      documentId: string;
      chunkIndex: number;
      fileName: string;
      page: number;
    },
  }));

  return {
    answer,
    question,
    countChunks: answer.length,
  };
}

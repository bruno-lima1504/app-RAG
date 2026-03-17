export interface UploadResponse {
  success: boolean;
  documentId: string;
  chuncksCount: number;
  message?: string;
}

export interface searchResult {
  id: string;
  text: string;
  score: number; // similaridade entre a query e o chunk, quanto mais alto, mais similar
  metadata: {
    documentId: string;
    chunkIndex: number;
    fileName: string;
    page: number;
  };
}

export interface QueryRequest {
  question: string;
  topK: number;
}

export interface QueryResponse {
  question: string;
  answer: searchResult[];
  countChunks: number;
}

interface Source {
  fileName: string;
  page?: number;
  score?: number;
}

export interface RAGResponse {
  question: string;
  answer: string;
  sources?: Source[];
  tokensUsed?: number;
}

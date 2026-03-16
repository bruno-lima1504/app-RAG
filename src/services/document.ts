import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { v4 as uuidv4 } from "uuid";
import openAiService from "./openai.js";
import qdrantService from "./qdrant.js";
import { config } from "../config.js";

interface UploadResponse {
  success: boolean;
  documentId: string;
  chuncksCount: number;
  message?: string;
}

const tesxtSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

async function processDocument(
  filePath: string,
  fileName: string,
): Promise<UploadResponse> {
  // 1. carregamento do arquivo pdf
  const loader = new PDFLoader(filePath);
  const documents = await loader.load();

  if (documents.length === 0) {
    throw new Error("Nenhum documento encontrado no arquivo PDF");
  }

  // 2. Divisão do texto em chunks
  const chunks = await tesxtSplitter.splitDocuments(documents);

  if (chunks.length === 0) {
    throw new Error("Nenhum chunk encontrado no arquivo PDF");
  }

  // 3. Adicionar aguns metadados ao chunk
  const documentId = uuidv4();
  const documentsChuncksWithMetadata = chunks.map((chunk, index) => ({
    id: uuidv4(),
    text: chunk.pageContent,
    metadata: {
      documentId,
      chunkIndex: index,
      fileName,
      uploadedAt: new Date().toISOString(),
      page: chunk.metadata.loc?.pageNumber,
    },
  }));

  //4. Geração dos embeddings
  const texts = documentsChuncksWithMetadata.map((doc) => doc.text);
  const vectors = await openAiService.embeddings.embedDocuments(texts);

  // 5. Armazenar os embeddings vetorizados de busca no banco de dados
  const data = documentsChuncksWithMetadata.map((chunck, index) => {
    const vector = vectors[index];
    if (!vector || !Array.isArray(vector)) {
      throw new Error(
        `Vector inválido gerado para o chunck de indice ${index}`,
      );
    }
    return {
      id: chunck.id,
      vector,
      payload: {
        text: chunck.text,
        ...chunck.metadata,
      },
    };
  });

  // 6. Retornar o resultado do upload
  await qdrantService.qdrantClient.upsert(config.qdrant.collectionName, {
    points: data,
    wait: true,
  });

  return {
    success: true,
    documentId: documentId,
    chuncksCount: documentsChuncksWithMetadata.length,
    message: "Document uploaded successfully",
  };
}

const documentService = {
  processDocument,
};

export default documentService;

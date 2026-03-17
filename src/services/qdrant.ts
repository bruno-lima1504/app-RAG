import { QdrantClient } from "@qdrant/js-client-rest";
import { config } from "../config.js";

const qdrantClient = new QdrantClient({
  url: config.qdrant.url,
});

// criar uma collection do qdrant sempre que inicializar nossa api
async function initQdrantCollection() {
  const collections = await qdrantClient.getCollections();

  const exists = collections.collections.find(
    (col) => col.name === config.qdrant.collectionName,
  );

  if (!exists) {
    await qdrantClient.createCollection(config.qdrant.collectionName, {
      vectors: {
        size: 1536,
        distance: "Cosine",
      },
    });
    console.log(`Collection ${config.qdrant.collectionName} initialized`);
  } else {
    console.log(`Collection ${config.qdrant.collectionName} already exists`);
  }
}

const qdrantService = {
  qdrantClient,
  initQdrantCollection,
};

export default qdrantService;

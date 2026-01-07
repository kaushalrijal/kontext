import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME;

if (!apiKey) {
  throw new Error("PINECONE_API_KEY is not set");
}

if (!indexName) {
  throw new Error("PINECONE_INDEX_NAME is not set");
}

const pinecone = new Pinecone({ apiKey });

export const pineconeIndex = pinecone.index(indexName);



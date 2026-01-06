import { EmbeddingProvider } from "./provider";
import { HuggingFaceEmbeddingProvider } from "./huggingface";
import { VertexEmbeddingProvider } from "./vertex";

export function getEmbeddingProvider(): EmbeddingProvider {
  switch (process.env.EMBEDDING_PROVIDER) {
    case "vertex":
      return new VertexEmbeddingProvider();
    case "huggingface":
    default:
      return new HuggingFaceEmbeddingProvider();
  }
}
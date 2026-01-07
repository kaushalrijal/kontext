import { EmbeddingProvider } from "./provider";
import { LocalEmbeddingProvider } from "./local";
import { VertexEmbeddingProvider } from "./vertex";

export function getEmbeddingProvider(): EmbeddingProvider {
  switch (process.env.EMBEDDING_PROVIDER) {
    case "vertex":
      return new VertexEmbeddingProvider();
    case "local":
    default:
      return new LocalEmbeddingProvider();
  }
}
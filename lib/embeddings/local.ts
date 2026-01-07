import { EmbeddingProvider, EmbedInput } from "./provider";
import fs from "fs/promises";
import path from "path";

/**
 * Local embedding provider that delegates to a local
 * FastAPI inference server that performs:
 *   - image -> caption
 *   - caption + text -> embedding
 */

const LOCAL_INFERENCE_URL =
  process.env.LOCAL_INFERENCE_URL || "http://127.0.0.1:8050/embed";

export class LocalEmbeddingProvider implements EmbeddingProvider {
  async embed(input: EmbedInput): Promise<number[]> {
    if (!input.text && !input.imagePath) {
      throw new Error("Either text or imagePath must be provided for embedding");
    }

    const form = new FormData();

    if (input.text) {
      form.append("text", input.text);
    }

    if (input.imagePath) {
      const publicDir = path.join(process.cwd(), "public");

      // Normalize to a relative path and prevent path traversal
      const relativePath = input.imagePath.replace(/^\/+/, "");
      const fullPath = path.resolve(publicDir, relativePath);

      if (!fullPath.startsWith(publicDir + path.sep)) {
        throw new Error("Invalid imagePath: must point inside the public directory");
      }

      const imageBuffer = await fs.readFile(fullPath);

      form.append("image", new Blob([imageBuffer]), "image.jpg");
    }

    try {
      const res = await fetch(LOCAL_INFERENCE_URL, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        // Check if it's a connection error
        if (res.status === 0 || res.status >= 500) {
          throw new Error(
            "Embedding service is unavailable. Please ensure the local embedding server is running."
          );
        }
        const errorText = await res.text();
        throw new Error(`Embedding request failed: ${errorText}`);
      }

      const json = await res.json();

      if (!Array.isArray(json.embedding)) {
        throw new Error("Invalid embedding response from server");
      }

      return json.embedding;
    } catch (error) {
      // Handle network/connection errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Embedding service is unavailable. Please ensure the local embedding server is running."
        );
      }
      // Re-throw other errors as-is
      throw error;
    }
  }
}


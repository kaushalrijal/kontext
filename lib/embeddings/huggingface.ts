import { EmbeddingProvider, EmbedInput } from "./provider";
import fs from "fs/promises";
import path from "path";

/**
 * NOTE:
 * Despite the filename, this provider currently delegates to a local
 * FastAPI inference server that performs:
 *   - image -> caption
 *   - caption + text -> embedding
 *
 * This is intentional to avoid external API constraints.
 */

const LOCAL_INFERENCE_URL = "http://127.0.0.1:8050/embed";

export class HuggingFaceEmbeddingProvider implements EmbeddingProvider {
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

    const res = await fetch(LOCAL_INFERENCE_URL, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      throw new Error(`Local inference failed: ${await res.text()}`);
    }

    const json = await res.json();

    if (!Array.isArray(json.embedding)) {
      throw new Error("Invalid embedding returned from local inference");
    }

    return json.embedding;
  }
}
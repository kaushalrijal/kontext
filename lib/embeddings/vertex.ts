import { EmbeddingProvider, EmbedInput } from "./provider";
import { VertexAI } from "@google-cloud/vertexai";
import fs from "fs/promises";
import path from "path";

const credential = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_KEY ?? "", "base64").toString()
);

export class VertexEmbeddingProvider implements EmbeddingProvider {
  private model;

  constructor() {
    const vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT!,
      location: process.env.GOOGLE_CLOUD_LOCATION!,
      googleAuthOptions: {
        credentials: {
          client_email: credential.client_email,
          private_key: credential.private_key,
        },
      },
    });

    this.model = vertexAI.getGenerativeModel({
      model: "multimodalembedding@001",
    });
  }

  async embed(input: EmbedInput): Promise<number[]> {
    const imagePath = path.join(process.cwd(), "public", input.imagePath);
    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const result = await this.model.embedContent({
      content: {
        role: "user",
        parts: [
          ...(input.text ? [{ text: input.text }] : []),
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
    });

    return result.embedding.values;
  }
}
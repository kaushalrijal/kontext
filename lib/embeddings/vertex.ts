import { EmbeddingProvider, EmbedInput } from "./provider";
import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";
import { JWT } from "google-auth-library";

const credential = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_KEY ?? "", "base64").toString()
);

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT!;
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION!;
const MODEL = "multimodalembedding@001";

export class VertexEmbeddingProvider implements EmbeddingProvider {
  private jwtClient: JWT;

  constructor() {
    this.jwtClient = new JWT({
      email: credential.client_email,
      key: credential.private_key,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
  }

  private async getAccessToken(): Promise<string> {
    await this.jwtClient.authorize();
    const accessToken = this.jwtClient.credentials.access_token;
    if (!accessToken) {
      throw new Error("Failed to obtain access token");
    }
    return accessToken;
  }

  async embed(input: EmbedInput): Promise<number[]> {
    const imagePath = path.join(process.cwd(), "public", input.imagePath);
    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const accessToken = await this.getAccessToken();
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`;

    const instance: {
      image: { bytesBase64Encoded: string };
      text?: string;
    } = {
      image: {
        bytesBase64Encoded: imageBase64,
      },
    };

    if (input.text) {
      instance.text = input.text;
    }

    const requestBody = {
      instances: [instance],
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vertex AI API error: ${response.status} ${errorText}`);
    }

    const result = (await response.json()) as {
      predictions?: Array<{
        imageEmbedding?: number[];
        textEmbedding?: number[];
        multimodalEmbedding?: number[];
      }>;
    };

    const prediction = result.predictions?.[0];
    if (!prediction) {
      throw new Error("No predictions returned from Vertex AI");
    }

    // Prefer multimodal embedding (combines image + text), fallback to image embedding
    const embedding = prediction.multimodalEmbedding ?? prediction.imageEmbedding;
    if (!embedding) {
      throw new Error("No embedding found in Vertex AI response");
    }

    return embedding;
  }
}
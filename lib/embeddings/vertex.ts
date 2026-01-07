import { EmbeddingProvider, EmbedInput } from "./provider";
import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";
import { JWT } from "google-auth-library";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT!;
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION!;
const MODEL = "multimodalembedding@001";

function getCredential() {
  const serviceKey = process.env.GOOGLE_SERVICE_KEY;
  if (!serviceKey) {
    throw new Error("GOOGLE_SERVICE_KEY environment variable is not set");
  }

  try {
    const decoded = Buffer.from(serviceKey, "base64").toString("utf-8");
    const credential = JSON.parse(decoded);
    
    if (!credential.client_email || !credential.private_key) {
      throw new Error("Invalid credential format: missing client_email or private_key");
    }
    
    return credential;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse GOOGLE_SERVICE_KEY: invalid JSON. Ensure it's base64-encoded JSON.");
    }
    throw new Error(`Failed to parse GOOGLE_SERVICE_KEY: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export class VertexEmbeddingProvider implements EmbeddingProvider {
  private jwtClient: JWT;

  constructor() {
    const credential = getCredential();
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
    let imageBuffer: Buffer;

    // Check if it's a remote URL (http/https)
    if (input.imagePath.startsWith("http://") || input.imagePath.startsWith("https://")) {
      // Fetch the image from the remote URL
      const imageResponse = await fetch(input.imagePath);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from ${input.imagePath}`);
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else {
      // Handle local file path
      const imagePath = path.join(process.cwd(), "public", input.imagePath);
      imageBuffer = await fs.readFile(imagePath);
    }

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
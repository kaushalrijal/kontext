import { EmbeddingProvider, EmbedInput } from "./provider";
import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

const HF_MODEL = "openai/clip-vit-base-patch32";
const HF_ENDPOINT = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
const HF_TOKEN = process.env.HF_API_TOKEN!;

export class HuggingFaceEmbeddingProvider implements EmbeddingProvider {
  async embed(input: EmbedInput): Promise<number[]> {
    const vectors: number[][] = [];

    // ---- image embedding ----
    const imagePath = path.join(process.cwd(), "public", input.imagePath);
    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const imageRes = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          image: imageBase64,
        },
      }),
    });

    const imageJson: any = await imageRes.json();
    const imageVector = imageJson?.[0]?.embedding;

    if (!imageVector) {
      throw new Error("Failed to get image embedding from Hugging Face");
    }

    vectors.push(imageVector);

    // ---- text embedding (optional) ----
    if (input.text) {
      const textRes = await fetch(HF_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: input.text,
        }),
      });

      const textJson: any = await textRes.json();
      const textVector = textJson?.[0]?.embedding;

      if (!textVector) {
        throw new Error("Failed to get text embedding from Hugging Face");
      }

      vectors.push(textVector);
    }

    // ---- average vectors ----
    return averageVectors(vectors);
  }
}

function averageVectors(vectors: number[][]): number[] {
  const dim = vectors[0].length;
  const result = new Array(dim).fill(0);

  for (const vec of vectors) {
    for (let i = 0; i < dim; i++) {
      result[i] += vec[i];
    }
  }

  return result.map((v) => v / vectors.length);
}
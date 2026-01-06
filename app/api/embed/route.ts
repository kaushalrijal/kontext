import { NextResponse } from "next/server";
import { getEmbeddingProvider } from "@/lib/embeddings";

export async function POST(req: Request) {
  const { imageUrl, caption } = await req.json();

  const provider = getEmbeddingProvider();
  const vector = await provider.embed({
    imagePath: imageUrl,
    text: caption,
  });

  return NextResponse.json({
    vector,
    dimension: vector.length,
  });
}
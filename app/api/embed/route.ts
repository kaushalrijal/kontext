import { NextResponse } from "next/server";
import { getEmbeddingProvider } from "@/lib/embeddings";

export async function POST(req: Request) {
  const { imageUrl, caption } = await req.json();

  const hasCaption = typeof caption === "string" && caption.trim().length > 0;
  const hasImageUrl = typeof imageUrl === "string" && imageUrl.trim().length > 0;

  if (!hasCaption && !hasImageUrl) {
    return NextResponse.json(
      { error: "Either imageUrl or caption must be provided" },
      { status: 400 }
    );
  }

  if (imageUrl != null && typeof imageUrl !== "string") {
    return NextResponse.json(
      { error: "imageUrl must be a string when provided" },
      { status: 400 }
    );
  }

  const provider = getEmbeddingProvider();
  const vector = await provider.embed({
    imagePath: hasImageUrl ? imageUrl : "",
    text: hasCaption ? caption : undefined,
  });

  console.log("Embedding dim:", vector.length);

  return NextResponse.json({
    vector,
    dimension: vector.length,
  });
}
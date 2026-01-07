// app/api/test/embedding/route.ts
import { getEmbeddingProvider } from "@/lib/embeddings";

export async function GET() {
  const provider = getEmbeddingProvider();

  const embedding = await provider.embed({
    text: "A person working on a laptop",
    imagePath: "/test.jpg",
  });

  return Response.json({
    dimension: embedding.length,
    sample: embedding.slice(0, 5),
  });
}
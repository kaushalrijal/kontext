import { NextResponse } from "next/server";
import { getEmbeddingProvider } from "@/lib/embeddings";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Rate limiting
  const identifier = getClientIdentifier(req);
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.embed);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMITS.embed.maxRequests),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetTime),
        },
      }
    );
  }

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

  try {
    const provider = getEmbeddingProvider();
    const vector = await provider.embed({
      imagePath: hasImageUrl ? imageUrl : "",
      text: hasCaption ? caption : undefined,
    });

    return NextResponse.json({
      vector,
      dimension: vector.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Check if it's a service availability error
    if (errorMessage.includes("unavailable") || errorMessage.includes("running")) {
      return NextResponse.json(
        { error: "Embedding service is not available" },
        { status: 503 }
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { error: "Failed to generate embedding" },
      { status: 500 }
    );
  }
}
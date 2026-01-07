import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmbeddingProvider } from "@/lib/embeddings";
import { querySimilarPostsByIdWithLazyBackfill } from "@/lib/pinecone/posts";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

type RouteContext =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? "multimodalembedding@001";

export async function GET(req: Request, context: RouteContext) {
  // Rate limiting
  const identifier = getClientIdentifier(req);
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.similarPosts);
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
          "X-RateLimit-Limit": String(RATE_LIMITS.similarPosts.maxRequests),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetTime),
        },
      }
    );
  }

  const params = await Promise.resolve(context.params);
  const postId = params.id;

  if (!postId) {
    return NextResponse.json(
      { error: "Post id is required" },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { matches, backfilledVectorLength } = await querySimilarPostsByIdWithLazyBackfill({
    postId,
    topK: 6,
    excludePostId: postId,
    getEmbedding: async () => {
      const provider = getEmbeddingProvider();
      return provider.embed({
        imagePath: post.imageUrl,
        text: post.caption,
      });
    },
  });

  if (backfilledVectorLength) {
    await prisma.post.update({
      where: { id: postId },
      data: {
        pineconeCombinedVectorId: postId,
        embeddingDim: backfilledVectorLength,
        embeddingModel: EMBEDDING_MODEL,
        embeddingUpdatedAt: new Date(),
      },
    });
  }

  if (matches.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const similarPosts = await prisma.post.findMany({
    where: {
      id: {
        in: matches.map((m) => m.postId),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  const postById = new Map(similarPosts.map((p) => [p.id, p]));

  const results = matches
    .map((match) => {
      const matchedPost = postById.get(match.postId);
      if (!matchedPost) return null;
      return {
        post: matchedPost,
        score: match.score,
      };
    })
    .filter((entry): entry is { post: typeof similarPosts[number]; score: number } => entry !== null);

  return NextResponse.json({ results });
}



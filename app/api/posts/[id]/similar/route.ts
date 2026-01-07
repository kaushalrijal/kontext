import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmbeddingProvider } from "@/lib/embeddings";
import { querySimilarPostsByIdWithLazyBackfill } from "@/lib/pinecone/posts";

type RouteContext =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
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

  const matches = await querySimilarPostsByIdWithLazyBackfill({
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



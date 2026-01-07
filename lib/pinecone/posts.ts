import { pineconeIndex } from "./client";

type UpsertPostEmbeddingInput = {
  postId: string;
  vector: number[];
};

type QuerySimilarPostsInput = {
  vector: number[];
  topK: number;
  excludePostId?: string;
};

type QuerySimilarPostsByIdWithBackfillInput = {
  postId: string;
  topK: number;
  excludePostId?: string;
  /**
   * Called only if the vector for this postId does not yet exist in Pinecone.
   */
  getEmbedding: () => Promise<number[]>;
};

type QuerySimilarPostsByIdWithBackfillResult = {
  matches: Array<{ postId: string; score: number }>;
  backfilledVectorLength?: number;
};

export async function upsertPostEmbedding({
  postId,
  vector,
}: UpsertPostEmbeddingInput): Promise<void> {
  const dimension = vector.length;

  await pineconeIndex.upsert([
    {
      id: postId,
      values: vector,
      metadata: {
        postId,
        dimension,
      },
    },
  ]);
}

export async function deletePostEmbedding(postId: string): Promise<void> {
  await pineconeIndex.deleteMany([postId]);
}

export async function querySimilarPosts({
  vector,
  topK,
  excludePostId,
}: QuerySimilarPostsInput): Promise<Array<{ postId: string; score: number }>> {
  const response = await pineconeIndex.query({
    topK,
    vector,
    includeMetadata: true,
    includeValues: false,
    filter: excludePostId
      ? {
          postId: { $ne: excludePostId },
        }
      : undefined,
  });

  const matches = response.matches ?? [];

  return matches.map((match) => ({
    postId: match.id,
    score: match.score ?? 0,
  }));
}

export async function querySimilarPostsByIdWithLazyBackfill({
  postId,
  topK,
  excludePostId,
  getEmbedding,
}: QuerySimilarPostsByIdWithBackfillInput): Promise<QuerySimilarPostsByIdWithBackfillResult> {
  // 1) Try querying by existing vector ID (no recompute if present)
  try {
    const response = await pineconeIndex.query({
      id: postId,
      topK,
      includeMetadata: true,
      includeValues: false,
      filter: excludePostId
        ? {
            postId: { $ne: excludePostId },
          }
        : undefined,
    });

    const matches = response.matches ?? [];

    // If the ID exists, this query will succeed (even if there are 0 matches).
    // In that case, we should NOT recompute the embedding.
    return {
      matches: matches.map((match) => ({
        postId: match.id,
        score: match.score ?? 0,
      })),
    };
  } catch (error) {
    // If the query by ID fails (e.g., vector not found), fall through to lazy backfill.
    console.log(
      "[pinecone] Lazy backfill triggered for post",
      postId,
      "- reason:",
      error instanceof Error ? error.message : String(error)
    );
  }

  // 2) Vector does not exist yet: compute embedding once and upsert
  const vector = await getEmbedding();
  await upsertPostEmbedding({ postId, vector });

  // 3) Now query using the freshly upserted vector
  const matches = await querySimilarPosts({
    vector,
    topK,
    excludePostId,
  });

  return { matches, backfilledVectorLength: vector.length };
}




"use client"

import type { Post } from "@/lib/types"
import { PostCard } from "@/components/shared/post-card"
import { calculateSimilarity } from "@/lib/similarity"

interface SimilarPostsProps {
  currentPost: Post
  allPosts: Post[]
}

export function SimilarPosts({ currentPost, allPosts }: SimilarPostsProps) {
  const similarPostsWithScores = allPosts
    .filter((post) => post.id !== currentPost.id)
    .map((post) => ({
      post,
      similarity: calculateSimilarity(currentPost.caption, post.caption),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 6)

  if (similarPostsWithScores.length === 0) {
    return null
  }

  return (
    <div className="pt-6 sm:pt-8 border-t border-border">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Similar Posts</h2>
      <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">Posts with similar content to yours</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {similarPostsWithScores.map(({ post, similarity }) => (
          <div key={post.id}>
            <PostCard post={post} href={`/posts/${post.id}`} />
            <p className="text-xs text-muted-foreground mt-2">{(similarity * 100).toFixed(0)}% similar</p>
          </div>
        ))}
      </div>
    </div>
  )
}


"use client"

import type { Post } from "@/lib/types"
import { PostCard } from "@/components/shared/post-card"
import { useEffect, useState } from "react"

interface SimilarPostsProps {
  currentPost: Post
}

type SimilarPostResult = {
  post: Post
  score: number
}

export function SimilarPosts({ currentPost }: SimilarPostsProps) {
  const [results, setResults] = useState<SimilarPostResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadSimilar() {
      try {
        const res = await fetch(`/api/posts/${currentPost.id}/similar`)
        if (!res.ok) {
          throw new Error(`Failed to load similar posts: ${res.status}`)
        }

        const data = (await res.json()) as { results?: SimilarPostResult[] }
        if (isMounted) {
          setResults(data.results ?? [])
        }
      } catch (error) {
        console.error("Failed to load similar posts", error)
        if (isMounted) {
          setResults([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadSimilar()

    return () => {
      isMounted = false
    }
  }, [currentPost.id])

  if (isLoading || results.length === 0) {
    return null
  }

  return (
    <div className="pt-6 sm:pt-8 border-t border-border">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Similar Posts</h2>
      <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">Posts with similar content to yours</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {results.map(({ post, score }) => (
          <div key={post.id}>
            <PostCard post={post} href={`/posts/${post.id}`} />
            <p className="text-xs text-muted-foreground mt-2">{(score * 100).toFixed(0)}% similar</p>
          </div>
        ))}
      </div>
    </div>
  )
}


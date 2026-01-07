"use client"

import type { Post } from "@/lib/types"
import { Skeleton } from "@/components/shared/skeleton"
import Link from "next/link"
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
    setIsLoading(true)

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

  const visibleResults = results.slice(0, 5)

  return (
    <div className="pt-6 sm:pt-8 lg:pt-0 lg:border-l border-border lg:pl-6">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Similar Posts</h2>
      <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">Posts with similar content to yours</p>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="border border-border rounded-sm bg-card px-3 py-3 sm:px-4 sm:py-4 flex items-center gap-4"
            >
              <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-sm" />
                <Skeleton className="h-3 w-1/2 rounded-sm" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-3 w-20 rounded-sm" />
                  <Skeleton className="h-3 w-16 rounded-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : visibleResults.length === 0 ? (
        <p className="text-sm text-muted-foreground">No similar posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {visibleResults.map(({ post, score }) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="border border-border rounded-sm bg-card hover:border-primary transition-colors flex items-center gap-4 px-3 py-3 sm:px-4 sm:py-4 group"
            >
              <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-sm overflow-hidden bg-muted flex items-center justify-center">
                <img
                  src={post.imageUrl || "/placeholder.svg"}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground leading-relaxed line-clamp-2">
                    {post.caption}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span className="truncate">
                    {post.user
                      ? post.user.name ?? post.user.email ?? "Unknown"
                      : "Unknown"}
                  </span>
                  <span className="font-semibold text-foreground ml-4 whitespace-nowrap">
                    {(score * 100).toFixed(0)}% similar
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { Header } from "@/components/shared/header"
import { PostDetail } from "@/components/posts/post-detail"
import { SimilarPosts } from "@/components/posts/similar-posts"
import { getPostById } from "@/lib/actions/post.actions"
import type { Post } from "@/lib/types"
import { Skeleton } from "@/components/shared/skeleton"

export default function PostDetailPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const postId = params.id as string
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const foundPost = await getPostById(postId)

        if (!foundPost) {
          router.push("/posts")
          return
        }

        if (isMounted) {
          setPost(foundPost as Post)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Failed to load post", error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [router, postId, pathname])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-10">
          <Skeleton className="h-[40vh] sm:h-[50vh] w-full rounded-sm" />
          <div className="space-y-3">
            <Skeleton className="h-4 sm:h-5 w-48 sm:w-64 rounded-sm" />
            <Skeleton className="h-4 sm:h-5 w-56 sm:w-72 rounded-sm" />
            <Skeleton className="h-4 sm:h-5 w-40 sm:w-48 rounded-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-sm" />
                <Skeleton className="h-3 w-1/2 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (!post) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-8 lg:gap-12 items-start">
          <PostDetail post={post} />
          <SimilarPosts currentPost={post} />
        </div>
      </div>
    </main>
  )
}


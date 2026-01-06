"use client"

import { useEffect, useState, useMemo } from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import { Header } from "@/components/shared/header"
import { listPosts } from "@/lib/actions/post.actions"
import type { Post } from "@/lib/types"
import { Skeleton } from "@/components/shared/skeleton"

const Gallery = dynamic(
  () => import("@/components/posts/gallery").then((mod) => mod.Gallery),
  {
    loading: () => <GallerySkeleton />,
  }
)

export default function PostsPage() {
  const pathname = usePathname()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const data = await listPosts()
        if (isMounted) {
          setPosts(data as Post[])
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Failed to load posts", error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [pathname])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <GallerySkeleton />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <Gallery posts={posts} />
      </div>
    </main>
  )
}

function GallerySkeleton() {
  const placeholders = useMemo(() => Array.from({ length: 6 }), [])

  return (
    <div>
      <div className="space-y-2 mb-10">
        <Skeleton className="h-8 w-32 rounded-sm" />
        <Skeleton className="h-5 w-48 rounded-sm" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {placeholders.map((_, index) => (
          <div key={index} className="border border-border rounded-sm overflow-hidden bg-card">
            <Skeleton className="aspect-square w-full" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-4 w-3/4 rounded-sm" />
              <Skeleton className="h-3 w-1/3 rounded-sm" />
              <Skeleton className="h-3 w-1/2 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


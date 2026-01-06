"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/shared/header"
import { Gallery } from "@/components/posts/gallery"
import { listPosts } from "@/lib/actions/post.actions"
import type { Post, User } from "@/lib/types"

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header user={{ name: "Guest", email: "guest@example.com" } satisfies User} />
      <div className="max-w-7xl mx-auto px-8 py-12">
        <Gallery posts={posts} />
      </div>
    </main>
  )
}


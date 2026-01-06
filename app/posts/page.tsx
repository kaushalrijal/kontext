"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Header } from "@/components/shared/header"
import { Gallery } from "@/components/posts/gallery"
import { getAllPosts } from "@/lib/handlers/posts"
import { getCurrentUser, isAuthenticated } from "@/lib/handlers/auth"
import type { Post, User } from "@/lib/types"

export default function PostsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    setUser(getCurrentUser())
    setPosts(getAllPosts())
    setIsLoading(false)
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header user={user} />
      <div className="max-w-7xl mx-auto px-8 py-12">
        <Gallery posts={posts} />
      </div>
    </main>
  )
}


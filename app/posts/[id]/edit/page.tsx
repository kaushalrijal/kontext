"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/shared/header"
import { EditPostForm } from "@/components/posts/edit-post-form"
import { getPostById } from "@/lib/handlers/posts"
import { getCurrentUser, isAuthenticated } from "@/lib/handlers/auth"
import type { Post, User } from "@/lib/types"

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const [post, setPost] = useState<Post | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    setUser(getCurrentUser())
    const foundPost = getPostById(postId)
    
    if (!foundPost) {
      router.push("/posts")
      return
    }

    setPost(foundPost)
    setIsLoading(false)
  }, [router, postId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Header user={user} />
      <div className="max-w-7xl mx-auto px-8 py-12">
        <EditPostForm post={post} />
      </div>
    </main>
  )
}


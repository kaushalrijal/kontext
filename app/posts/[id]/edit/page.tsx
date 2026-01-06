"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/shared/header"
import { EditPostForm } from "@/components/posts/edit-post-form"
import { getPostById } from "@/lib/actions/post.actions"
import type { Post } from "@/lib/types"

export default function EditPostPage() {
  const router = useRouter()
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
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <EditPostForm post={post} />
      </div>
    </main>
  )
}


"use client"

import type { Post } from "@/lib/types"
import { SimilarPosts } from "./similar-posts"
import { deletePost } from "@/lib/actions/post.actions"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useSession } from "next-auth/react"

interface PostDetailProps {
  post: Post
}

export function PostDetail({ post }: PostDetailProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const { data: session } = useSession()

  const canEdit = useMemo(() => {
    const sessionUserId = (session?.user as { id?: string } | undefined)?.id
    return sessionUserId && sessionUserId === post.userId
  }, [session, post.userId])

  const handleDelete = () => {
    if (confirm("Delete this post? This action cannot be undone.")) {
      deletePost(post.id)
        .then(() => router.push("/posts"))
        .catch((error) => {
          console.error("Failed to delete post", error)
        })
    }
  }

  return (
    <div className="space-y-8 sm:space-y-12 lg:space-y-16">
      <div className="max-w-3xl mx-auto">
        <div className="border border-border rounded-sm overflow-hidden bg-card">
          <div className="bg-muted overflow-hidden flex justify-center">
            <img
              src={post.imageUrl || "/placeholder.svg"}
              alt={post.caption}
              className="w-full h-auto max-h-[60vh] sm:max-h-[70vh] lg:max-h-[80vh] object-contain"
            />
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <p className="text-base sm:text-lg text-foreground leading-relaxed mb-6 sm:mb-8">{post.caption}</p>
            <div className="border-t border-border pt-4 sm:pt-6 mb-6 sm:mb-8 space-y-2 sm:space-y-3">
                {post.user && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm">
                    <span className="font-medium text-muted-foreground">Posted by</span>
                    <span className="text-foreground font-medium wrap-break-word">
                      {post.user.name ?? post.user.email ?? "Unknown"}
                    </span>
                  </div>
                )}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm">
                <span className="font-medium text-muted-foreground">Created</span>
                <span className="text-foreground font-medium wrap-break-word">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm">
                <span className="font-medium text-muted-foreground">Updated</span>
                <span className="text-foreground font-medium wrap-break-word">
                  {new Date(post.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            {canEdit && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="px-4 py-2.5 sm:py-2 bg-primary text-primary-foreground font-bold rounded-sm hover:opacity-90 transition-opacity text-sm text-center touch-manipulation"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 sm:py-2 border border-destructive text-destructive rounded-sm hover:bg-destructive hover:text-destructive-foreground font-bold transition-colors text-sm touch-manipulation"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SimilarPosts currentPost={post} />
    </div>
  )
}


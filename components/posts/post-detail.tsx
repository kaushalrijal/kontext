"use client"

import type { Post } from "@/lib/types"
import { deletePost, recomputePostEmbedding } from "@/lib/actions/post.actions"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface PostDetailProps {
  post: Post
}

export function PostDetail({ post }: PostDetailProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRecomputing, setIsRecomputing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { data: session } = useSession()

  const canEdit = useMemo(() => {
    const sessionUserId = (session?.user as { id?: string } | undefined)?.id
    return sessionUserId && sessionUserId === post.userId
  }, [session, post.userId])

  const handleDeleteClick = useCallback(() => {
    if (!post.id) return
    setIsDeleteDialogOpen(true)
  }, [post.id])

  const handleConfirmDelete = useCallback(() => {
    if (!post.id || isDeleting) return
    setIsDeleting(true)
    deletePost(post.id)
      .then(() => {
        toast.success("Post deleted")
        router.push("/posts")
      })
      .catch((error) => {
        console.error("Failed to delete post", error)
        toast.error("Failed to delete post. Please try again.")
      })
      .finally(() => {
        setIsDeleting(false)
        setIsDeleteDialogOpen(false)
      })
  }, [post.id, isDeleting, router])

  const handleCancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false)
  }, [])

  const handleRecompute = useCallback(() => {
    if (!post.id || isRecomputing) return
    setIsRecomputing(true)
    recomputePostEmbedding(post.id)
      .then(() => {
        // No navigation; embeddings are used by similar-posts API
        toast.success("Embedding recomputed for this post")
      })
      .catch((error) => {
        console.error("Failed to recompute embeddings", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        
        if (errorMessage.includes("embedding service") || errorMessage.includes("unavailable")) {
          toast.error("Unable to recompute embedding. The embedding service is not available.")
        } else if (errorMessage.includes("Unauthorized") || errorMessage.includes("Forbidden")) {
          toast.error("You don't have permission to recompute this embedding.")
        } else if (errorMessage.includes("not found")) {
          toast.error("Post not found.")
        } else {
          toast.error("Failed to recompute embedding. Please try again.")
        }
      })
      .finally(() => {
        setIsRecomputing(false)
      })
  }, [post.id, isRecomputing])

  return (
    <div className="space-y-8 sm:space-y-12 lg:space-y-16">
      <div className="max-w-3xl">
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
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="px-4 py-2.5 sm:py-2 bg-primary text-primary-foreground font-bold rounded-sm hover:opacity-90 transition-opacity text-sm text-center touch-manipulation"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="px-4 py-2.5 sm:py-2 border border-destructive text-destructive rounded-sm hover:bg-destructive hover:text-destructive-foreground font-bold transition-colors text-sm touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={handleRecompute}
                  disabled={isRecomputing}
                  className="px-4 py-2.5 sm:py-2 border border-border text-foreground rounded-sm hover:bg-muted font-bold transition-colors text-sm touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecomputing ? "Recomputing..." : "Recompute Embedding"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-sm border border-border bg-card shadow-lg">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-bold text-foreground mb-2">Delete this post?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This action cannot be undone. This will permanently delete your post.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="px-4 py-2.5 sm:py-2 border border-border text-foreground rounded-sm hover:bg-muted font-bold transition-colors text-sm touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2.5 sm:py-2 border border-destructive text-destructive rounded-sm hover:bg-destructive hover:text-destructive-foreground font-bold transition-colors text-sm touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


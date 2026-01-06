"use client"

import type { Post } from "@/lib/types"
import Link from "next/link"

interface PostCardProps {
  post: Post
  href?: string
  onClick?: () => void
}

export function PostCard({ post, href, onClick }: PostCardProps) {
  const content = (
    <div className="border border-border rounded-sm overflow-hidden bg-card hover:border-primary transition-colors cursor-pointer group">
      <div className="aspect-square bg-muted overflow-hidden relative">
        <img
          src={post.imageUrl || "/placeholder.svg"}
          alt={post.caption}
          className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
        />
      </div>
      <div className="p-5">
        <p className="text-sm font-medium text-foreground line-clamp-2 leading-relaxed">{post.caption}</p>
        <p className="text-xs text-muted-foreground mt-3 font-medium">
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
        {post.user && (
          <p className="text-xs text-muted-foreground mt-1">
            Posted by {post.user.name ?? post.user.email ?? "Unknown"}
          </p>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return <div onClick={onClick}>{content}</div>
}


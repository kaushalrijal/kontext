"use client"

import type { Post } from "@/lib/types"
import { PostCard } from "@/components/shared/post-card"

interface GalleryProps {
  posts: Post[]
}

export function Gallery({ posts }: GalleryProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-foreground mb-2">No posts yet</h2>
        <p className="text-muted-foreground">Create your first post to get started</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Feed</h1>
      <p className="text-muted-foreground mb-10">
        {posts.length} post{posts.length !== 1 ? "s" : ""} total
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} href={`/posts/${post.id}`} />
        ))}
      </div>
    </div>
  )
}


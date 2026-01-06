"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createPost } from "@/lib/actions/post.actions"

export function CreatePostForm() {
  const router = useRouter()
  const [caption, setCaption] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [imageFileName, setImageFileName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      setImageFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!caption.trim() || !file) return

    const doCreate = async () => {
      setIsSubmitting(true)
      try {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          throw new Error("Failed to upload image")
        }

        const data = (await res.json()) as { imageUrl: string }

        await createPost({
          caption,
          imageUrl: data.imageUrl,
        })

        router.push("/posts")
      } catch (error) {
        console.error("Failed to create post", error)
      } finally {
        setIsSubmitting(false)
      }
    }

    void doCreate()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground mb-3">Create Post</h1>
      <p className="text-muted-foreground mb-10">Share a new moment with a caption and image</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-bold text-foreground mb-4">Image</label>
          <div className="border-2 border-dashed border-border rounded-sm p-8 text-center bg-secondary hover:border-primary transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full cursor-pointer"
            />
            {!image && <p className="text-sm text-muted-foreground mt-2">Drag and drop or click to select an image</p>}
          </div>
          {image && (
            <div className="mt-6">
              <p className="text-xs font-medium text-muted-foreground mb-3">Preview</p>
              <div className="max-w-sm rounded-sm border border-border overflow-hidden">
                <img src={image || "/placeholder.svg"} alt="Preview" className="w-full aspect-square object-cover" />
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="caption" className="block text-sm font-bold text-foreground mb-4">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your caption..."
            className="w-full px-4 py-3 border border-border rounded-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 resize-none text-sm"
            rows={5}
          />
          <p className="text-xs text-muted-foreground mt-2">{caption.length} characters</p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={!caption.trim() || !image || isSubmitting}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm"
          >
            {isSubmitting ? "Posting..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  )
}


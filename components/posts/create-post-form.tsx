"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createPost } from "@/lib/actions/post.actions"
import { toast } from "sonner"

export function CreatePostForm() {
  const router = useRouter()
  const [caption, setCaption] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [imageFileName, setImageFileName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    setFile(file)
    setImageFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            processFile(file)
            e.preventDefault()
            break
          }
        }
      }
    }

    window.addEventListener("paste", handlePaste)
    return () => {
      window.removeEventListener("paste", handlePaste)
    }
  }, [])

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

        toast.success("Post created")
        router.push("/posts")
      } catch (error) {
        console.error("Failed to create post", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        
        if (errorMessage.includes("embedding service") || errorMessage.includes("unavailable")) {
          toast.error("Unable to create post. The embedding service is not available.")
        } else if (errorMessage.includes("upload")) {
          toast.error("Failed to upload image. Please try again.")
        } else if (errorMessage.includes("Unauthorized")) {
          toast.error("You must be signed in to create posts.")
        } else {
          toast.error("Failed to create post. Please try again.")
        }
      } finally {
        setIsSubmitting(false)
      }
    }

    void doCreate()
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">Create Post</h1>
      <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 lg:mb-10">Share a new moment with a caption and image</p>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div>
          <label className="block text-sm font-bold text-foreground mb-3 sm:mb-4">Image</label>
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-sm p-4 sm:p-6 lg:p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-secondary hover:border-primary"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full cursor-pointer text-xs sm:text-sm"
            />
            {!image && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                {isDragging ? "Drop image here" : "Drag and drop, paste, or click to select an image"}
              </p>
            )}
          </div>
          {image && (
            <div className="mt-4 sm:mt-6">
              <p className="text-xs font-medium text-muted-foreground mb-2 sm:mb-3">Preview</p>
              <div className="max-w-full sm:max-w-sm rounded-sm border border-border overflow-hidden">
                <img src={image || "/placeholder.svg"} alt="Preview" className="w-full aspect-square object-cover" />
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="caption" className="block text-sm font-bold text-foreground mb-3 sm:mb-4">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your caption..."
            className="w-full px-4 py-3 border border-border rounded-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 resize-none text-sm sm:text-base"
            rows={5}
          />
          <p className="text-xs text-muted-foreground mt-2">{caption.length} characters</p>
        </div>

        <div className="flex gap-3 pt-2 sm:pt-4">
          <button
            type="submit"
            disabled={!caption.trim() || !image || isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground font-bold rounded-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm touch-manipulation"
          >
            {isSubmitting ? "Posting..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  )
}


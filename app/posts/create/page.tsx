"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Header } from "@/components/shared/header"
import { CreatePostForm } from "@/components/posts/create-post-form"
import { Skeleton } from "@/components/shared/skeleton"

export default function CreatePostPage() {
  const router = useRouter()
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      setIsLoading(false)
    }

    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
          <Skeleton className="h-10 w-40 rounded-sm" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-sm" />
            <Skeleton className="h-12 w-full rounded-sm" />
            <Skeleton className="h-48 w-full rounded-sm" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-28 rounded-sm" />
              <Skeleton className="h-10 w-28 rounded-sm" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <CreatePostForm />
      </div>
    </main>
  )
}


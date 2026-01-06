"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/shared/skeleton"

export default function Home() {
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/posts")
    }

    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-10 w-full rounded-sm" />
        <Skeleton className="h-24 w-full rounded-sm" />
      </div>
    </div>
  )
}

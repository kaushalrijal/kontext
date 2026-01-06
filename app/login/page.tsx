"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { SignIn } from "@/components/auth/sign-in"

export default function LoginPage() {
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/posts")
    }
  }, [status, router])

  return <SignIn />
}


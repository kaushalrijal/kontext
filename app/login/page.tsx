"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignIn } from "@/components/auth/sign-in"
import { isAuthenticated } from "@/lib/handlers/auth"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/posts")
    }
  }, [router])

  return <SignIn />
}


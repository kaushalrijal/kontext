"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"

export function SignIn() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/posts" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ callbackUrl: "/login" })
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleGuestContinue = () => {
    router.push("/posts")
  }

  const isAuthenticated = status === "authenticated"

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-base sm:text-lg">K</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Kontext</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Share and discover posts</p>
        </div>

        <div className="space-y-6">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-4">Sign in to create, edit, and delete posts</p>
            <p className="text-xs text-muted-foreground">You can view posts without signing in</p>
            {isAuthenticated && (
              <p className="text-sm text-foreground mt-3">
                Signed in as {session?.user?.name ?? session?.user?.email}
              </p>
            )}
          </div>

          {!isAuthenticated ? (
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full px-6 py-3 sm:py-3.5 bg-primary text-primary-foreground font-bold rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
            >
              {isLoading || status === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full px-6 py-3 sm:py-3.5 bg-primary text-primary-foreground font-bold rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
            >
              {isSigningOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Signing out...
                </>
              ) : (
                "Sign out"
              )}
            </button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">or</span>
            </div>
          </div>

          <button
            onClick={handleGuestContinue}
            className="w-full px-6 py-3 sm:py-3.5 border border-border text-foreground font-bold rounded-sm hover:bg-secondary transition-colors text-sm sm:text-base touch-manipulation"
          >
            Continue as Guest
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          Guest users can view posts but cannot create, edit, or delete them
        </p>
      </div>
    </main>
  )
}


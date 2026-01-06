"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const user = session?.user
  const isAuthenticated = status === "authenticated"
  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <Link href="/posts" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center bg-primary/10">
            <img src="/favicon-32x32.png" alt="Kontext logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-semibold text-3xl text-foreground tracking-tight">
            Kontext
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          {isAuthenticated && (
            <>
              {isActive("/posts") && (
                <Link
                  href="/posts/create"
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-sm font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  + Create Post
                </Link>
              )}
              {!isActive("/posts") && (
                <Link
                  href="/posts"
                  className="px-6 py-2 border border-border text-foreground rounded-sm font-medium text-sm hover:bg-secondary transition-colors"
                >
                  Back to Gallery
                </Link>
              )}
            </>
          )}

          <div className="flex items-center gap-4 pl-4 border-l border-border">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user?.name ?? user?.email ?? "Signed in"}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-sm hover:bg-secondary transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn("google", { callbackUrl: "/posts" })}
                className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-sm hover:bg-secondary transition-colors"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}


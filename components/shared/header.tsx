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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/posts" className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm overflow-hidden flex items-center justify-center bg-primary/10 flex-shrink-0">
              <img src="/favicon-32x32.png" alt="Kontext logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-xl sm:text-2xl lg:text-3xl text-foreground tracking-tight truncate">
              Kontext
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 lg:gap-8 min-w-0 flex-shrink">
            {isAuthenticated && (
              <>
                {isActive("/posts") && (
                  <Link
                    href="/posts/create"
                    className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-sm font-medium text-xs sm:text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">+ Create Post</span>
                    <span className="sm:hidden">+ Create</span>
                  </Link>
                )}
                {!isActive("/posts") && (
                  <Link
                    href="/posts"
                    className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 border border-border text-foreground rounded-sm font-medium text-xs sm:text-sm hover:bg-secondary transition-colors whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Back to Gallery</span>
                    <span className="sm:hidden">Back</span>
                  </Link>
                )}
              </>
            )}

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 pl-2 sm:pl-3 lg:pl-4 border-l border-border min-w-0">
              {isAuthenticated ? (
                <>
                  <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[80px] sm:max-w-none">
                    {user?.name ?? user?.email ?? "Signed in"}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-foreground border border-border rounded-sm hover:bg-secondary transition-colors whitespace-nowrap touch-manipulation"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn("google", { callbackUrl: "/posts" })}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-foreground border border-border rounded-sm hover:bg-secondary transition-colors whitespace-nowrap touch-manipulation"
                >
                  <span className="hidden sm:inline">Sign in with Google</span>
                  <span className="sm:hidden">Sign in</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}


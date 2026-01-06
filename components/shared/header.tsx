"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { User } from "@/lib/types"
import { signOut } from "@/lib/handlers/auth"
import { useRouter } from "next/navigation"

interface HeaderProps {
  user: User | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = () => {
    signOut()
    router.push("/login")
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <Link href="/posts" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center bg-primary/10">
            <img src="/favicon-32x32.png" alt="Kontext logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-2xl text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            Kontext
          </span>
        </Link>
        {user && (
          <nav className="flex items-center gap-8">
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
            <div className="flex items-center gap-4 pl-4 border-l border-border">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-sm hover:bg-secondary transition-colors"
              >
                Sign Out
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}


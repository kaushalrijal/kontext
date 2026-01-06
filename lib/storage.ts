import type { Post, User } from "./types"

const POSTS_STORAGE_KEY = "social_posts"
const AUTH_STORAGE_KEY = "user_auth"

export function getPosts(): Post[] {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem(POSTS_STORAGE_KEY)
  return saved ? JSON.parse(saved) : []
}

export function savePosts(posts: Post[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts))
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const saved = localStorage.getItem(AUTH_STORAGE_KEY)
  return saved ? JSON.parse(saved) : null
}

export function saveUser(user: User): void {
  if (typeof window === "undefined") return
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

export function removeUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_STORAGE_KEY)
}


import type { User } from "../types"
import { getUser, saveUser, removeUser } from "../storage"

export function signIn(userData: User): void {
  saveUser(userData)
}

export function signOut(): void {
  removeUser()
}

export function getCurrentUser(): User | null {
  return getUser()
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}


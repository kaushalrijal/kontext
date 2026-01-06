import type { Post } from "../types"
import { getPosts, savePosts } from "../storage"

export function createPost(caption: string, image: string): Post {
  const newPost: Post = {
    id: Date.now().toString(),
    caption,
    image,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const posts = getPosts()
  const updatedPosts = [newPost, ...posts]
  savePosts(updatedPosts)
  return newPost
}

export function updatePost(id: string, caption: string, image: string): Post | null {
  const posts = getPosts()
  const postIndex = posts.findIndex((post) => post.id === id)
  
  if (postIndex === -1) return null
  
  const updatedPost: Post = {
    ...posts[postIndex],
    caption,
    image,
    updatedAt: new Date().toISOString(),
  }
  
  const updatedPosts = [...posts]
  updatedPosts[postIndex] = updatedPost
  savePosts(updatedPosts)
  
  return updatedPost
}

export function deletePost(id: string): boolean {
  const posts = getPosts()
  const filteredPosts = posts.filter((post) => post.id !== id)
  
  if (filteredPosts.length === posts.length) return false
  
  savePosts(filteredPosts)
  return true
}

export function getPostById(id: string): Post | null {
  const posts = getPosts()
  return posts.find((post) => post.id === id) || null
}

export function getAllPosts(): Post[] {
  return getPosts()
}


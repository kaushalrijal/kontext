export interface Post {
  id: string
  caption: string
  imageUrl: string
  userId: string
  createdAt: string | Date
  updatedAt: string | Date
  pineconeCombinedVectorId?: string | null
  embeddingDim?: number | null
  embeddingModel?: string | null
  embeddingUpdatedAt?: string | Date | null
  user?: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export interface User {
  name: string
  email: string
}


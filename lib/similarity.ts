/**
 * Calculate cosine similarity between two strings
 * Using simple term frequency vectorization
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const normalize = (text: string) => {
    return text.toLowerCase().trim().split(/\s+/)
  }

  const terms1 = normalize(text1)
  const terms2 = normalize(text2)

  // Create term frequency maps
  const tfMap1 = createTermFrequencyMap(terms1)
  const tfMap2 = createTermFrequencyMap(terms2)

  // Get all unique terms
  const allTerms = new Set([...Object.keys(tfMap1), ...Object.keys(tfMap2)])

  // Create vectors
  const vector1: number[] = []
  const vector2: number[] = []

  for (const term of allTerms) {
    vector1.push(tfMap1[term] || 0)
    vector2.push(tfMap2[term] || 0)
  }

  // Calculate cosine similarity
  return cosineSimilarity(vector1, vector2)
}

function createTermFrequencyMap(terms: string[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const term of terms) {
    map[term] = (map[term] || 0) + 1
  }
  return map
}

function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length === 0 || vectorB.length === 0) return 0

  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i]
    magnitudeA += vectorA[i] * vectorA[i]
    magnitudeB += vectorB[i] * vectorB[i]
  }

  magnitudeA = Math.sqrt(magnitudeA)
  magnitudeB = Math.sqrt(magnitudeB)

  if (magnitudeA === 0 || magnitudeB === 0) return 0

  return dotProduct / (magnitudeA * magnitudeB)
}

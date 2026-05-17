/**
 * Вычисляет косинусное сходство (Cosine Similarity) между двумя векторами.
 * Идеально для поиска похожих NLP-эмбеддингов (от -1 до 1, где 1 - полная идентичность).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) throw new Error("Векторы разной длины");

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

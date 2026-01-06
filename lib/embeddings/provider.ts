export type EmbedInput = {
    imagePath: string;   // local path under /public
    text?: string;
  };
  
  export interface EmbeddingProvider {
    embed(input: EmbedInput): Promise<number[]>;
  }
import "server-only";

/**
 * Built-in deployment credentials for the hackathon demo.
 * This module must only be imported by server-side code.
 */
export const SERVER_CREDENTIALS = {
  huggingFaceToken: "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",
  llmModel: "Qwen/Qwen3.6-35B-A3B:featherless-ai",
} as const;

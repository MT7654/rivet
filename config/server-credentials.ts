import "server-only";

export const SERVER_CREDENTIALS = {
  huggingFaceTokens: [process.env.HF_TOKEN || "", process.env.HF_TOKEN1 || ""].filter(Boolean),
  primaryModel: "zai-org/GLM-5.2:novita",
  fallbackModel: "Qwen/Qwen3.6-35B-A3B:featherless-ai",
} as const;

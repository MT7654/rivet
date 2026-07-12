import "server-only";

export const SERVER_CREDENTIALS = {
  huggingFaceToken: process.env.HF_TOKEN || "",
  primaryModel: "zai-org/GLM-5.2:novita",
  fallbackModel: "Qwen/Qwen3.6-35B-A3B:featherless-ai",
} as const;

import "server-only";
import OpenAI from "openai";
import { SERVER_CREDENTIALS } from "@/config/server-credentials";
export interface LLMCompletion { content: string; model: string; fallbackUsed: boolean; modelFallbackUsed: boolean; credentialFallbackUsed: boolean; usage: { inputTokens: number; outputTokens: number; totalTokens: number }; durationMs: number }
export interface LLMOptions { maxTokens?: number }
export interface LLMProvider { complete(system: string, user: string, options?: LLMOptions): Promise<LLMCompletion> }
export class HuggingFaceProvider implements LLMProvider {
  private tokens: string[];
  constructor() {
    this.tokens = Array.from(new Set(SERVER_CREDENTIALS.huggingFaceTokens));
    if (!this.tokens.length) throw new Error("Neither HF_TOKEN nor HF_TOKEN1 is configured on the server.");
  }
  async complete(system: string, user: string, options: LLMOptions = {}) {
    const models = [SERVER_CREDENTIALS.primaryModel, SERVER_CREDENTIALS.fallbackModel];
    const failures: string[] = [];
    for (let tokenIndex = 0; tokenIndex < this.tokens.length; tokenIndex += 1) {
      const client = new OpenAI({ baseURL: "https://router.huggingface.co/v1", apiKey: this.tokens[tokenIndex] });
      for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
        const model = models[modelIndex];
        try {
          const startedAt = Date.now();
          const response = await client.chat.completions.create({ model, messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: .2, max_tokens: options.maxTokens || 700 });
          const content = response.choices[0]?.message?.content || "";
          if (!content.trim()) throw new Error("Model returned an empty response");
          return { content, model, fallbackUsed: modelIndex > 0 || tokenIndex > 0, modelFallbackUsed: modelIndex > 0, credentialFallbackUsed: tokenIndex > 0, usage: { inputTokens: response.usage?.prompt_tokens || 0, outputTokens: response.usage?.completion_tokens || 0, totalTokens: response.usage?.total_tokens || 0 }, durationMs: Date.now() - startedAt };
        } catch (error) {
          const status = typeof error === "object" && error !== null && "status" in error ? Number((error as { status?: number }).status) : undefined;
          failures.push(`credential ${tokenIndex + 1}, ${model}: ${error instanceof Error ? error.message : "request failed"}`);
          if (status === 401 || status === 403) break;
        }
      }
    }
    throw new Error(`All configured models failed. ${failures.join(" | ")}`);
  }
}
export function redactSecrets(v:string){return v.replace(/(?:hf_|ghp_|sk-)[A-Za-z0-9_-]{16,}/g,"[REDACTED]").replace(/(api[_-]?key\s*[=:]\s*)[^\s,;]+/gi,"$1[REDACTED]")}

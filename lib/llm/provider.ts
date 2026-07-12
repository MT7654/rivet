import "server-only";
import OpenAI from "openai";
import { SERVER_CREDENTIALS } from "@/config/server-credentials";
export interface LLMCompletion { content: string; model: string; fallbackUsed: boolean }
export interface LLMProvider { complete(system: string, user: string): Promise<LLMCompletion> }
export class HuggingFaceProvider implements LLMProvider {
  private client: OpenAI;
  constructor() {
    if (!SERVER_CREDENTIALS.huggingFaceToken) throw new Error("HF_TOKEN is not configured on the server.");
    this.client = new OpenAI({ baseURL: "https://router.huggingface.co/v1", apiKey: SERVER_CREDENTIALS.huggingFaceToken });
  }
  async complete(system: string, user: string) {
    const models = [SERVER_CREDENTIALS.primaryModel, SERVER_CREDENTIALS.fallbackModel];
    const failures: string[] = [];
    for (let index = 0; index < models.length; index += 1) {
      const model = models[index];
      try {
        const response = await this.client.chat.completions.create({ model, messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: .2 });
        const content = response.choices[0]?.message?.content || "";
        if (!content.trim()) throw new Error("Model returned an empty response");
        return { content, model, fallbackUsed: index > 0 };
      } catch (error) {
        failures.push(`${model}: ${error instanceof Error ? error.message : "request failed"}`);
      }
    }
    throw new Error(`All configured models failed. ${failures.join(" | ")}`);
  }
}
export function redactSecrets(v:string){return v.replace(/(?:hf_|ghp_|sk-)[A-Za-z0-9_-]{16,}/g,"[REDACTED]").replace(/(api[_-]?key\s*[=:]\s*)[^\s,;]+/gi,"$1[REDACTED]")}

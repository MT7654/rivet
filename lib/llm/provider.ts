import "server-only";
import OpenAI from "openai";
import { SERVER_CREDENTIALS } from "@/config/server-credentials";
export interface LLMProvider{complete(system:string,user:string):Promise<string>}
export class HuggingFaceProvider implements LLMProvider{private client:OpenAI;private model:string;constructor(){this.client=new OpenAI({baseURL:"https://router.huggingface.co/v1",apiKey:SERVER_CREDENTIALS.huggingFaceToken});this.model=SERVER_CREDENTIALS.llmModel}async complete(system:string,user:string){const r=await this.client.chat.completions.create({model:this.model,messages:[{role:"system",content:system},{role:"user",content:user}],temperature:.2});return r.choices[0]?.message?.content||""}}
export function redactSecrets(v:string){return v.replace(/(?:hf_|ghp_|sk-)[A-Za-z0-9_-]{16,}/g,"[REDACTED]").replace(/(api[_-]?key\s*[=:]\s*)[^\s,;]+/gi,"$1[REDACTED]")}

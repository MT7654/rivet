import { NextResponse } from "next/server";
import { analyseRepository } from "@/lib/analysis/analyser";
import type { RepositoryFile, RepositoryMetadata } from "@/lib/analysis/types";

export const maxDuration = 60;

const IMPORTANT = /(^|\/)(package\.json|tsconfig[^/]*\.json|\.gitignore|\.env\.example|next\.config\.[^/]+|vercel\.json|Dockerfile|README\.md|[^/]*lock[^/]*|.*\.(ts|tsx|js|jsx|json|ya?ml))$/i;
const EXCLUDED = /(^|\/)(node_modules|\.next|dist|build|coverage|vendor|public\/|assets\/|\.git\/)/i;
const SECRET_FILE = /(^|\/)(\.env($|\.)|.*\.(pem|key|p12|pfx))$/i;

function parseRepository(input: string) {
  const normalised = input.trim().replace(/\.git$/, "");
  const match = normalised.match(/^(?:https?:\/\/github\.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/?$/);
  if (!match) throw new Error("Enter a GitHub repository URL such as https://github.com/owner/repository");
  return { owner: match[1], repo: match[2] };
}

async function github(path: string, token?: string) {
  const response = await fetch(`https://api.github.com${path}`, { headers: { Accept: "application/vnd.github+json", "User-Agent": "Rivet-Readiness-Auditor", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, cache: "no-store" });
  if (!response.ok) {
    if (response.status === 404) throw new Error("Repository or branch not found. Private repositories require a GitHub token.");
    if (response.status === 403) throw new Error("GitHub API limit reached. Add a GitHub token and try again.");
    throw new Error(`GitHub returned ${response.status}`);
  }
  return response.json();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { owner, repo } = parseRepository(String(body.repositoryUrl || ""));
    const token = typeof body.githubToken === "string" && body.githubToken.trim() ? body.githubToken.trim() : undefined;
    const metadata = await github(`/repos/${owner}/${repo}`, token);
    const branch = String(body.branch || metadata.default_branch);
    const tree = await github(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`, token);
    const candidates = (tree.tree || []).filter((item: any) => item.type === "blob" && item.size <= 100_000 && IMPORTANT.test(item.path) && !EXCLUDED.test(item.path) && !SECRET_FILE.test(item.path)).sort((a: any, b: any) => {
      const priority = (path: string) => /package\.json$/.test(path) ? 0 : /(^|\/)\.gitignore$/.test(path) ? 1 : /^\.github\/workflows/.test(path) ? 2 : /(config|route|api|middleware|test|spec)/i.test(path) ? 3 : 5;
      return priority(a.path) - priority(b.path) || a.size - b.size;
    }).slice(0, 45);
    const files: RepositoryFile[] = (await Promise.all(candidates.map(async (item: any) => {
      try {
        const blob = await github(`/repos/${owner}/${repo}/git/blobs/${item.sha}`, token);
        if (blob.encoding !== "base64") return null;
        const content = Buffer.from(blob.content, "base64").toString("utf8").slice(0, 100_000);
        if (content.includes("\u0000")) return null;
        return { path: item.path, content, size: item.size } satisfies RepositoryFile;
      } catch { return null; }
    }))).filter(Boolean) as RepositoryFile[];
    const repository: RepositoryMetadata = { owner, name: repo, url: metadata.html_url, branch, defaultBranch: metadata.default_branch, description: metadata.description, language: metadata.language, visibility: metadata.private ? "private" : "public", stars: metadata.stargazers_count, lastPush: metadata.pushed_at, filesAnalysed: files.length };
    const result = analyseRepository(repository, files);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Repository analysis failed" }, { status: 400 });
  }
}

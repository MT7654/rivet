import { NextResponse } from "next/server";

export const maxDuration = 60;

function parseRepository(input: string) {
  const match = input.trim().replace(/\.git$/, "").match(/^(?:https?:\/\/github\.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/?$/);
  if (!match) throw new Error("Invalid GitHub repository URL");
  return { owner: match[1], repo: match[2] };
}

async function github(path: string, token: string, init: RequestInit = {}) {
  const response = await fetch(`https://api.github.com${path}`, { ...init, headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "Rivet-PR-Workspace", ...(init.headers || {}) }, cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) throw new Error("GitHub rejected the access token.");
    if (response.status === 403) throw new Error(body.message || "The token does not have permission for this action.");
    if (response.status === 405 || response.status === 409) throw new Error(body.message || "GitHub repository rules currently block this action.");
    if (response.status === 422) throw new Error(body.message || "GitHub could not complete this action.");
    throw new Error(body.message || `GitHub returned ${response.status}`);
  }
  return body;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.githubToken || "").trim();
    if (!token) throw new Error("Your GitHub access token is required to continue the PR workflow.");
    const { owner, repo } = parseRepository(String(body.repositoryUrl || ""));
    const number = Number(body.number);
    if (!Number.isInteger(number) || number < 1) throw new Error("Invalid pull request number.");
    const action = String(body.action || "status");

    if (action === "ready") {
      await github(`/repos/${owner}/${repo}/pulls/${number}`, token, { method: "PATCH", body: JSON.stringify({ draft: false }) });
    } else if (action === "review") {
      const event = body.event === "REQUEST_CHANGES" ? "REQUEST_CHANGES" : "APPROVE";
      await github(`/repos/${owner}/${repo}/pulls/${number}/reviews`, token, { method: "POST", body: JSON.stringify({ event, body: String(body.comment || (event === "APPROVE" ? "Reviewed and approved in Rivet." : "Changes requested from Rivet.")) }) });
    } else if (action === "merge") {
      const method = ["merge", "rebase", "squash"].includes(body.mergeMethod) ? body.mergeMethod : "squash";
      const merged = await github(`/repos/${owner}/${repo}/pulls/${number}/merge`, token, { method: "PUT", body: JSON.stringify({ merge_method: method, commit_title: String(body.commitTitle || "Rivet: Production-readiness improvements") }) });
      if (body.deleteBranch && body.branch) await github(`/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(String(body.branch))}`, token, { method: "DELETE" });
      return NextResponse.json({ merged: true, message: merged.message, sha: merged.sha });
    }

    const [pull, files, reviews, user] = await Promise.all([
      github(`/repos/${owner}/${repo}/pulls/${number}`, token),
      github(`/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`, token),
      github(`/repos/${owner}/${repo}/pulls/${number}/reviews?per_page=100`, token),
      github(`/user`, token),
    ]);
    const [checks, status] = await Promise.all([
      github(`/repos/${owner}/${repo}/commits/${pull.head.sha}/check-runs?per_page=100`, token).catch(() => ({ check_runs: [] })),
      github(`/repos/${owner}/${repo}/commits/${pull.head.sha}/status`, token).catch(() => ({ state: "unknown", statuses: [] })),
    ]);
    return NextResponse.json({
      pull: { number: pull.number, title: pull.title, url: pull.html_url, draft: pull.draft, state: pull.state, merged: pull.merged, mergeable: pull.mergeable, mergeableState: pull.mergeable_state, additions: pull.additions, deletions: pull.deletions, changedFiles: pull.changed_files, commits: pull.commits, author: pull.user?.login, head: pull.head.ref, headSha: pull.head.sha, base: pull.base.ref },
      files: files.map((file: any) => ({ filename: file.filename, status: file.status, additions: file.additions, deletions: file.deletions, changes: file.changes, patch: file.patch || "Diff too large to display." })),
      reviews: reviews.map((review: any) => ({ id: review.id, user: review.user?.login, state: review.state, body: review.body, submittedAt: review.submitted_at })),
      checks: checks.check_runs.map((check: any) => ({ name: check.name, status: check.status, conclusion: check.conclusion, url: check.html_url || check.details_url })),
      combinedStatus: status.state,
      viewer: { login: user.login, isAuthor: user.login === pull.user?.login },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Pull request action failed" }, { status: 400 });
  }
}

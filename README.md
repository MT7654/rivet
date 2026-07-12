# Rivet

Rivet turns AI-generated prototypes into reviewable production-readiness improvements. It can inspect public GitHub repositories, run deterministic production-readiness checks, coordinate specialist agents using GLM 5.2 with automatic Qwen 3.6 fallback, generate remediation proposals, and create draft pull requests after explicit authorization.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, choose **Analyse a repository**, and enter a public GitHub URL. Production verification: `npm run typecheck && npm run build`.

## Deployment configuration

Set `HF_TOKEN` and `HF_TOKEN1` in Vercel for resilient live agent reports. Rivet attempts GLM 5.2 first and retries Qwen 3.6 for model failures. If the primary credential is rejected, the same model sequence is retried with `HF_TOKEN1`. Provider configuration is protected by `server-only`, prompts are size-limited, and likely credentials are redacted.

Repository writes require an explicitly supplied fine-grained GitHub token. Rivet creates a separate branch and draft pull request; it never pushes to the default branch, merges, or deploys automatically.

On the Pull Request screen, users paste their own token beginning with `github_pat_`. The in-app guide links to GitHub's token creator and explains how to select the repository and grant Contents and Pull requests read/write access. The token is used for that request only and cleared after success.

For demos and read-only sample repositories, **Preview demo result** shows the complete post-creation state without requiring a token or writing to GitHub. The simulated result is clearly labelled and includes the draft PR, branch, commit, files, and review status a user would see after a successful real run.

## Live behavior and boundaries

- Live: public GitHub metadata, recursive tree ingestion, relevant-file filtering, deterministic checks, readiness scoring, evidence, technology detection, GLM 5.2 agent reports with Qwen 3.6 fallback, navigation, filters, generated remediation proposals, report export, and authorized draft pull-request creation.
- Optional: a GitHub token can be supplied for a single request to inspect private repositories or increase API limits. The token is not stored.
- GitHub writes: a fine-grained token with Contents and Pull requests write access can be supplied for one explicit action. Rivet creates a new branch and draft pull request, then clears the token. It never writes to the default branch or merges automatically.
- Boundary: dependency installation, lint, tests, and build validation require an isolated execution worker or target-repository GitHub Action. Rivet labels these checks as not run.
- Pricing: monetary estimates are deliberately unavailable because provider pricing has not been verified.

## Three-minute demo

1. Open the landing page and explain the Connect → Audit → Delegate → Validate → Review workflow.
2. Enter a public GitHub repository and watch the real ingestion and audit stages.
3. Show the repository-specific score, detected stack, evidence, and projected score.
4. Open Findings, use the search and severity filters, and expand an evidence-backed check.
5. Review the recommended specialist agents and approve execution; GLM 5.2 produces the agent reports with Qwen 3.6 as an automatic backup.
6. Walk through generated file proposals, explicit validation boundaries, and the draft PR preview.
7. Export the final JSON report and highlight the human-review requirement.

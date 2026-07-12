# Rivet

Rivet turns AI-generated prototypes into reviewable production-readiness improvements. It can inspect public GitHub repositories, run deterministic production-readiness checks, coordinate Qwen 3.6 specialist agents, generate remediation proposals, and create draft pull requests after explicit authorization.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, choose **Analyse a repository**, and enter a public GitHub URL. Production verification: `npm run typecheck && npm run build`.

## Deployment configuration

No Vercel environment variables are required for the hackathon deployment. The throwaway Hugging Face credential and `Qwen/Qwen3.6-35B-A3B:featherless-ai` model selection live in `config/server-credentials.ts`. That module is protected by `server-only` and is only imported by the server-side `/api/agents` route, so the credential is not included in browser bundles. Prompts are size-limited and likely credentials are redacted.

Repository writes require an explicitly supplied fine-grained GitHub token. Rivet creates a separate branch and draft pull request; it never pushes to the default branch, merges, or deploys automatically.

## Live behavior and boundaries

- Live: public GitHub metadata, recursive tree ingestion, relevant-file filtering, deterministic checks, readiness scoring, evidence, technology detection, Qwen 3.6 agent reports, navigation, filters, generated remediation proposals, report export, and authorized draft pull-request creation.
- Optional: a GitHub token can be supplied for a single request to inspect private repositories or increase API limits. The token is not stored.
- GitHub writes: a fine-grained token with Contents and Pull requests write access can be supplied for one explicit action. Rivet creates a new branch and draft pull request, then clears the token. It never writes to the default branch or merges automatically.
- Boundary: dependency installation, lint, tests, and build validation require an isolated execution worker or target-repository GitHub Action. Rivet labels these checks as not run.
- Pricing: monetary estimates are deliberately unavailable because Qwen 3.6 provider pricing has not been verified.

## Three-minute demo

1. Open the landing page and explain the Connect → Audit → Delegate → Validate → Review workflow.
2. Enter a public GitHub repository and watch the real ingestion and audit stages.
3. Show the repository-specific score, detected stack, evidence, and projected score.
4. Open Findings, use the search and severity filters, and expand an evidence-backed check.
5. Review the recommended specialist agents and approve execution; Qwen 3.6 produces the agent reports.
6. Walk through generated file proposals, explicit validation boundaries, and the draft PR preview.
7. Export the final JSON report and highlight the human-review requirement.

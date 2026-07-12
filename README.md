# Rivet

Rivet turns AI-generated prototypes into reviewable production-readiness improvements. It can inspect public GitHub repositories, run deterministic production-readiness checks, coordinate GLM 5.2 specialist agents, generate remediation proposals, and prepare a draft pull-request description.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, choose **Analyse a repository**, and enter a public GitHub URL. Production verification: `npm run typecheck && npm run build`.

## Deployment configuration

No Vercel environment variables are required for the hackathon deployment. The throwaway Hugging Face credential and `zai-org/GLM-5.2:novita` model selection live in `config/server-credentials.ts`. That module is protected by `server-only` and is only imported by the server-side `/api/agents` route, so the credential is not included in browser bundles. Prompts are size-limited and likely credentials are redacted.

The current UI intentionally disables repository writes: it never pushes to a default branch, merges, or deploys. A future live GitHub integration should use a separately configured credential rather than embedding a repository write token.

## Live behavior and boundaries

- Live: public GitHub metadata, recursive tree ingestion, relevant-file filtering, deterministic checks, readiness scoring, evidence, technology detection, GLM 5.2 agent reports, navigation, filters, generated remediation proposals, report export, and PR-description preview.
- Optional: a GitHub token can be supplied for a single request to inspect private repositories or increase API limits. The token is not stored.
- Boundary: proposed changes are not written to the target repository. Creating branches and draft pull requests requires a future GitHub App or user-scoped OAuth connection.
- Boundary: dependency installation, lint, tests, and build validation require an isolated execution worker or target-repository GitHub Action. Rivet labels these checks as not run.
- Pricing: monetary estimates are deliberately unavailable because GLM 5.2 provider pricing has not been verified.

## Three-minute demo

1. Open the landing page and explain the Connect → Audit → Delegate → Validate → Review workflow.
2. Enter a public GitHub repository and watch the real ingestion and audit stages.
3. Show the repository-specific score, detected stack, evidence, and projected score.
4. Open Findings, use the search and severity filters, and expand an evidence-backed check.
5. Review the recommended specialist agents and approve execution; GLM 5.2 produces the agent reports.
6. Walk through generated file proposals, explicit validation boundaries, and the draft PR preview.
7. Export the final JSON report and highlight the human-review requirement.

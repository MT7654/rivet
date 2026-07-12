# Rivet

Rivet turns AI-generated prototypes into reviewable production-readiness improvements. The included demo walks through audit, agent selection, estimates, proposed changes, simulated validation, and a draft pull-request preview.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and choose **Open demo**. Production verification: `npm run typecheck && npm run build`.

## Deployment configuration

No Vercel environment variables are required for the hackathon deployment. The throwaway Hugging Face credential and `zai-org/GLM-5.2:novita` model selection live in `config/server-credentials.ts`. That module is protected by `server-only` and is only imported by the server-side `/api/agents` route, so the credential is not included in browser bundles. Prompts are size-limited and likely credentials are redacted.

The current UI intentionally disables repository writes: it never pushes to a default branch, merges, or deploys. A future live GitHub integration should use a separately configured credential rather than embedding a repository write token.

## Real and simulated behavior

- Real: responsive Next.js application, server-only Hugging Face provider, GLM 5.2 agent endpoint, prompt redaction, model abstraction, production build.
- Simulated: demo repository analysis, agent execution, diffs, validation, token consumption, and PR preview. All simulated results are labelled.
- Limitation: live GitHub repository reading/writing and sandboxed patch execution are not connected yet. Provider pricing is deliberately shown as unavailable because it has not been verified.

## Three-minute demo

1. Open the landing page and explain the Connect → Audit → Delegate → Validate → Review workflow.
2. Select **Open demo** and watch the repository audit stages.
3. Show the 42/100 report, priority evidence, and projected 73/100 score.
4. Review the four specialist agents, keep Security, Testing, and CI/CD selected, then approve execution.
5. Walk through the realistic diff and its clearly simulated validation state.
6. Prepare the draft PR, highlight the human-review requirement, and explain that Rivet cannot merge or deploy automatically.

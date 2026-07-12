export type Severity = "critical" | "high" | "medium" | "low";
export type FindingStatus = "failed" | "warning" | "passed";

export interface RepositoryMetadata {
  owner: string;
  name: string;
  url: string;
  branch: string;
  defaultBranch: string;
  description: string | null;
  language: string | null;
  visibility: "public" | "private";
  stars: number;
  lastPush: string;
  filesAnalysed: number;
}

export interface RepositoryFile {
  path: string;
  content: string;
  size: number;
}

export interface Finding {
  id: string;
  category: string;
  title: string;
  status: FindingStatus;
  severity: Severity;
  explanation: string;
  remediation: string;
  evidence: string;
  file: string;
  confidence: number;
  agentId: string;
  autoFixable: boolean;
  effort: string;
}

export interface Technology {
  name: string;
  value: string;
  confidence: number;
  evidence: string;
}

export interface AnalysisResult {
  repository: RepositoryMetadata;
  score: number;
  projectedScore: number;
  label: string;
  summary: string;
  findings: Finding[];
  technologies: Technology[];
  analysedAt: string;
  mode: "live" | "demo";
  limitations: string[];
}

export interface ProposedChange {
  path: string;
  status: "added" | "modified";
  agentId: string;
  reason: string;
  diff: string;
}

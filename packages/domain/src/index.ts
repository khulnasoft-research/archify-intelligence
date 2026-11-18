import type { DataClassification, ProviderMode } from '@archify-intelligence/contracts';

export type ProviderKind = 'jev' | 'local-model' | 'rules';
export type EvidenceType = 'source' | 'manifest' | 'schema' | 'config' | 'git-diff' | 'test' | 'documentation';
export type NodeKind = 'frontend' | 'backend' | 'database' | 'cloud' | 'security' | 'messagebus' | 'external' | 'library' | 'worker' | 'unknown';
export type RelationKind = 'calls' | 'imports' | 'reads' | 'writes' | 'publishes' | 'subscribes' | 'authenticates' | 'authorizes' | 'deploys' | 'depends-on' | 'unknown';
export type Provenance = 'static' | 'agent-inferred' | 'user-authored' | 'imported';

export interface EvidenceRef {
  id: string;
  repositoryId: string;
  commitSha: string;
  path: string;
  startLine?: number;
  endLine?: number;
  blobSha?: string;
  evidenceType: EvidenceType;
  excerptHash: string;
  redactionApplied: boolean;
}
export interface GraphNode {
  id: string; kind: NodeKind; name: string; description?: string; path?: string;
  tags: string[]; evidenceIds: string[]; provenance: Provenance;
  confidenceBand?: 'verified' | 'supported' | 'tentative';
}
export interface GraphEdge {
  id: string; from: string; to: string; relation: RelationKind; description?: string;
  evidenceIds: string[]; provenance: Provenance;
}
export interface CanonicalGraph {
  schemaVersion: '1.0'; projectId: string; repositoryId: string; snapshotId: string;
  commitSha: string; generatedAt: string; nodes: GraphNode[]; edges: GraphEdge[];
  evidence: EvidenceRef[]; unknowns: string[];
}
export interface ProviderRouteContext {
  mode: ProviderMode; dataClassification: DataClassification; remoteAllowed: boolean;
  localProviderAvailable: boolean; jevEnabled: boolean; jevHealthy: boolean;
}

export function stableId(namespace: string, value: string): string {
  const normalized = `${namespace}:${value.trim().toLowerCase()}`;
  // Deterministic non-cryptographic ID for graph identity only. Use SHA-256 for security hashes.
  let hash = 2166136261;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${namespace}_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

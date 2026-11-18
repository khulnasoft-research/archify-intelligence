import { describe, expect, it } from 'vitest';
import { diffGraphs } from './index.js';
import type { CanonicalGraph } from '@archify-intelligence/domain';

const graph = (commitSha: string, nodeIds: string[]): CanonicalGraph => ({
  schemaVersion: '1.0', projectId: 'p1', repositoryId: 'r1', snapshotId: commitSha,
  commitSha, generatedAt: new Date(0).toISOString(),
  nodes: nodeIds.map((id) => ({ id, kind: 'backend', name: id, tags: [], evidenceIds: [], provenance: 'static' })),
  edges: [], evidence: [], unknowns: [],
});

describe('diffGraphs', () => {
  it('detects added and removed nodes', () => {
    const result = diffGraphs(graph('base', ['a', 'b']), graph('head', ['b', 'c']));
    expect(result.addedNodes.map((node) => node.id)).toEqual(['c']);
    expect(result.removedNodes.map((node) => node.id)).toEqual(['a']);
  });
});

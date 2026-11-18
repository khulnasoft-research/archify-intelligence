import type { CanonicalGraph } from '@archify-intelligence/domain';

export type ArchifyDiagramType = 'architecture' | 'workflow' | 'sequence' | 'dataflow' | 'lifecycle' | 'erd' | 'class' | 'tree' | 'timeline' | 'waterfall';
export interface ArchifyRenderRequest {
  graph: CanonicalGraph;
  diagramType: ArchifyDiagramType;
  outputPath: string;
  repositoryRoot: string;
}
export interface ArchifyFinalizeReceipt {
  success: boolean;
  rendererVersion: string;
  sourceCommit: string;
  outputPath: string;
  receiptHash?: string;
  errors: string[];
}
export interface ArchifyRenderer {
  render(request: ArchifyRenderRequest, signal?: AbortSignal): Promise<ArchifyFinalizeReceipt>;
}

export class PinnedArchifyCliAdapter implements ArchifyRenderer {
  constructor(private readonly options: { repoPath: string; expectedCommit: string }) {
    if (!/^[0-9a-f]{40}$/i.test(options.expectedCommit)) {
      throw new Error('ARCHIFY_EXPECTED_COMMIT must be a full 40-character commit SHA before rendering is enabled');
    }
  }
  async render(_request: ArchifyRenderRequest, _signal?: AbortSignal): Promise<ArchifyFinalizeReceipt> {
    // Intentionally not shelling out until upstream CLI/schema contract is pinned and contract-tested.
    throw new Error(`Archify runtime not bootstrapped. Verify ${this.options.repoPath} at ${this.options.expectedCommit}, then implement the documented finalize invocation.`);
  }
}

import type { CanonicalGraph, GraphEdge, GraphNode } from '@archify-intelligence/domain';

export interface GraphDelta {
  addedNodes: GraphNode[]; removedNodes: GraphNode[]; changedNodes: GraphNode[];
  addedEdges: GraphEdge[]; removedEdges: GraphEdge[];
}

export function diffGraphs(base: CanonicalGraph, head: CanonicalGraph): GraphDelta {
  const baseNodes = new Map(base.nodes.map((node) => [node.id, node]));
  const headNodes = new Map(head.nodes.map((node) => [node.id, node]));
  const baseEdges = new Map(base.edges.map((edge) => [edge.id, edge]));
  const headEdges = new Map(head.edges.map((edge) => [edge.id, edge]));
  const addedNodes = [...headNodes].filter(([id]) => !baseNodes.has(id)).map(([, node]) => node);
  const removedNodes = [...baseNodes].filter(([id]) => !headNodes.has(id)).map(([, node]) => node);
  const changedNodes = [...headNodes].filter(([id, node]) => {
    const previous = baseNodes.get(id);
    return previous !== undefined && JSON.stringify(previous) !== JSON.stringify(node);
  }).map(([, node]) => node);
  const addedEdges = [...headEdges].filter(([id]) => !baseEdges.has(id)).map(([, edge]) => edge);
  const removedEdges = [...baseEdges].filter(([id]) => !headEdges.has(id)).map(([, edge]) => edge);
  return { addedNodes, removedNodes, changedNodes, addedEdges, removedEdges };
}

import { LoroDoc, LoroList, LoroMap } from 'loro-crdt';
import {
	ListPickerData,
	MediaListData,
	TextNodeData,
} from './nodes/node-types.svelte';
import { getContext, setContext } from 'svelte';
import type { Connection, Edge, Node } from '@xyflow/svelte';

interface Structure {
	nodes: LoroMap;
	edges: LoroMap;
}

export class FlowDoc {
	doc: LoroDoc;
	loroNodes: LoroMap;
	loroEdges: LoroMap;

	constructor() {
		this.doc = new LoroDoc();
		this.doc.setPeerId(1n);
		this.loroNodes = this.doc.getMap('nodes');
		this.loroEdges = this.doc.getMap('edges');
	}

	addOrModifyNodeData(node: {
		id: string;
		data: Record<string, unknown>;
		type: string;
	}) {
		const nodeMap = this.loroNodes.getOrCreateContainer(node.id, new LoroMap());
		const dataMap = nodeMap.setContainer('data', new LoroMap());
		Object.entries(node.data).forEach(([key, value]) => {
			dataMap.set(key, value);
		});
		nodeMap.set('type', node.type);
		// TODO: maybe?
		// nodeMap.set('position', node.position);
		this.doc.commit();
	}

	modifyNodePosition(node: Node) {
		const nodeMap = this.loroNodes.getOrCreateContainer(node.id, new LoroMap());
		const positionMap = nodeMap.getOrCreateContainer('position', new LoroMap());
		positionMap.set('x', node.position.x);
		positionMap.set('y', node.position.y);
		this.doc.commit();
	}
	deleteNode(node: Node) {
		this.loroNodes.delete(node.id);
	}
	addOrModifyEdge(edge: Edge) {
		const edgeMap = this.loroEdges.getOrCreateContainer(edge.id, new LoroMap());
		edgeMap.set('source', edge.source);
		edgeMap.set('sourceHandle', edge.sourceHandle);
		edgeMap.set('target', edge.target);
		this.doc.commit();
	}

	deleteEdge(edge: Edge) {
		this.loroEdges.delete(edge.id);
		this.doc.commit();
	}
}

const FLOW_DOC_KEY = Symbol('flowDoc');

export function setFlowDoc() {
	const flowDoc = new FlowDoc();
	setContext(FLOW_DOC_KEY, flowDoc);
	return flowDoc;
}

export function getFlowDoc() {
	return getContext<FlowDoc>(FLOW_DOC_KEY);
}

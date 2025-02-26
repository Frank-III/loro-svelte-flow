import { LoroDoc, LoroList, LoroMap } from 'loro-crdt';
import {
	ListPickerData,
	MediaListData,
	TextNodeData,
} from './nodes/node-types.svelte';
import { getContext, setContext } from 'svelte';
import type { Connection, Edge, Node } from '@xyflow/svelte';

interface Structure {
	nodes: LoroMap<{
		data: LoroMap<Record<string, unknown>>;
		position: LoroMap<{
			x: number;
			y: number;
		}>;
		type: string;
	}>;
	edges: LoroMap<{
		source: string;
		sourceHandle: string;
		target: string;
		targetHandle: string;
	}>;
}

export class FlowDoc {
	doc: LoroDoc = $state(new LoroDoc());
	isSyncing = $state(false);
	peerId: number;

	constructor(doc: LoroDoc = new LoroDoc()) {
		this.doc = doc;
		this.peerId = Math.random() * 1000;
		this.doc.setPeerId(this.peerId);
	}

	addOrModifyNodeData(node: {
		id: string;
		data: Record<string, unknown>;
		position: {
			x: number;
			y: number;
		};
		type: string;
	}) {
		if (this.isSyncing) return;
		const nodeMap = this.loroNodes.getOrCreateContainer(node.id, new LoroMap());
		const dataMap = nodeMap.getOrCreateContainer('data', new LoroMap());
		Object.entries(node.data).forEach(([key, value]) => {
			dataMap.set(key, value);
		});
		nodeMap.set('type', node.type);
		// TODO: maybe?
		const positionMap = nodeMap.getOrCreateContainer('position', new LoroMap());
		positionMap.set('x', node.position.x);
		positionMap.set('y', node.position.y);
		this.commit(0);
	}

	modifyNodePosition(node: Node) {
		if (this.isSyncing) return;
		const nodeMap = this.loroNodes.getOrCreateContainer(node.id, new LoroMap());
		const positionMap = nodeMap.getOrCreateContainer('position', new LoroMap());
		positionMap.set('x', node.position.x);
		positionMap.set('y', node.position.y);
		this.commit(1);
	}

	deleteNode(node: Node) {
		if (this.isSyncing) return;
		this.loroNodes.delete(node.id);
		this.commit(2);
	}

	addOrModifyEdge(edge: Edge) {
		if (this.isSyncing) return;
		const edgeMap = this.loroEdges.getOrCreateContainer(edge.id, new LoroMap());
		edgeMap.set('source', edge.source);
		edgeMap.set('sourceHandle', edge.sourceHandle);
		edgeMap.set('target', edge.target);
		this.commit(3);
	}

	deleteEdge(edge: Edge) {
		if (this.isSyncing) return;
		this.loroEdges.delete(edge.id);
		this.commit(4);
	}

	commit(from: number) {
		console.log('committing', from);
		this.doc.commit();
	}

	get loroNodes() {
		return this.doc.getMap('nodes');
	}

	get loroEdges() {
		return this.doc.getMap('edges');
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

// @ts-nocheck

// import { type ClassValue, clsx } from "clsx";
// import { twMerge } from "tailwind-merge";
// import { getFlowDoc } from '../routes/collaborative-flow/LoroDoc.svelte';
import type { Node } from '@xyflow/svelte';
import type { LoroMap } from 'loro-crdt';
// import {
// 	ListPickerData,
// 	MediaListData,
// 	TextListData,
// 	TextNodeData,
// } from '../routes/collaborative-flow/nodes/node-types.svelte';
// export function cn(...inputs: ClassValue[]) {
// 	return twMerge(clsx(inputs));
// }

export function constructNodesFromLoroMap(loroMap: LoroMap): Node[] {
	console.log('constructing nodes from loro map', loroMap.toJSON());
	return Object.entries(loroMap.toJSON()).map(([id, node]) => {
		let data;
		switch (node.type) {
			case 'text':
				data = { text: node.data.text || '' };
				break;
			case 'textList':
				data = {
					label: node.data.label || '',
					items: node.data.items || [{ id: crypto.randomUUID(), text: '' }],
				};
				break;
			case 'mediaList':
				data = {
					label: node.data.label || '',
					items: node.data.items || [
						{ id: crypto.randomUUID(), text: '', imageUrl: '' },
					],
				};
				break;
			case 'picker': {
				const options = node.data.options ?? [
					'Option 1',
					'Option 2',
					'Option 3',
				];
				const selected = node.data.selected ?? 0;
				data = {
					label: node.data.label || '',
					options,
					selected,
					selectedOption: options[selected],
				};
				break;
			}
			default:
				data = node.data || {};
		}
		return {
			...node,
			id,
			data,
		};
	});
}

export function constructEdgesFromLoroMap(loroMap: LoroMap): Edge[] {
	return Object.entries(loroMap.toJSON()).map(([id, edge]) => {
		return {
			id,
			...edge,
		};
	});
}

// @ts-nocheck

// import { type ClassValue, clsx } from "clsx";
// import { twMerge } from "tailwind-merge";

import type { LoroMap } from 'loro-crdt';
import {
	ListPickerData,
	MediaListData,
	TextListData,
	TextNodeData,
} from '../routes/collaborative-flow/nodes/node-types.svelte';
import type { Node } from '@xyflow/svelte';
// export function cn(...inputs: ClassValue[]) {
// 	return twMerge(clsx(inputs));
// }

export function constructNodesFromLoroMap(loroMap: LoroMap): Node[] {
	console.log('constructing nodes from loro map', loroMap.toJSON());
	return Object.entries(loroMap.toJSON()).map(([id, node]) => {
		let data;
		switch (node.type) {
			case 'text':
				data = new TextNodeData(node.data.text);
				break;
			case 'textList':
				data = new TextListData(node.data.label, node.data.items);
				break;
			case 'mediaList':
				data = new MediaListData(node.data.label, node.data.items);
				break;
			case 'listPicker':
				data = new ListPickerData(
					node.data.label,
					node.data.options,
					node.data.selected,
				);
				break;
		}
		return {
			...node,
			id,
			data: data,
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

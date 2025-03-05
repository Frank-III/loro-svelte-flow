import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { constructEdgesFromLoroMap, constructNodesFromLoroMap } from '@/utils';
import { LoroDoc } from 'loro-crdt';

export const load: PageServerLoad = async ({ params, platform }) => {
	const roomId = params.room;
	// Access Cloudflare bindings directly
	const FLOW_BUCKET = platform?.env?.FLOW_BUCKET;

	const doc = await FLOW_BUCKET?.get(roomId).then((doc) => doc?.arrayBuffer());

	console.log('doc', doc);

	if (!doc) {
		return {
			doc: undefined,
			nodes: [],
			edges: [],
		};
	}

	const flowDoc = LoroDoc.fromSnapshot(new Uint8Array(doc));
	return {
		doc: new Uint8Array(doc),
		nodes: constructNodesFromLoroMap(flowDoc.getMap('nodes')),
		edges: constructEdgesFromLoroMap(flowDoc.getMap('edges')),
	};
};

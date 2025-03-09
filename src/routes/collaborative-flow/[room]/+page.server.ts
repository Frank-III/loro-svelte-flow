import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { constructEdgesFromLoroMap, constructNodesFromLoroMap } from '@/utils';
import { PUBLIC_ENV, PUBLIC_DURABLE_OBJECT_ENDPOINT } from '$env/static/public';
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

// rename flow
export const actions: Actions = {
	rename: async ({ params, request, fetch }) => {
		const roomId = params.room;
		const formData = await request.formData();
		const newName = formData.get('name');
		if (!newName) {
			return fail(400, { message: 'Name is required' });
		}
		console.log('newName', newName);
		console.log(
			'url',
			`${PUBLIC_DURABLE_OBJECT_ENDPOINT}/flows/rename/${roomId}`,
		);
		const protocol = PUBLIC_ENV === 'dev' ? 'http' : 'https';
		const response = await fetch(
			`${protocol}://${PUBLIC_DURABLE_OBJECT_ENDPOINT}/flows/rename/${roomId}`,
			{
				method: 'POST',
				body: JSON.stringify({ name: newName }),
				headers: {
					'Content-Type': 'application/json',
				},
			},
		);
		if (!response.ok) {
			return fail(500, { message: 'Failed to rename flow' });
		}
		return redirect(302, `/collaborative-flow/${newName}`);
	},
};

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const FLOW_BUCKET = platform?.env?.FLOW_BUCKET;
	const FLOW_KV = platform?.env?.FLOW_KV;

	const allFlows = await FLOW_BUCKET?.list();

	const flows = await Promise.all(
		allFlows?.objects.map(async (flow) => {
			const meta = await FLOW_KV?.get(`flow:${flow.key}:meta`, 'text');
			return {
				flow_id: flow.key,
				meta: meta ?? null,
			};
		}) ?? [],
	);

	return {
		flows,
	};
};

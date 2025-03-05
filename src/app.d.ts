/// <reference types="@cloudflare/workers-types" />

declare global {
	namespace App {
		interface Platform {
			env: {
				FLOW_BUCKET: R2Bucket;
				FLOW_KV: KVNamespace;
			};
			context: ExecutionContext;
		}
		// interface Locals {}
		// interface Error {}
		// interface Session {}
		// interface Stuff {}
	}
}

export {};

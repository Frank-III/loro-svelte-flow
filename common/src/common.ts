import { z } from 'zod';

export const clientToServerSchema = z.object({
	type: z.literal('broadcast'),
	payload: z.string(),
});

export type ClientToServer = z.infer<typeof clientToServerSchema>;

export type ServerToClient =
	| {
			type: 'delta';
			payload: Uint8Array;
	  }
	| {
			type: 'version';
			payload: Uint8Array;
	  }
	| {
			type: 'delta-and-version';
			payload: {
				delta: Uint8Array;
				version: Uint8Array;
			};
	  }
	| {
			type: 'version-and-doc';
			payload: {
				version: Uint8Array;
				doc: Uint8Array;
			};
	  };

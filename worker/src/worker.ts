import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';
import { ServerToClient, clientToServerSchema } from 'common';
import { LoroDoc, VersionVector } from 'loro-crdt';

export class SocketObject extends DurableObject {
	flowDoc: LoroDoc;
	clientVersion: Map<WebSocket, VersionVector>;
	lastSaveTime: number = 0;
	saveInterval: number = 60000; // Save every minute
	hasActiveConnections: boolean = false;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.flowDoc = new LoroDoc();
		this.flowDoc.setPeerId(999n);
		this.clientVersion = new Map();

		ctx.blockConcurrencyWhile(async () => {
			try {
				const stored = await ctx.storage.get<Uint8Array>('flowState');
				if (stored) {
					this.flowDoc = LoroDoc.fromSnapshot(new Uint8Array(stored));
				}
			} catch (error) {
				console.error('Error initializing document:', error);
			}
		});
	}

	// Handle alarm event - this will be called when the alarm fires
	async alarm() {
		console.log('Alarm triggered - saving flow state');
		await this.saveToStorage(true); // Force save regardless of time interval

		// Only schedule next alarm if we have active connections
		if (this.hasActiveConnections) {
			this.scheduleNextSave();
		}
	}

	// Schedule the next save operation
	scheduleNextSave() {
		this.ctx.storage.setAlarm(Date.now() + this.saveInterval);
		console.log(`Next save scheduled in ${this.saveInterval}ms`);
	}

	async saveToStorage(force: boolean = false) {
		const now = Date.now();
		// Only save if enough time has passed since last save or if forced
		if (!force && now - this.lastSaveTime < this.saveInterval) return;

		this.lastSaveTime = now;
		const state = this.flowDoc.export({ mode: 'snapshot' });
		await this.ctx.storage.put('flowState', state);
		console.log('Saved flow state to DO storage');
		// Also save to R2 and KV for persistence
		await this.saveToR2AndKV();
	}

	async saveToR2AndKV() {
		if (!this.ctx.id) return;

		try {
			// Save binary state to R2
			const state = this.flowDoc.export({ mode: 'snapshot' });
			const env = this.env as Env;
			await env.FLOW_BUCKET.put(`${this.ctx.id}`, state);

			// Extract and save metadata to KV
			const metadata = {
				lastModified: Date.now(),
				// version: this.flowDoc.version().toJSON(),
				nodes_count: this.flowDoc.getMap('nodes').size,
				edges_count: this.flowDoc.getMap('edges').size,
				// You could extract node/edge counts or other metadata here
			};

			await env.FLOW_KV.put(
				`flow:${this.ctx.id}:meta`,
				JSON.stringify(metadata),
			);
			console.log('Saved flow to R2 and KV', this.ctx.id);
		} catch (e) {
			console.error('Failed to save to R2/KV:', e);
		}
	}

	webSocketMessage(
		_ws: WebSocket,
		message: string | ArrayBuffer,
	): void | Promise<void> {
		// if (typeof message !== 'string') return;
		// const parsed = clientToServerSchema.safeParse(JSON.parse(message));
		// if (!parsed.success) return;
		// const { type, payload } = parsed.data;
		// if (type === 'broadcast') {
		// 	const message = JSON.stringify({
		// 		type: 'message',
		// 		payload,
		// 	} as ServerToClient);
		// 	for (const ws of this.ctx.getWebSockets()) {
		// 		ws.send(message);
		// 	}
		// }
		if (typeof message === 'string') {
			console.log('Got string data from client:', message);
			return;
		}
		this.flowDoc.import(new Uint8Array(message));
		const serverVersion = this.flowDoc.version();
		console.log('serverVersion', JSON.stringify(serverVersion.encode()));
		this.clientVersion.set(_ws, serverVersion);

		// No need to save immediately - the alarm will handle regular saves
		// Just update the data in memory

		for (const ws of this.ctx.getWebSockets()) {
			if (ws === _ws) {
				ws.send(
					JSON.stringify({
						type: 'version',
						payload: serverVersion.encode(),
					}),
				);
			} else {
				const lastKnownVersion = this.clientVersion.get(ws);
				const delta = this.flowDoc.export({
					mode: 'update',
					from: lastKnownVersion!,
				});
				// console.log('delta', delta);
				ws.send(
					JSON.stringify({
						type: 'delta-and-version',
						payload: {
							delta: delta,
							version: serverVersion.encode(),
						},
					}),
				);
				this.clientVersion.set(ws, serverVersion);
			}
		}
	}

	// Handle WebSocket close event
	webSocketClose(ws: WebSocket) {
		// Remove the client from our version tracking
		this.clientVersion.delete(ws);

		// If no more connections, perform a final save and cancel future alarms
		if (this.ctx.getWebSockets().length === 0) {
			this.hasActiveConnections = false;
			// Do a final save
			this.saveToStorage(true).catch((err) =>
				console.error('Final save error:', err),
			);
			// Clear any scheduled alarms
			this.ctx.storage.deleteAlarm();
			console.log(
				'Last connection closed, performed final save and cleared alarms',
			);
		}
	}

	async fetch(_req: Request): Promise<Response> {
		try {
			const stored = await this.ctx.storage.get<Uint8Array>('flowState');
			if (stored) {
				this.flowDoc.import(stored);
				console.log('Loaded flow from storage');
			}
		} catch (e) {
			console.error('Failed to load from storage:', e);
		}

		if (!this.hasActiveConnections) {
			this.hasActiveConnections = true;
			this.scheduleNextSave();
			console.log('First connection established, scheduled regular saves');
		}
		const { 0: client, 1: server } = new WebSocketPair();

		this.ctx.acceptWebSocket(server);
		this.clientVersion.set(client, this.flowDoc.version());
		console.log('version', this.flowDoc.version().toJSON());
		server.send(
			JSON.stringify({
				type: 'version-and-doc',
				payload: {
					version: this.flowDoc.version().encode(),
					doc: this.flowDoc.export({ mode: 'snapshot' }),
				},
			}),
		);

		// Schedule the first save if this is the first connection
		if (!this.hasActiveConnections) {
			this.hasActiveConnections = true;
			this.scheduleNextSave();
			console.log('First connection established, scheduled regular saves');
		}

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}
}

const app = new Hono<{ Bindings: Env }>();

app.get('/parties/main/:room', (c) => {
	const upgrade = c.req.header('Upgrade');
	if (upgrade !== 'websocket') {
		c.status(426);
		return c.body('WebSocket connection required');
	}
	const id = c.env.SOCKET_OBJECT.idFromName(c.req.param('room'));
	const socket = c.env.SOCKET_OBJECT.get(id);
	return socket.fetch(c.req.raw);
});

app.get('/flows', async (c) => {
	const list = await c.env.FLOW_KV.list({ prefix: 'flow:' });
	const flows = await Promise.all(
		list.keys.map(async (key) => {
			const meta = JSON.parse(
				(await c.env.FLOW_KV.get(key.name, 'json')) ?? '{}',
			);
			const roomId = key.name.split(':')[1];
			return {
				roomId,
				...meta,
			};
		}),
	);

	return c.json(flows);
});

export default app;

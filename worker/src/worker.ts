import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';
import { ServerToClient, clientToServerSchema, renameFlowSchema } from 'common';
import { LoroDoc, VersionVector } from 'loro-crdt';
import { validator } from 'hono/validator';
export class SocketObject extends DurableObject {
	flowDoc: LoroDoc;
	clientVersion: Map<WebSocket, VersionVector>;
	lastSaveTime: number = 0;
	saveInterval: number = 30000; // Save every 30 seconds
	hasActiveConnections: boolean = false;
	deleted: boolean = false;
	roomId?: string;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.flowDoc = new LoroDoc();
		this.flowDoc.setPeerId(999n);
		this.clientVersion = new Map();

		ctx.blockConcurrencyWhile(async () => {
			try {
				const stored = await ctx.storage.get<Uint8Array>('flowState');
				if (!this.roomId) {
					this.roomId = await ctx.storage.get('roomId');
				}
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
		if (this.deleted) return;
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
		try {
			const name = this.roomId;
			if (!name) return;

			// Save binary state to R2
			const state = this.flowDoc.export({ mode: 'snapshot' });
			const env = this.env as Env;
			await env.FLOW_BUCKET.put(name, state);

			// Extract and save metadata to KV
			const metadata = {
				lastModified: Date.now(),
				nodes_count: this.flowDoc.getMap('nodes').size,
				edges_count: this.flowDoc.getMap('edges').size,
			};

			await env.FLOW_KV.put(`flow:${name}:meta`, JSON.stringify(metadata));
			console.log('Saved flow to R2 and KV with name:', name);
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
		if (this.ctx.getWebSockets().length === 1) {
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

	async delete() {
		await this.ctx.storage.deleteAll();
		await (this.env as Env).FLOW_KV.delete(`flow:${this.roomId}:meta`);
		await (this.env as Env).FLOW_BUCKET.delete(this.roomId!);
	}

	async rename(name: string) {
		// Store both the old and new room ID
		await this.delete();
		// const oldRoomId = this.roomId;
		this.roomId = name;
		await this.ctx.storage.put('roomId', this.roomId);

		// Save current state to storage
		await this.saveToStorage(true);

		// Also save with the new name in R2 and KV
		await this.saveToR2AndKV();

		// Mark this object as deleted to prevent further saves with the old ID
		this.deleted = true;
	}

	async fetch(_req: Request): Promise<Response> {
		// Extract and store the room ID from the URL if not already set
		if (!this.roomId) {
			// Extract from URL or request
			const url = new URL(_req.url);
			const pathParts = url.pathname.split('/');
			this.roomId = pathParts[pathParts.length - 1]; // Get the last part of the path
			// Or store it in Durable Object storage for persistence
			await this.ctx.storage.put('roomId', this.roomId);
		}

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

app.post(
	'/flows/rename/:room',
	validator('json', (value, c) => {
		const parsed = renameFlowSchema.safeParse(value);
		if (!parsed.success) {
			return c.text('Invalid!', 401);
		}
		return parsed.data;
	}),
	async (c) => {
		const oldRoomId = c.req.param('room');
		const newName = c.req.valid('json').name;

		// Get the old Durable Object
		const oldId = c.env.SOCKET_OBJECT.idFromName(oldRoomId);
		const oldSocket = c.env.SOCKET_OBJECT.get(oldId);

		// Create a new Durable Object with the new name
		const newId = c.env.SOCKET_OBJECT.idFromName(newName);
		// const newSocket = c.env.SOCKET_OBJECT.get(newId);
		// Rename the old object (which saves its state)
		await oldSocket.rename(newName);
		console.log('oldSocket', oldSocket);

		// Initialize the new object (it will load from R2/KV on first access)
		// await newSocket.fetch(
		// 	new Request(`https://example.com/parties/main/${newName}`),
		// );

		// console.log('newSocket', newSocket);
		return c.json({ success: true });
	},
);

export default {
	fetch: app.fetch,
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		console.log('Running scheduled cleanup task');

		try {
			// Get list of all flows from KV
			const list = await env.FLOW_KV.list({ prefix: 'flow:' });

			// Set retention period (e.g., 30 days in milliseconds)
			const retentionPeriod = 24 * 60 * 60 * 1000;
			const now = Date.now();

			// Process each flow
			for (const key of list.keys) {
				// Extract the room ID from the key
				const roomId = key.name.split(':')[1];

				// Get metadata to check last modified date
				const metaStr = await env.FLOW_KV.get(key.name);
				if (!metaStr) continue;

				const meta = JSON.parse(metaStr);

				// If the flow hasn't been modified within retention period, delete it
				if (now - meta.lastModified > retentionPeriod) {
					console.log(`Cleaning up stale flow: ${roomId}`);

					// Delete from KV
					await env.FLOW_KV.delete(key.name);

					// Delete from R2 bucket
					await env.FLOW_BUCKET.delete(roomId!);
				}
			}

			console.log('Cleanup task completed successfully');
		} catch (error) {
			console.error('Error during cleanup task:', error);
		}
	},
};

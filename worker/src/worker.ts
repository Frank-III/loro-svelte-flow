import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';
import { ServerToClient, clientToServerSchema } from 'common';
import { LoroDoc, VersionVector } from 'loro-crdt';

export class SocketObject extends DurableObject {
	flowDoc: LoroDoc;
	clientVersion: Map<WebSocket, VersionVector>;
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.flowDoc = new LoroDoc();
		this.flowDoc.setPeerId(999n);
		this.clientVersion = new Map();
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
		this.clientVersion.set(_ws, serverVersion);
		for (const ws of this.ctx.getWebSockets()) {
			if (ws === _ws) continue;
			const lastKnownVersion = this.clientVersion.get(ws);
			const delta = this.flowDoc.export({
				mode: 'update',
				from: lastKnownVersion!,
			});
			ws.send(delta);
			this.clientVersion.set(ws, serverVersion);
		}
	}

	async fetch(_req: Request): Promise<Response> {
		const { 0: client, 1: server } = new WebSocketPair();

		this.ctx.acceptWebSocket(server);
		this.clientVersion.set(client, this.flowDoc.version());
		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}
}

const app = new Hono<{ Bindings: Env }>();

app.get('/ws/:room', (c) => {
	const upgrade = c.req.header('Upgrade');
	if (upgrade !== 'websocket') {
		c.status(426);
		return c.body('WebSocket connection required');
	}
	const id = c.env.SOCKET_OBJECT.idFromName(c.req.param('room'));
	const socket = c.env.SOCKET_OBJECT.get(id);
	return socket.fetch(c.req.raw);
});

export default app;

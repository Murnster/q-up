import { Request, Response } from 'express';

const connections = new Map<string, Set<Response>>();

export const addConnection = (eventID: string, res: Response) => {
	if (!connections.has(eventID)) {
		connections.set(eventID, new Set());
	}

	connections.get(eventID)!.add(res);

	const keepalive = setInterval(() => {
		res.write(':\n\n');
	}, 30000);

	res.on('close', () => {
		clearInterval(keepalive);
		removeConnection(eventID, res);
	});
};

const removeConnection = (eventID: string, res: Response) => {
	const eventConnections = connections.get(eventID);

	if (eventConnections) {
		eventConnections.delete(res);

		if (eventConnections.size === 0) {
			connections.delete(eventID);
		}
	}
};

export const broadcastToEvent = (eventID: string, type: string, data: unknown) => {
	const eventConnections = connections.get(eventID);

	if (!eventConnections) {
		return;
	}

	const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;

	for (const res of eventConnections) {
		res.write(message);
	}
};

export const EventStreamHandler = async (req: Request, res: Response) => {
	const { eventID } = req.params;

	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('X-Accel-Buffering', 'no');
	res.flushHeaders();

	addConnection(eventID, res);

	await new Promise<void>((resolve) => {
		res.on('close', () => {
			resolve();
		});
	});
};

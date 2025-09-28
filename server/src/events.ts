import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { SetData } from './database.js';
import { ServerCodes } from './server.js';
import { SendResponse } from './util.js';

interface CreateEventPayload {
	eventName: string;
	eventDescription: string;
	eventHours: number;
}

export const CreateEvent = async (req: Request, res: Response) => {
	const { eventName, eventDescription, eventHours }: CreateEventPayload = req.body;
	
	if (!eventName || !eventDescription || !eventHours || isNaN(eventHours) || eventHours > 24) {
		SendResponse(res, {
			status: ServerCodes.BAD_REQUEST,
			payload: {
				message: 'Missing required fields'
			}
		});
	}
	
	const eventStart = Date.now();
	const eventEnd = eventStart + (eventHours * 60 * 60 * 1000);
	
	const event = {
		eventID: randomUUID(),
		name: eventName,
		description: eventDescription,
		startTime: eventStart,
		endTime: eventEnd
	};
	
	await SetData(`event:${event.eventID}`, JSON.stringify(event), eventHours + 1 * 60 * 60);
	
	SendResponse(res, {
		payload: { data: { done: 1 } }
	});
};

export const GetEvents = async (req: Request, res: Response) => {
	
};

export const DeleteEvent = async (req: Request, res: Response) => {
	
};

export const RegisterForEvent = async (req: Request, res: Response) => {
	
};
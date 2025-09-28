import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { EventDetails, EventSignup } from '../../client/src/constants/interfaces.js';
import { GetAllData_FromHashKey, GetData, GetDataByPattern, SetData } from './database.js';
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
	// Get all events from the database
	// Get all keys that start with "event:"
	const events = await GetDataByPattern<EventDetails>('event:*') || [];
	
	if (events.length === 0) {
		SendResponse(res, {
			payload: { 
				data: {
					events: [],
					signups: {},
					message: 'No events found'
				}
			}
		});
		
		return;
	}
	
	const eventIDs = events.map(e => e.eventID);
	const eventSignups: { [eventID: string]: EventSignup[] } = {};
	
	// Get all keys of the hashes with event:eventID:signups
	for (const eventID of eventIDs) {
		const signups = await GetAllData_FromHashKey<EventSignup>(`event-signups:${eventID}`);
		if (signups) {
			eventSignups[eventID] = signups;
		} else {
			eventSignups[eventID] = [];
		}
	}
	
	SendResponse(res, {
		payload: { 
			data: {
				events,
				signups: eventSignups
			}
		}
	});
};

export const DeleteEvent = async (req: Request, res: Response) => {
	// TODO: Add validation to ensure only the creator can delete
	const { eventID } = req.body;
	
	if (!eventID) {
		SendResponse(res, {
			status: ServerCodes.BAD_REQUEST,
			payload: {
				message: 'Missing eventID'
			}
		});
		return;
	}
	
	const existingEvent = await GetData<EventDetails>(`event:${eventID}`);
	if (!existingEvent) {
		SendResponse(res, {
			status: ServerCodes.NOT_FOUND,
			payload: {
				message: 'No event found with the provided ID'
			}
		});
		return;
	}
	
	
};

export const RegisterForEvent = async (req: Request, res: Response) => {
	const { eventID, userID } = req.body;
	
	if (!eventID || !userID) {
		SendResponse(res, {
			status: ServerCodes.BAD_REQUEST,
			payload: {
				message: 'Missing eventID or userID'
			}
		});
		return;
	}
	
	const existingEvent = await GetData<EventDetails>(`event:${eventID}`);
	if (!existingEvent) {
		SendResponse(res, {
			status: ServerCodes.NOT_FOUND,
			payload: {
				message: 'No event found with the provided ID'
			}
		});
		return;
	}
	
	const signup: EventSignup = {
		signupID: randomUUID(),
		eventID,
		userID,
		timestamp: new Date().toISOString()
	};
	
	await SetData(`event-signups:${eventID}`, JSON.stringify(signup), (new Date(existingEvent.endTime).getTime() - Date.now()) / 1000);
	
	SendResponse(res, {
		payload: { data: { done: 1, signup } }
	});
};
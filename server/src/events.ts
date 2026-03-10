import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { EventDetails, EventSignup, UserDetails } from '../../client/src/constants/interfaces.js';
import { DeleteData_ByHashField, DeleteData_ByKey, GetAllData_FromHashKey, GetData_ByKey, GetData_ByKeys, GetDataByPattern, SetData_ByHashKey, SetData_ByKey } from './database.js';
import { ServerCodes } from './server.js';
import { broadcastToEvent } from './sse.js';
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
		createdBy: res.locals.user.userID,
		name: eventName,
		description: eventDescription,
		startTime: eventStart,
		endTime: eventEnd
	};
	
	await SetData_ByKey(`event:${event.eventID}`, JSON.stringify(event), (eventHours + 1) * 60 * 60);
	
	SendResponse(res, {
		payload: { data: { done: 1 } }
	});
};

export const GetEvents = async (req: Request, res: Response) => {
	const events = await GetDataByPattern<EventDetails>('event:*') || [];
	
	if (events.length === 0) {
		SendResponse(res, {
			payload: {
				data: {
					events: [],
					message: 'No events found'
				}
			}
		});
		
		return;
	}
	
	SendResponse(res, {
		payload: { 
			data: {
				events
			}
		}
	});
};

export const GetAllEventsWithSignups = async (req: Request, res: Response) => {
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

export const GetEventWithSignups = async (req: Request, res: Response) => {
	const event = await GetData_ByKey<EventDetails>(`event:${req.body.eventID}`) || null;
	
	if (!event) {
		SendResponse(res, {
			payload: { 
				data: {
					event: null,
					signups: null,
					users: null,
					message: 'No events found'
				}
			}
		});
		
		return;
	}
	
	const signups = await GetAllData_FromHashKey<EventSignup>(`event-signups:${event.eventID}`) || [];
	const userKeys = signups.map(s => `userDetails:${s.userID}`);
	const users = await GetData_ByKeys<UserDetails>(userKeys) || [];
	const usersMap: { [userID: string]: UserDetails } = users.reduce((acc, user) => {
		if (user) {
			acc[user.userID] = user;
		}
		return acc;
	}, {} as { [userID: string]: UserDetails });
	
	SendResponse(res, {
		payload: { 
			data: {
				event,
				signups,
				users: usersMap
			}
		}
	});
};

export const DeleteEvent = async (req: Request, res: Response) => {
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
	
	const existingEvent = await GetData_ByKey<EventDetails>(`event:${eventID}`);
	if (!existingEvent) {
		SendResponse(res, {
			status: ServerCodes.NOT_FOUND,
			payload: {
				message: 'No event found with the provided ID'
			}
		});
		return;
	}
	
	if (existingEvent.createdBy !== res.locals.user.userID) {
		SendResponse(res, {
			status: ServerCodes.FORBIDDEN,
			payload: {
				message: 'You do not have permission to delete this event'
			}
		});
		return;
	}
	
	await DeleteData_ByKey(`event:${eventID}`);
	await DeleteData_ByKey(`event-signups:${eventID}`);
	
	SendResponse(res, {
		payload: { data: { done: 1 } }
	});
	
};

export const RegisterForEvent = async (req: Request, res: Response) => {
	const { eventID } = req.body;
	const userID = res.locals.user?.userID;
	
	if (!eventID || !userID) {
		SendResponse(res, {
			status: ServerCodes.BAD_REQUEST,
			payload: {
				message: 'Missing event ID or user ID'
			}
		});
		return;
	}
	
	const existingEvent = await GetData_ByKey<EventDetails>(`event:${eventID}`);
	if (!existingEvent) {
		SendResponse(res, {
			status: ServerCodes.NOT_FOUND,
			payload: {
				message: 'No event found with the provided ID'
			}
		});
		return;
	}
	
	if (Date.now() > Number(existingEvent.endTime)) {
		SendResponse(res, {
			status: ServerCodes.BAD_REQUEST,
			payload: {
				message: 'This event has ended'
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
	
	await SetData_ByHashKey(`event-signups:${eventID}`, userID, JSON.stringify(signup), Math.floor(((new Date(existingEvent.endTime).getTime() - Date.now()) / 1000)));

	const userDetails = await GetData_ByKey<UserDetails>(`userDetails:${userID}`);
	broadcastToEvent(eventID, 'signup', { signup, user: userDetails });

	SendResponse(res, {
		payload: { data: { done: 1, signup } }
	});
};

export const RemoveAttendee = async (req: Request, res: Response) => {
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

	const existingEvent = await GetData_ByKey<EventDetails>(`event:${eventID}`);
	if (!existingEvent) {
		SendResponse(res, {
			status: ServerCodes.NOT_FOUND,
			payload: {
				message: 'No event found with the provided ID'
			}
		});
		return;
	}

	if (existingEvent.createdBy !== res.locals.user.userID) {
		SendResponse(res, {
			status: ServerCodes.FORBIDDEN,
			payload: {
				message: 'You do not have permission to remove attendees from this event'
			}
		});
		return;
	}

	await DeleteData_ByHashField(`event-signups:${eventID}`, userID);

	broadcastToEvent(eventID, 'removal', { userID });

	SendResponse(res, {
		payload: { data: { done: 1 } }
	});
};
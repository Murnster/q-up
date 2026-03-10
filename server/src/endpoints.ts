import express from 'express';
import asyncHandler from 'express-async-handler';
import * as auth from './authentication.js';
import { GetData_ByKey } from './database.js';
import * as events from './events.js';
import { ServerCodes } from './server.js';
import { EventStreamHandler } from './sse.js';
import { SendResponse } from './util.js';

export const endpoints = (app: express.Application) => {
	// Auth
	app.post('/login', asyncHandler(auth.DoLogin));
	app.post('/session', asyncHandler(auth.CheckSession));
	app.post('/create-user', asyncHandler(auth.CreateUser));
	app.post('/logout', asyncHandler(auth.DoLogout));
	
	// Events
	app.get('/get-events', authHandler(events.GetAllEventsWithSignups));
	app.post('/create-event', authHandler(events.CreateEvent));
	app.post('/delete-event', authHandler(events.DeleteEvent));
	app.post('/get-event-details', authHandler(events.GetEventWithSignups));
	app.post('/register-event-signup', authHandler(events.RegisterForEvent));
	app.post('/remove-attendee', authHandler(events.RemoveAttendee));
	app.get('/events/:eventID/stream', authHandler(EventStreamHandler));
};

const authHandler = (handler: (req: express.Request, res: express.Response) => Promise<void>) => {
	return asyncHandler(async (req: express.Request, res: express.Response) => {
		const token = req.cookies['authToken'];
		
		if (!token) {
			SendResponse(res, {
				status: ServerCodes.UNAUTHORIZED,
				payload: {
					message: 'No session token provided'
				}
			});
			return;
		}
		
		const sessionData = await GetData_ByKey<auth.TokenData>(`token:${token}`);
		
		if (!sessionData) {
			res.clearCookie('authToken', {
				httpOnly: true,
				secure: process.env.PRODUCTION === 'true',
				sameSite: 'lax'
			});
			
			SendResponse(res, {
				status: ServerCodes.UNAUTHORIZED,
				payload: {
					message: 'Invalid session token'
				}
			});
			return;
		}
		
		const user = await auth.GetUser(sessionData.userID);
		
		if (!user) {
			res.clearCookie('authToken', {
				httpOnly: true,
				secure: process.env.PRODUCTION === 'true',
				sameSite: 'lax'
			});
			
			SendResponse(res, {
				status: ServerCodes.UNAUTHORIZED,
				payload: {
					message: 'User associated with session token not found'
				}
			});
			return;
			
		}
		
		res.locals.user = user;
		
		await handler(req, res);
	});
};
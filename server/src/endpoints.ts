import express from 'express';
import asyncHandler from 'express-async-handler';
import * as auth from './authentication.js';
import { GetData } from './database.js';
import * as events from './events.js';
import { ServerCodes } from './server.js';
import { SendResponse } from './util.js';

export const endpoints = (app: express.Application) => {
	// Auth
	app.post('/login', asyncHandler(auth.DoLogin));
	app.post('/session', asyncHandler(auth.CheckSession));
	app.post('/create-user', asyncHandler(auth.CreateUser));
	
	// Events
	app.get('/get-events', authHandler(events.GetEvents));
	app.post('/create-event', authHandler(events.CreateEvent));
	app.post('/delete-event', authHandler(events.DeleteEvent));
	app.post('/register-event', authHandler(events.RegisterForEvent));
};

const authHandler = (handler: (req: express.Request, res: express.Response) => Promise<void>) => {
	return asyncHandler(async (req: express.Request, res: express.Response) => {
		// Check for valid token
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
		
		const sessionData = await GetData<auth.TokenData>(`token:${token}`);
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
		
		// TODO: Figure this out
		// Add user data to request for use in handlers
		// req.user = sessionData;
		
		await handler(req, res);
	});
};
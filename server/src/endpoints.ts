import express from 'express';
import asyncHandler from 'express-async-handler';
import * as auth from './authentication.js';
import * as events from './events.js';

export const endpoints = (app: express.Application) => {
	// Auth
	app.post('/login', asyncHandler(auth.DoLogin));
	app.post('/session', asyncHandler(auth.CheckSession));
	app.post('/create-user', asyncHandler(auth.CreateUser));
	
	// Events
	app.post('/create-event', asyncHandler(events.CreateEvent));
	app.post('/get-events', asyncHandler(events.GetEvents));
	app.post('/delete-event', asyncHandler(events.DeleteEvent));
	app.post('/register-event', asyncHandler(events.RegisterForEvent));
};
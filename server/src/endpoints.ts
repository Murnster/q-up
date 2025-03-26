import express from 'express';
import asyncHandler from 'express-async-handler';
import * as auth from './authentication.js';
import * as events from './events.js';

export const endpoints = (app: express.Application) => {
	// Auth
	app.post('/login', asyncHandler(auth.DoLogin));
	app.post('/session', asyncHandler(auth.CheckSession));
	
	// Events
	app.post('/create-event', asyncHandler(events.CreateEvent));
};
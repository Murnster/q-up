import dotenv from 'dotenv';
dotenv.config();

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { endpoints } from './endpoints.js';


const app = express();

// Security middleware
app.use(helmet({
	contentSecurityPolicy: process.env.PRODUCTION === 'true' ? {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:"],
			connectSrc: ["'self'"],
			fontSrc: ["'self'", "https://fonts.gstatic.com"],
			styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
		}
	} : false,
}));
app.use(cors({
	origin: process.env.ORIGINS?.split(',') || ['http://localhost:3000'],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiter
app.use(rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 1000,
	message: 'You\'ve hit the rate limit. Please try again later.'
}));

// Body validation
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Init endpoints
endpoints(app);

// Static file serving + SPA fallback (production only)
if (process.env.PRODUCTION === 'true') {
	const clientDistPath = path.resolve('client/dist');
	app.use(express.static(clientDistPath));
	app.get('*', (_req: express.Request, res: express.Response) => {
		res.sendFile(path.join(clientDistPath, 'index.html'));
	});
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response) => {
	console.error('Express Server Error:', {
		name: err.name,
		message: err.message,
		stack: err.stack,
		path: req.path,
		method: req.method
	});
	
	res.status(ServerCodes.INTERNAL_SERVER_ERROR).json({
		status: 'error',
		message: process.env.PRODUCTION === 'true' ? 'Internal server error' : err.message
	});
});

// 404
app.use('*', (req: express.Request, res: express.Response) => {
	res.status(ServerCodes.NOT_FOUND).json({
		status: 'error',
		message: `Route ${req.originalUrl} not found`
	});
});

// Node process error handling
process.on('uncaughtException', (error: Error) => {
	console.error('Uncaught Exception: ', error);
	process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
	console.error('Unhandled Rejection: ', reason);
	process.exit(1);
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
	console.info(`Q-up running on port: ${port}`);
	
	if (process.env.REDIS_HOST == null || process.env.REDIS_PORT == null) {
		console.info('There is missing Redis configuration. Please check your environment variables.');
	}
}).on('error', (error: Error) => {
	console.error('Server failed to start:', error);
	process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
	server.close(() => {
		console.info('Server closed');
		process.exit(0);
	});
});

export default app;

export enum ServerCodes {
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	INTERNAL_SERVER_ERROR = 500,
}

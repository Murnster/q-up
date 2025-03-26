import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { endpoints } from './endpoints.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
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

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error('Express Server Error:', {
		name: err.name,
		message: err.message,
		stack: err.stack,
		path: req.path,
		method: req.method
	});
	
	res.status(500).json({
		status: 'error',
		message: process.env.PRODUCTION === 'true' ? 'Internal server error' : err.message
	});
});

// 404
app.use('*', (req: express.Request, res: express.Response) => {
	res.status(404).json({
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
	console.info(`Murney Events running on port: ${port}`);
	
	if (process.env.REDIS_IP == null || process.env.REDIS_PORT == null) {
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
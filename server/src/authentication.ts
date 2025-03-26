import { NextFunction, Request, Response } from 'express';
import { SendResponse } from './util.js';

export const CheckSession = async (req: Request, res: Response, next: NextFunction) => {
	SendResponse(res, { message: 'Session is valid' });
};

export const DoLogin = async (req: Request, res: Response, next: NextFunction) => {
	
};
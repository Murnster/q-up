import { Response } from 'express';

export const SendResponse = (res: Response, data = {}, status?: number) => {
	// Sends the response back to the requester
	res.status(status ?? 200).send(data);
};
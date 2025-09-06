import { Response } from 'express';

export interface SendResponseData<T = any> {
	payload?: {
		message?: string;
		data?: T | null;
		errorCode?: number;
	};
	status?: number;
}

export const SendResponse = (res: Response, responsePayload: SendResponseData) => {
	res.status(responsePayload.status ?? 200).send(responsePayload.payload ?? {}).end();
};
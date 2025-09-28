// #region Auth

export interface UserDetails {
	userID: string;
	firstName: string;
	lastName: string;
}

// #endregion

// #region Events

export interface EventDetails {
	name: string
	description: string;
	startTime: string;
	endTime: string;
}

// #endregion

// #region Errors

export enum CreateEventErrors {
	INVALID_NAME = 1,
	INVALID_DESCRIPTION = 2,
	INVALID_HOURS = 3
}

export enum CreateUserErrors {
	USERNAME_EXISTS = 1
}

// #endregion

// #region Network

export interface ResponsePayload<T> {
	message?: string;
	data?: T | null;
	errorCode?: number;
}

// #endregion
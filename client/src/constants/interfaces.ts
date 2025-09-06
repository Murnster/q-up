// Auth

export interface UserDetails {
	userID: string;
	firstName: string;
	lastName: string;
}

export enum CreateUserErrors {
	USERNAME_EXISTS = 1
}

// end Auth

// Network

export interface ResponsePayload<T> {
	message?: string;
	data?: T | null;
	errorCode?: number;
}

// end Network
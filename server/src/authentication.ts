import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { CreateUserErrors, UserDetails } from '../../client/src/constants/interfaces.js';
import { GetData, SetData } from './database.js';
import { ServerCodes } from './server.js';
import { SendResponse } from './util.js';

export interface UserAuthentication {
	username: string;
	password: string;
	userID: string
}

export interface UserCredentials {
	username: string;
	password: string;
}

export interface CreateUserPayload {
	username: string;
	password: string;
	firstName: string;
	lastName: string;
}

export interface TokenData {
	token: string;
	userID: string;
}

const passwordHashRounds = 10;

export const CheckSession = async (req: Request, res: Response) => {
	const token: string = req.cookies?.authToken;
	
	if (!token) {
		SendResponse(res, {
			payload: {
				message: 'No session token provided'
			}
		});
	} else {
		const sessionData = await GetData<TokenData>(`token:${token}`);
		
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
		} else {
			const userDetails = await GetUser(sessionData.userID);
			
			SendResponse(res, { 
				payload: {
					message: 'Session is valid', data: userDetails 
				}
			});
		}
	}
};

export const DoLogin = async (req: Request, res: Response) => {
	const { username, password } = <UserCredentials>req.body;
	
	if (!username.length || !password.length) {
		SendResponse(res, {
			status: ServerCodes.UNAUTHORIZED,
			payload: {
				message: 'Username and password are required'
			}
		});
	} else {
		const user = await ValidateCredentials(username, password)
		
		if (user) {
			const userDetails = await GetUser(user.userID);
			const newToken = randomUUID();
			
			await SetData(`token:${newToken}`, JSON.stringify({
				userID: user.userID,
				token: newToken
			}), 86400);
			
			// Set the cookie
			res.cookie('authToken', newToken, {
				httpOnly: true,
				secure: process.env.PRODUCTION === 'true',
				sameSite: 'lax',
				maxAge: 86400 * 1000
			});
			
			if (userDetails) {
				SendResponse(res, {
					payload: { data: userDetails }
				});
			}
		} else {
			SendResponse(res, {
				status: ServerCodes.UNAUTHORIZED,
				payload: { message: 'No user found with the provided credentials' }
			});
		}
	}
};

const ValidateCredentials = async (username: string, password: string) => {
	const user = await GetData<UserAuthentication>(`user:${username}`);
	
	// If user does not exist
	if (!user) {
		return false;
	}
	
	// If password does not match
	if (!(await bcrypt.compare(password, user.password))) {
		return false;
	}
	
	return user;
};

export const CheckUsername = async (req: Request, res: Response) => {
	const username: string = req.body.username;
	
	const user = await GetData<UserAuthentication>(`user:${username}`);
	
	if (user) {
		SendResponse(res, {
			status: ServerCodes.BAD_REQUEST,
			payload: { message: 'Username already exists' }
		});
	} else {
		SendResponse(res, { payload: { message: 'Username is available' } });
	}
}

export const CreateUser = async (req: Request, res: Response) => {
	const { username, password, firstName, lastName }: CreateUserPayload = req.body;
	
	if (!username || !password || !firstName || !lastName) {
		SendResponse(res, {
			status: ServerCodes.BAD_REQUEST,
			payload: { message: 'All fields are required' }
		});
	} else {
		// Double check if the username already exists
		const existingUser = await GetData<UserAuthentication>(`user:${username}`);
		
		if (existingUser) {
			SendResponse(res, {
				payload: {
					message: 'Username already exists',
					errorCode: CreateUserErrors.USERNAME_EXISTS
				}
			});
		} else {
			const hashedPassword = await bcrypt.hash(password, passwordHashRounds);
			
			// Note that userID is generated here, but in real-world, we'd increment off a table or some existing list.
			const userID = randomUUID();
			const newToken = randomUUID();
			
			await SetData(`user:${username}`, JSON.stringify({
				username,
				password: hashedPassword,
				userID: userID
			}), 86400);
			
			await SetData(`userDetails:${userID}`, JSON.stringify({
				userID: userID,
				firstName,
				lastName
			}), 86400);
			
			await SetData(`token:${newToken}`, JSON.stringify({
				userID: userID,
				token: randomUUID()
			}), 86400);
			
			res.cookie('authToken', newToken, {
				httpOnly: true,
				secure: process.env.PRODUCTION === 'true',
				sameSite: 'lax',
				maxAge: 86400 * 1000 
			});
			
			SendResponse(res, {
				payload: {
					data: {
						userID,
						firstName,
						lastName
					},
					message: 'User created successfully'
				}
			});
		}
	}
}

export const GetUser = async (userID: string) => {
	return await GetData<UserDetails>(`userDetails:${userID}`);
}
import { createClient, RedisClientType } from "redis";

let client: RedisClientType;

export const ConnectToDB = async () => {
	if (!client) {
		client = createClient({
			username: process.env.REDIS_USERNAME,
			password: process.env.REDIS_PASSWORD,
			socket: {
				host: process.env.REDIS_HOST || 'localhost',
				port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
				reconnectStrategy: (retries) => {
					// Exponential backoff, max 10 seconds
					return Math.min(retries * 100, 10000);
				}
			}
		});
	}
	
	if (!client.isOpen) {
		console.log('Connecting to Redis...');
		await client.connect();
	}
};

export const SetData = async (key: string, value: string, expiry = 86400) => {
	await ConnectToDB();
	
	try {
		await client.set(key, value, {
			EX: expiry
		});
	} catch (error) {
		console.error('Error setting data in Redis:', error);
	}
}

export const GetData = async <T>(key: string) => {
	await ConnectToDB();
	
	try {
		const value = await client.get(key);
		return !value ? null : <T>JSON.parse(value);
	} catch (error) {
		console.error('Error getting data from Redis:', error);
		return null;
	}
}

export const GetRawData = async (key: string) => {
	await ConnectToDB();
	
	try {
		const value = await client.get(key);
		return !value ? null : value;
	} catch (error) {
		console.error('Error getting data from Redis:', error);
		return null;
	}
}

export const GetDataByPattern = async <T>(pattern: string) => {
	await ConnectToDB();
	
	const found: T[] = [];
	let cursor = '0';
	
	try {
		do {
			const { cursor: nextCursor, keys } = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
			cursor = nextCursor;
			
			if (keys.length > 0) {
				const values = await client.mGet(keys);
				
				values.forEach(value => {
					if (value) {
						found.push(JSON.parse(value));
					}
				});
			}
		} while (cursor !== '0');
		
		return found;
	} catch (error) {
		console.error('Error getting data by pattern from Redis:', error);
		return null;
	}
};

export const DeleteData = async (key: string) => {
	await ConnectToDB();
	
	try {
		await client.del(key);
	} catch (error) {
		console.error('Error deleting data from Redis:', error);
		return null;
	}
}
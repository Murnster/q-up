import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { createClient } from 'redis';

dotenv.config({ path: 'server/.env' });

const BASE_URL = process.env.SEED_URL ?? 'http://localhost:3000';

interface SeedUser {
	username: string;
	password: string;
	firstName: string;
	lastName: string;
}

interface SeedEvent {
	eventName: string;
	eventDescription: string;
	eventHours: number;
}

interface ApiResponse {
	data?: unknown;
	errorCode?: number;
	message?: string;
}

const users: SeedUser[] = [
	{ username: 'alice.smith', password: 'Test1234!', firstName: 'Alice', lastName: 'Smith' },
	{ username: 'bob.jones', password: 'Test1234!', firstName: 'Bob', lastName: 'Jones' },
	{ username: 'carol.white', password: 'Test1234!', firstName: 'Carol', lastName: 'White' },
	{ username: 'david.brown', password: 'Test1234!', firstName: 'David', lastName: 'Brown' },
	{ username: 'eve.davis', password: 'Test1234!', firstName: 'Eve', lastName: 'Davis' },
	{ username: 'frank.wilson', password: 'Test1234!', firstName: 'Frank', lastName: 'Wilson' },
	{ username: 'testuser', password: 'Test1234!', firstName: 'Test', lastName: 'User' },
];

const BASE_USER_INDEX = 6;

const events: SeedEvent[] = [
	{ eventName: 'Team Building Workshop', eventDescription: 'A fun afternoon of team activities designed to improve collaboration and communication across departments.', eventHours: 3 },
	{ eventName: 'Quarterly Kickoff', eventDescription: 'Review last quarter\'s results and align on goals and priorities for the upcoming quarter.', eventHours: 2 },
	{ eventName: 'Lunch & Learn: TypeScript', eventDescription: 'An informal session covering TypeScript best practices, utility types, and tips for large codebases.', eventHours: 1 },
	{ eventName: 'Hackathon Night', eventDescription: 'An overnight hackathon — bring your best ideas and ship something you\'re proud of by morning.', eventHours: 8 },
	{ eventName: 'Onboarding Session', eventDescription: 'Welcome to the team! This session covers tools, processes, and introductions to key stakeholders.', eventHours: 4 },
	{ eventName: 'Year-End Celebration', eventDescription: 'Join us to celebrate the year\'s achievements with food, drinks, and a look ahead to what\'s next.', eventHours: 5 },
];

// Events created by the base test user
const baseUserEvents: SeedEvent[] = [
	{ eventName: 'Friday Demo Day', eventDescription: 'Show off what you built this week. Quick 5-minute demos followed by Q&A — all skill levels welcome.', eventHours: 2 },
	{ eventName: 'Coffee Chat Meetup', eventDescription: 'A casual get-together over coffee to meet people from other teams and share what you\'re working on.', eventHours: 1 },
];

// Which seed users (by index) sign up for each base user event
const baseUserEventSignups: number[][] = [
	[0, 1, 3, 4],  // Friday Demo Day: Alice, Bob, David, Eve
	[1, 2, 5],     // Coffee Chat Meetup: Bob, Carol, Frank
];

// Which user indices sign up for each event (not the creator)
// Base user (index 6) is signed up for events 0, 1, 3, 5
const signupMatrix: number[][] = [
	[1, 2, 4, BASE_USER_INDEX],     // event 0 (created by user 0): users 1, 2, 4, base sign up
	[0, 3, 5, BASE_USER_INDEX],     // event 1 (created by user 1): users 0, 3, 5, base sign up
	[1, 4, 5],                       // event 2 (created by user 2): users 1, 4, 5 sign up
	[0, 2, 5, BASE_USER_INDEX],     // event 3 (created by user 3): users 0, 2, 5, base sign up
	[1, 2, 5],                       // event 4 (created by user 4): users 1, 2, 5 sign up
	[0, 3, 4, BASE_USER_INDEX],     // event 5 (created by user 5): users 0, 3, 4, base sign up
];

async function postJSON(path: string, body: object, cookie?: string) {
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	if (cookie) {
		headers['Cookie'] = cookie;
	}

	const res = await fetch(`${BASE_URL}${path}`, {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
	});

	const data = await res.json() as ApiResponse;
	return { status: res.status, data, setCookie: res.headers.get('set-cookie') };
}

async function getEvents(cookie: string): Promise<{ eventID: string; name: string }[]> {
	const res = await fetch(`${BASE_URL}/get-events`, {
		method: 'GET',
		headers: { 'Cookie': cookie },
	});
	const data = await res.json() as { data?: { events?: { eventID: string; name: string }[] } };
	return data.data?.events ?? [];
}

function extractAuthToken(setCookieHeader: string | null): string | null {
	if (!setCookieHeader) {
		return null;
	}

	const match = setCookieHeader.match(/authToken=([^;]+)/);
	return match ? `authToken=${match[1]}` : null;
}

// Phase 1: Wipe Redis
async function wipeRedis() {
	console.log('Phase 1: Wiping Redis...\n');

	const client = createClient({
		username: process.env.REDIS_USERNAME,
		password: process.env.REDIS_PASSWORD,
		socket: {
			host: process.env.REDIS_HOST,
			port: Number(process.env.REDIS_PORT),
		},
	});

	await client.connect();
	await client.flushDb();
	await client.disconnect();

	console.log('  Redis flushed ✓\n');
}

// Phase 2: Seed via HTTP
async function seed() {
	console.log(`Phase 2: Seeding against ${BASE_URL}\n`);

	// Step 1: Create users and collect auth cookies
	const cookies: (string | null)[] = [];

	for (const user of users) {
		const { status, data, setCookie } = await postJSON('/create-user', user);
		const cookie = extractAuthToken(setCookie);

		if (status !== 200) {
			console.error(`  Failed to create user "${user.username}": status ${status}`, data);
			cookies.push(null);
		} else {
			cookies.push(cookie);
			console.log(`  Created user "${user.username}" ${cookie ? '✓' : '✗'}`);
		}
	}

	console.log();

	// Step 2: Create events (one per seed user)
	const eventIDs: (string | null)[] = [];

	for (let i = 0; i < events.length; i++) {
		const cookie = cookies[i];
		const event = events[i];

		if (!cookie) {
			console.error(`  Skipping event "${event.eventName}" — no auth cookie for user ${i}`);
			eventIDs.push(null);
			continue;
		}

		const beforeEvents = await getEvents(cookie);
		const beforeIDs = new Set(beforeEvents.map(e => e.eventID));

		const { status, data } = await postJSON('/create-event', event, cookie);

		if (status !== 200) {
			console.error(`  Failed to create event "${event.eventName}": status ${status}`, data);
			eventIDs.push(null);
			continue;
		}

		const afterEvents = await getEvents(cookie);
		const newEvent = afterEvents.find(e => !beforeIDs.has(e.eventID));

		if (!newEvent) {
			console.error(`  Created event "${event.eventName}" but could not retrieve its ID`);
			eventIDs.push(null);
		} else {
			eventIDs.push(newEvent.eventID);
			console.log(`  Created event "${event.eventName}" (${newEvent.eventID}) ✓`);
		}
	}

	console.log();

	// Step 3: Register signups
	for (let eventIdx = 0; eventIdx < events.length; eventIdx++) {
		const eventID = eventIDs[eventIdx];
		const signerIndices = signupMatrix[eventIdx];

		if (!eventID) {
			console.log(`  Skipping signups for event ${eventIdx} — no event ID`);
			continue;
		}

		for (const userIdx of signerIndices) {
			const cookie = cookies[userIdx];
			const user = users[userIdx];

			if (!cookie) {
				console.log(`  Skipping signup for user "${user.username}" — no auth cookie`);
				continue;
			}

			const { status, data } = await postJSON('/register-event-signup', { eventID }, cookie);

			if (status !== 200) {
				console.error(`  Failed signup: "${user.username}" → "${events[eventIdx].eventName}": status ${status}`, data);
			} else {
				console.log(`  Signed up "${user.username}" → "${events[eventIdx].eventName}" ✓`);
			}
		}
	}

	// Step 4: Create events owned by the base test user
	const baseCookie = cookies[BASE_USER_INDEX];
	const baseEventIDs: (string | null)[] = [];

	if (baseCookie) {
		for (const event of baseUserEvents) {
			const beforeEvents = await getEvents(baseCookie);
			const beforeIDs = new Set(beforeEvents.map(e => e.eventID));

			const { status, data } = await postJSON('/create-event', event, baseCookie);

			if (status !== 200) {
				console.error(`  Failed to create event "${event.eventName}": status ${status}`, data);
				baseEventIDs.push(null);
				continue;
			}

			const afterEvents = await getEvents(baseCookie);
			const newEvent = afterEvents.find(e => !beforeIDs.has(e.eventID));

			if (!newEvent) {
				console.error(`  Created event "${event.eventName}" but could not retrieve its ID`);
				baseEventIDs.push(null);
			} else {
				baseEventIDs.push(newEvent.eventID);
				console.log(`  Created event "${event.eventName}" (${newEvent.eventID}) ✓`);
			}
		}
	} else {
		console.error('  Skipping base user events — no auth cookie');
	}

	console.log();

	// Step 5: Register signups for base user events
	for (let eventIdx = 0; eventIdx < baseUserEvents.length; eventIdx++) {
		const eventID = baseEventIDs[eventIdx];
		const signerIndices = baseUserEventSignups[eventIdx];

		if (!eventID) {
			console.log(`  Skipping signups for base user event ${eventIdx} — no event ID`);
			continue;
		}

		for (const userIdx of signerIndices) {
			const cookie = cookies[userIdx];
			const user = users[userIdx];

			if (!cookie) {
				console.log(`  Skipping signup for user "${user.username}" — no auth cookie`);
				continue;
			}

			const { status, data } = await postJSON('/register-event-signup', { eventID }, cookie);

			if (status !== 200) {
				console.error(`  Failed signup: "${user.username}" → "${baseUserEvents[eventIdx].eventName}": status ${status}`, data);
			} else {
				console.log(`  Signed up "${user.username}" → "${baseUserEvents[eventIdx].eventName}" ✓`);
			}
		}
	}

	console.log('\nReset complete.');
	console.log('\nBase test user: testuser / Test1234!');
}

// Phase 3: Insert a historic (ended) event directly into Redis
async function seedHistoricEvent() {
	console.log('\nPhase 3: Inserting historic event...\n');

	const client = createClient({
		username: process.env.REDIS_USERNAME,
		password: process.env.REDIS_PASSWORD,
		socket: {
			host: process.env.REDIS_HOST,
			port: Number(process.env.REDIS_PORT),
		},
	});

	await client.connect();

	// Look up testuser's userID
	const testUserRaw = await client.get('user:testuser');
	if (!testUserRaw) {
		console.error('  Could not find testuser in Redis — skipping historic event');
		await client.disconnect();
		return;
	}
	const testUserData = JSON.parse(testUserRaw) as { userID: string };

	// Look up seed user IDs for signups
	const signupUsernames = ['alice.smith', 'bob.jones', 'david.brown'];
	const signupUserIDs: { userID: string; username: string }[] = [];
	for (const username of signupUsernames) {
		const raw = await client.get(`user:${username}`);
		if (raw) {
			const parsed = JSON.parse(raw) as { userID: string };
			signupUserIDs.push({ userID: parsed.userID, username });
		}
	}

	// Create an event that ended 30 minutes ago (was a 2-hour event)
	const eventHours = 2;
	const endedAgoMs = 30 * 60 * 1000;
	const eventEnd = Date.now() - endedAgoMs;
	const eventStart = eventEnd - (eventHours * 60 * 60 * 1000);
	const eventID = randomUUID();

	const event = {
		eventID,
		createdBy: testUserData.userID,
		name: 'Sprint Retro Meeting',
		description: 'A look back at what went well, what didn\'t, and what we can improve for next sprint.',
		startTime: eventStart,
		endTime: eventEnd,
	};

	// TTL: the server uses (eventHours + 1h) from creation. The event ended 30min ago,
	// so there's ~30min of the +1h buffer remaining.
	const remainingTTL = Math.floor(((eventHours + 1) * 60 * 60) - (eventHours * 60 * 60) - (endedAgoMs / 1000));

	await client.set(`event:${eventID}`, JSON.stringify(event), { EX: remainingTTL });
	console.log(`  Created historic event "Sprint Retro Meeting" (${eventID}) — ended 30min ago, TTL ${remainingTTL}s ✓`);

	// Add signups
	for (const { userID, username } of signupUserIDs) {
		const signup = {
			signupID: randomUUID(),
			eventID,
			userID,
			timestamp: new Date(eventStart + 5 * 60 * 1000).toISOString(),
		};
		await client.hSet(`event-signups:${eventID}`, userID, JSON.stringify(signup));
		console.log(`  Signed up "${username}" → "Sprint Retro Meeting" ✓`);
	}

	// Set TTL on the signups hash to match
	await client.expire(`event-signups:${eventID}`, remainingTTL);

	await client.disconnect();
}

async function main() {
	await wipeRedis();
	await seed();
	await seedHistoricEvent();
}

main().catch(err => {
	console.error('Reset failed:', err);
	process.exit(1);
});

export const AppRoutes = {
	EVENTS: '/events',
	HOME: '/',
	LOGIN: '/login',
	NEW_EVENT: '/new-event',
	SCANNER: '/scanner',
	EVENT_QR: '/event-qr/:eventID',
	USER_CREATION: '/create-user',
	NOT_FOUND: '*'
} as const;

export type AppRouteKeys = keyof typeof AppRoutes;
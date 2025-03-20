export const AppRoutes = {
	EVENTS: '/events',
	HOME: '/',
	LOGIN: '/login',
	NEW_EVENT: '/new-event',
	SCANNER: '/scanner',
	NOT_FOUND: '*'
} as const;

export type AppRouteKeys = keyof typeof AppRoutes;
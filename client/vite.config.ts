import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/login': 'http://localhost:3000',
			'/session': 'http://localhost:3000',
			'/create-user': 'http://localhost:3000',
			'/logout': 'http://localhost:3000',
			'/get-events': 'http://localhost:3000',
			'/create-event': 'http://localhost:3000',
			'/delete-event': 'http://localhost:3000',
			'/get-event-details': 'http://localhost:3000',
			'/register-event-signup': 'http://localhost:3000',
			'/remove-attendee': 'http://localhost:3000',
			'/events': 'http://localhost:3000',
		}
	}
});

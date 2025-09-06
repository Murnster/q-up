import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { CredentialsProvider } from './context/crendential-provider.tsx';
import './css/index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<CredentialsProvider>
				<App />
			</CredentialsProvider>
		</BrowserRouter>
	</StrictMode>
);

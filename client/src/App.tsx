import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/navbar';
import { AppRoutes } from './constants/routes';
import './css/index.css';
import { About } from './pages/about';
import { EventManager } from './pages/event-manager';
import { EventQR } from './pages/event-qr';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { EventCreation } from './pages/new-event';
import { QRScanner } from './pages/scanner';

function App() {
	const [token, setToken] = useState('');
	const isDev = true;
	
	useEffect(() => {
		async function post() {
			await fetch('http://localhost:3000/session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(async (res) => {
				if (res.status === 200) {
					setToken(await res.text());
				}
			});
		}
		
		if (isDev) {
			post();
		}
	});
	
	
	if (!token && !isDev) {
		return (
			<>
				<NavBar title="About"></NavBar>
				<Routes>
					<Route path={ AppRoutes.HOME } element={ <About /> } />
					<Route path={ AppRoutes.LOGIN } element={ <Login setToken={ setToken } /> } />
					<Route path={ AppRoutes.NOT_FOUND } element={ <Navigate to={ AppRoutes.LOGIN } replace /> } />
				</Routes>
			</>
		);
	}
	
	return (
		<>
			<NavBar title="Home Page"></NavBar>
			<Routes>
				<Route path={ AppRoutes.HOME } element={ <Home /> } />
				<Route path={ AppRoutes.EVENTS } element={ <EventManager /> } />
				<Route path={ AppRoutes.NEW_EVENT } element={ <EventCreation /> } />
				<Route path={ AppRoutes.SCANNER } element={ <QRScanner /> } />
				<Route path={ AppRoutes.EVENT_QR } element={ <EventQR /> } />
				<Route path={ AppRoutes.NOT_FOUND } element={ <Navigate to={ AppRoutes.HOME } replace /> } />
			</Routes>
		</>
	);
}

export default App;

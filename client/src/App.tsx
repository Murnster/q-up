import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/navbar';
import { UserDetails } from './constants/interfaces';
import { AppRoutes } from './constants/routes';
import './css/index.css';
import { useFetch } from './hooks/fetch';
import { About } from './pages/about';
import { EventManager } from './pages/event-manager';
import { EventQR } from './pages/event-qr';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { EventCreation } from './pages/new-event';
import { QRScanner } from './pages/scanner';
import { CreateUser } from './pages/user-creation';

function App() {
	const [user, setUser] = useState<UserDetails | null>(null);
	const { payload, fetchData } = useFetch<UserDetails>();
	const isDev = false;
	
	useEffect(() => {
		fetchData('/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
		});
	}, [fetchData]);
	
	useEffect(() => {
		if (payload?.data?.userID) {
			setUser(payload.data);
		}
	}, [payload]);
	
	if (!user && !isDev) {
		return (
			<>
				<NavBar title="About"></NavBar>
				<Routes>
					<Route path={ AppRoutes.HOME } element={ <About /> } />
					<Route path={ AppRoutes.LOGIN } element={ <Login /> } />
					<Route path={ AppRoutes.USER_CREATION } element={ <CreateUser setUser={ setUser }/> } />
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

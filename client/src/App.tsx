import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { NavBar } from './components/navbar';
import { getActiveEventsCount } from './constants/event-utils';
import { GetEventsPayload, UserDetails } from './constants/interfaces';
import { AppRoutes } from './constants/routes';
import './css/index.css';
import { useFetch } from './hooks/fetch';
import { useCredentials } from './hooks/use-crendentials';
import { About } from './pages/about';
import { CreateUser } from './pages/create-user';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { EventManager } from './pages/manage-events';
import { EventCreation } from './pages/new-event';
import { QRScanner } from './pages/scanner';
import { Profile } from './pages/profile';
import { EventView } from './pages/view-event';

function App() {
	const { user, setUser } = useCredentials();
	const { payload, fetchData } = useFetch<UserDetails>();
	const { fetchData: fetchEventsData } = useFetch<GetEventsPayload>();
	const [sessionChecked, setSessionChecked] = useState(false);
	const [activeEventsCount, setActiveEventsCount] = useState(0);
	const isDev = false;
	const location = useLocation();

	useEffect(() => {
		const checkSession = async () => {
			await fetchData('/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			});
		};

		checkSession();
	}, [fetchData]);

	useEffect(() => {
		if (payload?.data?.userID) {
			setUser(payload.data);
		}

		if (payload) {
			setSessionChecked(true);
		}
	}, [payload, setUser]);

	useEffect(() => {
		if (!user) {
			setActiveEventsCount(0);
			return;
		}

		const fetchEvents = async () => {
			const result = await fetchEventsData('/get-events', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			});

			if (result?.data?.events) {
				setActiveEventsCount(getActiveEventsCount(result.data.events));
				return;
			}

			setActiveEventsCount(0);
		};

		fetchEvents();
	}, [user, location.pathname, fetchEventsData]);

	if (!sessionChecked) {
		return (
			<>
				<NavBar title="Murney Events"></NavBar>
				<div className="app-loading">
					<div className="spinner"></div>
				</div>
			</>
		);
	}

	if (!user && !isDev) {
		return (
			<>
				<NavBar title="Murney Events"></NavBar>
				<div className="page-transition" key={ location.pathname }>
					<Routes>
						<Route path={ AppRoutes.HOME } element={ <About /> } />
						<Route path={ AppRoutes.LOGIN } element={ <Login /> } />
						<Route path={ AppRoutes.USER_CREATION } element={ <CreateUser /> } />
						<Route path={ AppRoutes.NOT_FOUND } element={ <Navigate to={ AppRoutes.LOGIN } replace /> } />
					</Routes>
				</div>
			</>
		);
	}

	return (
		<>
			<NavBar title="Murney Events" activeEventsCount={ activeEventsCount }></NavBar>
			<div className="page-transition" key={ location.pathname }>
				<Routes>
					<Route path={ AppRoutes.HOME } element={ <Home /> } />
					<Route path={ AppRoutes.EVENTS } element={ <EventManager /> } />
					<Route path={ AppRoutes.NEW_EVENT } element={ <EventCreation /> } />
					<Route path={ AppRoutes.SCANNER } element={ <QRScanner /> } />
					<Route path={ AppRoutes.EVENT_QR } element={ <EventView /> } />
					<Route path={ AppRoutes.PROFILE } element={ <Profile /> } />
				<Route path={ AppRoutes.NOT_FOUND } element={ <Navigate to={ AppRoutes.HOME } replace /> } />
				</Routes>
			</div>
		</>
	);
}

export default App;

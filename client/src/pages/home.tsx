import { Logo } from "../components/logo";
import { useAppNavigation } from "../hooks/navigation";

export const Home = () => {
	const { goToEvents, goToNewEvent, goToScanner } = useAppNavigation();

	return (
		<div className="dashboard">
			<Logo size={ 128 } />
			<p className="dashboard-blurb">Q-Up and get things moving — create events, share QR codes, and track who showed up in one scan.</p>
			<p className="dashboard-blurb">No more queuing around. Manage signups in real time and keep attendance organized without the hassle.</p>
			<div className="dashboard-grid">
				<div className="dashboard-action" onClick={ goToNewEvent }>
					<span className="dashboard-action__title">Start an Event</span>
					<span className="dashboard-action__subtitle">Create a new QR code event</span>
				</div>
				<div className="dashboard-action" onClick={ goToEvents }>
					<span className="dashboard-action__title">Manage Events</span>
					<span className="dashboard-action__subtitle">View and manage your events</span>
				</div>
				<div className="dashboard-action" onClick={ goToScanner }>
					<span className="dashboard-action__title">Scan QR</span>
					<span className="dashboard-action__subtitle">Sign up for an event</span>
				</div>
			</div>
		</div>
	);
};

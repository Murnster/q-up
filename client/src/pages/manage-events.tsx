import { useCallback, useEffect, useState } from "react";
import { EventCard } from "../components/event-card";
import { Skeleton } from "../components/skeleton";
import { getActiveEventsCount } from "../constants/event-utils";
import { EventDetails, EventSignup, GetEventsPayload } from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";
import { useToast } from "../hooks/use-toast";

export const EventManager = () => {
	const { goToEventQR } = useAppNavigation();
	const { fetchData, loading } = useFetch<GetEventsPayload>();
	const { addToast } = useToast();
	const [events, setEvents] = useState<EventDetails[]>([]);
	const [signups, setSignups] = useState<{ [eventID: string]: EventSignup[] }>({});
	const [hasFetched, setHasFetched] = useState(false);

	const fetchEvents = useCallback(async () => {
		const result = await fetchData('/get-events', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
		});

		if (result != null) {
			if (result?.errorCode) {
				addToast('Failed to fetch events. Please try again later.', 'error');
			} else if (result?.data) {
				setEvents(result.data.events || []);
				setSignups(result.data.signups || {});
			}
		}

		setHasFetched(true);
	}, [fetchData, addToast]);

	useEffect(() => {
		fetchEvents();
	}, [fetchEvents]);

	const now = Date.now();
	const activeEventsCount = getActiveEventsCount(events);
	const activeEvents = events.filter(e => e.endTime > now);
	const endedEvents = events.filter(e => e.endTime <= now);

	return (
		<div className="events-page">
			<h2>Your Events</h2>
			{ loading && !hasFetched && (
				<div className="events-list">
					<Skeleton variant="event-card" count={ 3 } />
				</div>
			) }
			{ hasFetched && (
				<div className="events-list">
					{ activeEvents.map((event) => (
						<EventCard
							key={ event.eventID }
							label={ event.name }
							description={ event.description }
							attendeeCount={ signups[event.eventID]?.length ?? 0 }
							startTime={ event.startTime }
							endTime={ event.endTime }
							onClick={ () => goToEventQR(event.eventID) }
						/>
					)) }
					{ activeEventsCount === 0 && (
						<div className="event-card__description">No active events</div>
					) }
					{ endedEvents.length > 0 && (
						<>
							<div className="events-section-label">Ended Events</div>
							{ endedEvents.map((event) => (
								<EventCard
									key={ event.eventID }
									label={ event.name }
									description={ event.description }
									ended
									attendeeCount={ signups[event.eventID]?.length ?? 0 }
									onClick={ () => goToEventQR(event.eventID) }
								/>
							)) }
						</>
					) }
				</div>
			) }
		</div>
	);
};

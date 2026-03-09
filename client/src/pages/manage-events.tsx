import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "../components/empty-state";
import { EventCard } from "../components/event-card";
import { Skeleton } from "../components/skeleton";
import { EventDetails, EventSignup, GetEventsPayload } from "../constants/interfaces";
import { useCredentials } from "../hooks/use-crendentials";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";
import { useToast } from "../hooks/use-toast";

export const EventManager = () => {
	const { goToEventQR, goToNewEvent } = useAppNavigation();
	const { user } = useCredentials();
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
	const userID = user?.userID;

	const myEvents = events.filter(e => e.createdBy === userID);
	const signedUpEvents = events.filter(e => e.createdBy !== userID && signups[e.eventID]?.some(s => s.userID === userID));

	const myActiveEvents = myEvents.filter(e => e.endTime > now);
	const myEndedEvents = myEvents.filter(e => e.endTime <= now);
	const signedUpActiveEvents = signedUpEvents.filter(e => e.endTime > now);
	const signedUpEndedEvents = signedUpEvents.filter(e => e.endTime <= now);

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
					{ myActiveEvents.map((event) => (
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
					{ myActiveEvents.length === 0 && (
						<EmptyState
							icon={
								<svg width="80" height="80" viewBox="0 0 24 24" fill="none">
									<rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
									<path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
									<path d="M8 2v2M16 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
									<path d="M12 13v4M10 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
								</svg>
							}
							heading="No active events"
							subtext="Create your first event to get started"
							action={{ label: "Create Event", onClick: goToNewEvent }}
						/>
					) }
					{ myEndedEvents.length > 0 && (
						<>
							<div className="events-section-label">Ended Events</div>
							{ myEndedEvents.map((event) => (
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
			{ hasFetched && (signedUpActiveEvents.length > 0 || signedUpEndedEvents.length > 0) && (
				<>
					<h2>Signed Up Events</h2>
					<div className="events-list">
						{ signedUpActiveEvents.map((event) => (
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
						{ signedUpEndedEvents.length > 0 && (
							<>
								<div className="events-section-label">Ended Events</div>
								{ signedUpEndedEvents.map((event) => (
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
				</>
			) }
		</div>
	);
};

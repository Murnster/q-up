import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useParams } from "react-router-dom";
import { Button } from "../components/button";
import { EmptyState } from "../components/empty-state";
import { Skeleton } from "../components/skeleton";
import {
	EventDetails,
	EventSignup,
	GetEventDetailsPayload,
	UserDetails,
} from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";
import { useCredentials } from "../hooks/use-crendentials";
import { useToast } from "../hooks/use-toast";

export const EventView = () => {
	const { eventID } = useParams<"eventID">();
	const { fetchData, loading } = useFetch<GetEventDetailsPayload>();
	const { user } = useCredentials();
	const { goToEvents } = useAppNavigation();
	const { addToast } = useToast();
	const [event, setEvent] = useState<EventDetails>();
	const [eventSignees, setEventSignees] = useState<EventSignup[]>([]);
	const [eventUsers, setEventUsers] = useState<{
		[userID: string]: UserDetails;
	}>({});
	const [hasFetched, setHasFetched] = useState(false);
	const deleteFetch = useFetch<{done: 1}>();

	const fetchEventDetails = useCallback(async () => {
		const result = await fetchData("/get-event-details", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				eventID: eventID || "",
			}),
		});

		if (result != null) {
			if (result?.errorCode) {
				addToast("Failed to fetch event. Please try again later.", "error");
			} else if (result?.data?.event) {
				setEvent(result.data.event);
				setEventSignees(result.data.signups || []);
				setEventUsers(result.data.users || {});
			}
		}

		setHasFetched(true);
	}, [fetchData, eventID, addToast]);

	const handleDeleteEvent = async () => {
		if (!window.confirm("Are you sure you want to delete this event?")) {
			return;
		}

		const result = await deleteFetch.fetchData("/delete-event", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ eventID }),
		});

		if (result?.data) {
			addToast("Event deleted successfully.", "success");
			goToEvents();
		} else {
			addToast("Failed to delete event.", "error");
		}
	};

	useEffect(() => {
		fetchEventDetails();
	}, [fetchEventDetails]);

	if (!eventID) {
		return <div className="content-page">Invalid Event ID</div>;
	}

	if (loading && !hasFetched) {
		return (
			<div className="event-detail">
				<Skeleton variant="event-detail" />
			</div>
		);
	}

	const isEnded = event ? Date.now() > event.endTime : false;
	const isCreator = event && user ? event.createdBy === user.userID : false;

	return (
		<div className="event-detail">
			<div className="event-detail__header">
				<div className="event-detail__header-main">
					<span className="event-detail__name">{ event?.name }</span>
					{ isEnded && (
						<span className="event-detail__description">This event has ended</span>
					) }
				</div>
				<div className="event-detail__header-actions">
					{ event && (
						<span className={ `status-badge status-badge--${isEnded ? 'ended' : 'active'}` }>
							{ isEnded ? "Ended" : "Active" }
						</span>
					) }
					{ isCreator && (
						<Button label="Delete Event" clickHandler={ handleDeleteEvent } variant="danger" />
					) }
				</div>
			</div>
			<div className="event-detail__grid">
				<div className="event-detail__main">
					{ !isEnded && (
						<div className="qr-display">
							<QRCode value={ eventID } fgColor="#00e5a0" bgColor="transparent" />
							<span className="qr-display__hint">Scan to sign up for this event</span>
						</div>
					) }
				</div>
				<div className="event-detail__aside">
					<div className="attendee-list" id="attendee-list">
						<div className="attendee-list__header">
							Attendees ({ eventSignees.length })
						</div>
						{ eventSignees.length === 0 && (
							<EmptyState
								icon={
									<svg width="72" height="72" viewBox="0 0 24 24" fill="none">
										<circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
										<path d="M2 19c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
										<path d="M19 11c1.7 0 3 1.3 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
										<circle cx="17" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
									</svg>
								}
								heading="No attendees yet"
								subtext="Share the QR code to start signing people up"
							/>
						) }
						{ eventSignees.map((signee) => (
							<div key={ signee.signupID } className="attendee-list__row">
								<span className="attendee-list__name">
									{ eventUsers[signee.userID]?.firstName }{ " " }
									{ eventUsers[signee.userID]?.lastName }
								</span>
								<span className="attendee-list__time">
									{ new Date(signee.timestamp).toLocaleString() }
								</span>
							</div>
						)) }
					</div>
					<button className="btn btn--ghost print-btn" onClick={ () => window.print() }>
						Print Attendees
					</button>
				</div>
			</div>
		</div>
	);
};

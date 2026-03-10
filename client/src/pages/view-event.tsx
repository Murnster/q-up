import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { useParams } from "react-router-dom";
import { Button } from "../components/button";
import { ConfirmModal } from "../components/confirm-modal";
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
	const [searchQuery, setSearchQuery] = useState("");
	const [confirmModal, setConfirmModal] = useState<{
		title: string;
		message: string;
		confirmLabel: string;
		variant: "primary" | "danger";
		onConfirm: () => void;
	} | null>(null);
	const deleteFetch = useFetch<{done: 1}>();
	const removeFetch = useFetch<{done: 1}>();

	const filteredSignees = useMemo(() => {
		const sorted = [...eventSignees].sort((a, b) =>
			new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
		);
		if (!searchQuery.trim()) {
			return sorted;
		}
		const query = searchQuery.toLowerCase();
		return sorted.filter((signee) => {
			const userInfo = eventUsers[signee.userID];
			if (!userInfo) {
				return false;
			}
			const fullName = `${userInfo.firstName} ${userInfo.lastName}`.toLowerCase();
			return fullName.includes(query);
		});
	}, [eventSignees, eventUsers, searchQuery]);

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

	const handleDeleteEvent = () => {
		setConfirmModal({
			title: "Delete Event",
			message: "Are you sure you want to delete this event? This action cannot be undone.",
			confirmLabel: "Delete",
			variant: "danger",
			onConfirm: async () => {
				setConfirmModal(null);
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
			},
		});
	};

	const handleRemoveAttendee = (userID: string) => {
		const userInfo = eventUsers[userID];
		const name = userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : "this attendee";
		setConfirmModal({
			title: "Remove Attendee",
			message: `Are you sure you want to remove ${name}?`,
			confirmLabel: "Remove",
			variant: "danger",
			onConfirm: async () => {
				setConfirmModal(null);
				const result = await removeFetch.fetchData("/remove-attendee", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ eventID, userID }),
				});

				if (result?.data) {
					addToast("Attendee removed successfully.", "success");
					fetchEventDetails();
				} else {
					addToast("Failed to remove attendee.", "error");
				}
			},
		});
	};

	const isEnded = useMemo(() => {
		return event ? Date.now() > event.endTime : false;
	}, [event]);

	useEffect(() => {
		fetchEventDetails();
	}, [fetchEventDetails]);

	useEffect(() => {
		if (!eventID || !hasFetched || !event || isEnded) {
			return;
		}

		const es = new EventSource(`/events/${eventID}/stream`, {
			withCredentials: true,
		});

		es.addEventListener('signup', (e) => {
			const { signup, user: userDetails } = JSON.parse(e.data) as {
				signup: EventSignup;
				user: UserDetails;
			};

			setEventSignees((prev) => {
				if (prev.some((s) => s.userID === signup.userID)) {
					return prev;
				}
				return [...prev, signup];
			});

			if (userDetails) {
				setEventUsers((prev) => ({
					...prev,
					[userDetails.userID]: userDetails,
				}));
			}
		});

		es.addEventListener('removal', (e) => {
			const { userID: removedUserID } = JSON.parse(e.data) as { userID: string };

			setEventSignees((prev) => prev.filter((s) => s.userID !== removedUserID));
			setEventUsers((prev) => {
				const next = { ...prev };
				delete next[removedUserID];
				return next;
			});
		});

		return () => {
			es.close();
		};
	}, [eventID, hasFetched, event, isEnded]);

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

	const isCreator = event && user ? event.createdBy === user.userID : false;
	const isSearching = searchQuery.trim().length > 0;

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
					{ !isEnded && isCreator && (
						<div className="qr-display">
							<QRCode value={ eventID } fgColor="#00e5a0" bgColor="transparent" />
							<span className="qr-display__hint">Scan to sign up for this event</span>
						</div>
					) }
					{ event?.description && (
						<p className="event-detail__description">{ event.description }</p>
					) }
				</div>
				<div className="event-detail__aside">
					<div className="attendee-list" id="attendee-list">
						<div className="attendee-list__header">
							{ isSearching
								? `Attendees (${ filteredSignees.length } / ${ eventSignees.length })`
								: `Attendees (${ eventSignees.length })`
							}
						</div>
						{ eventSignees.length > 0 && (
							<div className="attendee-list__search">
								<input
									type="text"
									className="attendee-list__search-input"
									placeholder="Search attendees..."
									value={ searchQuery }
									onChange={ (e) => setSearchQuery(e.target.value) }
								/>
							</div>
						) }
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
						{ isSearching && filteredSignees.length === 0 && eventSignees.length > 0 && (
							<div className="attendee-list__empty">
								No attendees matching "{ searchQuery }"
							</div>
						) }
						{ filteredSignees.map((signee) => (
							<div key={ signee.signupID } className="attendee-list__row">
								<div className="attendee-list__info">
									<span className="attendee-list__name">
										{ eventUsers[signee.userID]?.firstName }{ " " }
										{ eventUsers[signee.userID]?.lastName }
									</span>
									<span className="attendee-list__time">
										{ new Date(signee.timestamp).toLocaleString() }
									</span>
								</div>
								{ isCreator && (
									<button
										className="btn btn--ghost btn--small btn--ghost-danger"
										onClick={ () => handleRemoveAttendee(signee.userID) }
									>
										Remove
									</button>
								) }
							</div>
						)) }
					</div>
					<button className="btn btn--ghost print-btn" onClick={ () => window.print() }>
						Print Attendees
					</button>
				</div>
			</div>
			<ConfirmModal
				isOpen={ confirmModal !== null }
				title={ confirmModal?.title ?? "" }
				message={ confirmModal?.message ?? "" }
				confirmLabel={ confirmModal?.confirmLabel ?? "Confirm" }
				variant={ confirmModal?.variant ?? "danger" }
				onConfirm={ confirmModal?.onConfirm ?? (() => {}) }
				onCancel={ () => setConfirmModal(null) }
			/>
		</div>
	);
};

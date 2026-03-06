import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useParams } from "react-router-dom";
import {
	EventDetails,
	EventSignup,
	GetEventDetailsPayload,
	UserDetails,
} from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";
import { useCredentials } from "../hooks/use-crendentials";

export const EventView = () => {
	const { eventID } = useParams<"eventID">();
	const { fetchData } = useFetch<GetEventDetailsPayload>();
	const { user } = useCredentials();
	const { goToEvents } = useAppNavigation();
	const [event, setEvent] = useState<EventDetails>();
	const [eventSignees, setEventSignees] = useState<EventSignup[]>([]);
	const [getEventWarning, setGetEventWarning] = useState("");
	const [eventUsers, setEventUsers] = useState<{
		[userID: string]: UserDetails;
	}>({});
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
				handleGetEventError();
			} else if (result?.data?.event) {
				setEvent(result.data.event);
				setEventSignees(result.data.signups || []);
				setEventUsers(result.data.users || {});
			}
		}
	}, [fetchData, eventID]);

	const handleGetEventError = () => {
		setGetEventWarning("Failed to fetch event. Please try again later.");
	};

	const handleDeleteEvent = async () => {
		if (!window.confirm("Are you sure you want to delete this event?"))
			return;

		const result = await deleteFetch.fetchData("/delete-event", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ eventID }),
		});

		if (result?.data) {
			goToEvents();
		} else {
			setGetEventWarning("Failed to delete event.");
		}
	};

	useEffect(() => {
		fetchEventDetails();
	}, [fetchEventDetails]);

	if (!eventID) {
		return (
			<>
				<div>Invalid Event ID</div>
			</>
		);
	}

	const isEnded = event ? Date.now() > event.endTime : false;
	const isCreator = event && user ? event.createdBy === user.userID : false;

	return (
		<>
			<div className="fc g10 w100 vertCenter">
				<div
					className={ `textWarning ${!getEventWarning ? "hidden" : ""}` }
				>
					{ getEventWarning }
				</div>
				<div className="fc g5 w100 vertCenter">
					<div>
						{ event?.name }{ " " }
						{ event && (
							<span style={{ color: isEnded ? "#999" : "#2a2" }}>
								({ isEnded ? "Ended" : "Active" })
							</span>
						) }
					</div>
					{ !isEnded && (
						<div>Scan the QR to sign up for this event!</div>
					) }
					{ isEnded && (
						<div style={{ color: "#999" }}>This event has ended</div>
					) }
					{ isCreator && (
						<button onClick={ handleDeleteEvent }>
							Delete Event
						</button>
					) }
					{ !isEnded && <QRCode value={ eventID } /> }
				</div>
				<div className="fc g5 w100 vertCenter" id="attendee-list">
					<div>Registered people</div>
					{ eventSignees.map((signee) => {
						return (
							<div key={ signee.signupID } className="fc g5">
								<div>
									{ eventUsers[signee.userID]?.firstName }{ " " }
									{ eventUsers[signee.userID]?.lastName }
								</div>
								<div>
									Signed up at:{ " " }
									{ new Date(
										signee.timestamp,
									).toLocaleString() }
								</div>
							</div>
						);
					}) }
				</div>
				<button className="print-btn" onClick={ () => window.print() }>
					Print Attendees
				</button>
			</div>
		</>
	);
};

interface EventCardProps {
	label: string;
	description: string;
	ended?: boolean;
	attendeeCount?: number;
	startTime?: number;
	endTime?: number;
	onClick?: () => void;
};

const formatTimeRemaining = (endTime: number): string => {
	const remaining = endTime - Date.now();
	if (remaining <= 0) {
		return "Ended";
	}

	const hours = Math.floor(remaining / (1000 * 60 * 60));
	const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

	if (hours > 0) {
		return `${hours}h ${minutes}m remaining`;
	}

	return `${minutes}m remaining`;
};

export const EventCard = ({ label, description, ended, attendeeCount, endTime, onClick }: EventCardProps) => {
	return (
		<div className={ `event-card${ended ? ' event-card--ended' : ''}` } onClick={ onClick }>
			<span className="event-card__name">{ label }</span>
			<span className="event-card__description">{ description }</span>
			{ (attendeeCount !== undefined || endTime !== undefined) && (
				<div className="event-card__meta">
					{ attendeeCount !== undefined && (
						<span className="event-card__attendees">
							{ attendeeCount } { attendeeCount === 1 ? 'attendee' : 'attendees' }
						</span>
					) }
					{ endTime !== undefined && !ended && (
						<span className="event-card__time">{ formatTimeRemaining(endTime) }</span>
					) }
				</div>
			) }
		</div>
	);
};

interface EventCardProps {
	label: string;
	description: string;
};

export const EventCard = ({ label, description }: EventCardProps) => {
	return (
		<div className="fc input-wrapper g5">
			{ label && <label>{ label }</label> }
			{ description && <label>{ description }</label> }
		</div>
	);
};
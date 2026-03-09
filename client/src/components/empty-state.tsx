import { Button } from './button';

interface EmptyStateProps {
	icon: React.ReactNode;
	heading: string;
	subtext?: string;
	action?: { label: string; onClick: () => void };
}

export const EmptyState = ({ icon, heading, subtext, action }: EmptyStateProps) => (
	<div className="empty-state">
		<div className="empty-state__icon">{ icon }</div>
		<p className="empty-state__heading">{ heading }</p>
		{ subtext && <p className="empty-state__subtext">{ subtext }</p> }
		{ action && (
			<Button label={ action.label } clickHandler={ action.onClick } variant="ghost" />
		) }
	</div>
);

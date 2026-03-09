interface SkeletonProps {
	variant: "event-card" | "event-detail";
	count?: number;
}

export const Skeleton = ({ variant, count = 1 }: SkeletonProps) => {
	if (variant === "event-card") {
		return (
			<>
				{ Array.from({ length: count }).map((_, i) => (
					<div key={ i } className="skeleton skeleton--event-card">
						<div className="skeleton__line skeleton__line--title"></div>
						<div className="skeleton__line skeleton__line--text"></div>
						<div className="skeleton__line skeleton__line--text skeleton__line--short"></div>
					</div>
				)) }
			</>
		);
	}

	if (variant === "event-detail") {
		return (
			<div className="skeleton skeleton--event-detail">
				<div className="skeleton__line skeleton__line--heading"></div>
				<div className="skeleton__line skeleton__line--text"></div>
				<div className="skeleton__block skeleton__block--qr"></div>
			</div>
		);
	}

	return null;
};

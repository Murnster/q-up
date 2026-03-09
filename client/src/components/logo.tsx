interface LogoProps {
	size?: number;
}

export const Logo = ({ size = 28 }: LogoProps) => {
	return (
		<svg
			className="navbar__logo"
			width={ size }
			height={ size }
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor" />
			<rect x="12" y="2" width="8" height="8" rx="1.5" fill="currentColor" />
			<rect x="22" y="2" width="8" height="8" rx="1.5" fill="currentColor" />
			<rect x="2" y="12" width="8" height="8" rx="1.5" fill="currentColor" />
			<rect x="12" y="12" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.4" />
			<rect x="22" y="12" width="8" height="8" rx="1.5" fill="currentColor" />
			<rect x="2" y="22" width="8" height="8" rx="1.5" fill="currentColor" />
			<rect x="12" y="22" width="8" height="8" rx="1.5" fill="currentColor" />
			<rect x="22" y="22" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.4" />
		</svg>
	);
};

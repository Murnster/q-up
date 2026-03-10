import { Button } from "../components/button";
import { useAppNavigation } from "../hooks/navigation";

export const About = () => {
	const { goToUserCreation, goToLogin } = useAppNavigation();

	return (
		<div className="landing">
			<section className="landing-hero">
				<div className="landing-hero__glow"></div>
				<h1 className="landing-hero__title">Q-Up</h1>
				<p className="landing-hero__subtitle">
					Queue up your events, skip the queue for attendance. One scan is all it takes.
				</p>
				<div className="landing-hero__cta">
					<Button label="Get Started" clickHandler={ goToUserCreation } />
					<Button label="Sign In" clickHandler={ goToLogin } variant="ghost" />
				</div>
			</section>

			<section className="landing-features">
				<h2 className="landing-features__title">How It Works</h2>
				<div className="landing-features__grid">
					<div className="landing-features__card">
						<div className="landing-features__icon">
							<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
								<rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2"/>
								<path d="M12 16H20M16 12V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
							</svg>
						</div>
						<h3>Create Events</h3>
						<p>Set up an event in seconds with a name, description, and duration.</p>
					</div>
					<div className="landing-features__card">
						<div className="landing-features__icon">
							<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
								<rect x="6" y="6" width="8" height="8" rx="1" fill="currentColor"/>
								<rect x="18" y="6" width="8" height="8" rx="1" fill="currentColor"/>
								<rect x="6" y="18" width="8" height="8" rx="1" fill="currentColor"/>
								<rect x="18" y="18" width="8" height="8" rx="1" fill="currentColor" opacity="0.4"/>
							</svg>
						</div>
						<h3>Share & Scan</h3>
						<p>Each event generates a unique QR code. Attendees scan to sign up instantly.</p>
					</div>
					<div className="landing-features__card">
						<div className="landing-features__icon">
							<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
								<path d="M8 18L13 23L24 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</div>
						<h3>Track Attendance</h3>
						<p>See who signed up in real time. Export attendee lists when you need them.</p>
					</div>
				</div>
			</section>

			<section className="landing-tech">
				<span className="landing-tech__pill">React</span>
				<span className="landing-tech__pill">TypeScript</span>
				<span className="landing-tech__pill">Express</span>
				<span className="landing-tech__pill">Redis</span>
				<span className="landing-tech__pill">Vite</span>
			</section>

			<section className="landing-cta">
				<h2>Ready to Q-Up?</h2>
				<Button label="Create Account" clickHandler={ goToUserCreation } />
			</section>
		</div>
	);
};

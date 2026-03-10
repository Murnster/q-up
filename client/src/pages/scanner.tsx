import jsQR from "jsqr";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";
import { useToast } from "../hooks/use-toast";

export const QRScanner = () => {
	const { goToHome } = useAppNavigation();
	const { fetchData, loading } = useFetch<{ done: 1 }>();
	const { addToast } = useToast();
	const [scanSuccess, setScanSuccess] = useState(false);
	const [permissionDenied, setPermissionDenied] = useState(false);
	const [scannerError, setScannerError] = useState<string | null>(null);
	const scanInFlight = useRef(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const animFrameRef = useRef<number | null>(null);

	const parseEventID = (rawValue?: string) => {
		if (!rawValue) {
			return null;
		}

		try {
			const url = new URL(rawValue);
			const matches = url.pathname.match(/^\/event\/([^/]+)$/);
			return matches?.[1] ?? null;
		} catch {
			return rawValue;
		}
	};

	const stopScanner = useCallback(() => {
		if (animFrameRef.current != null) {
			cancelAnimationFrame(animFrameRef.current);
			animFrameRef.current = null;
		}

		if (streamRef.current) {
			streamRef.current.getTracks().forEach(t => t.stop());
			streamRef.current = null;
		}

		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}
	}, []);

	const fetchSignupWithEventID = useCallback(async (eventID: string) => {
		const result = await fetchData('/register-event-signup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ eventID })
		});

		if (result != null) {
			if (result?.errorCode) {
				addToast('Failed to sign up for event. Please try again.', 'error');
			} else if (result?.data?.done) {
				setScanSuccess(true);
				addToast('Successfully signed up!', 'success');
				setTimeout(() => {
					goToHome();
				}, 1500);
				return;
			}
		}

		scanInFlight.current = false;
	}, [fetchData, goToHome, addToast]);

	useEffect(() => {
		if (scanSuccess) {
			stopScanner();
			return;
		}

		let cancelled = false;
		const video = videoRef.current;
		if (!video) {
			return;
		}

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) {
			setScannerError('Unable to initialize QR scanner.');
			return;
		}

		const scanFrame = () => {
			if (cancelled || video.readyState !== video.HAVE_ENOUGH_DATA) {
				animFrameRef.current = requestAnimationFrame(scanFrame);
				return;
			}

			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const code = jsQR(imageData.data, imageData.width, imageData.height);

			if (code && !scanInFlight.current && !loading) {
				const eventID = parseEventID(code.data);
				if (eventID) {
					scanInFlight.current = true;
					stopScanner();
					void fetchSignupWithEventID(eventID);
					return;
				}
			}

			animFrameRef.current = requestAnimationFrame(scanFrame);
		};

		const startCamera = async () => {
			setPermissionDenied(false);
			setScannerError(null);

			const tryStart = async (constraints: MediaTrackConstraints) => {
				const stream = await navigator.mediaDevices.getUserMedia({ video: constraints, audio: false });
				if (cancelled) {
					stream.getTracks().forEach(t => t.stop());
					return;
				}
				streamRef.current = stream;
				video.srcObject = stream;
				await video.play();
				animFrameRef.current = requestAnimationFrame(scanFrame);
			};

			try {
				await tryStart({ facingMode: { exact: 'environment' } });
			} catch (error) {
				if (cancelled) {
					return;
				}

				const message = error instanceof Error ? error.message : String(error);
				if (/permission|notallowed|denied/i.test(message)) {
					setPermissionDenied(true);
					return;
				}

				try {
					await tryStart({ facingMode: 'environment' });
				} catch (fallbackError) {
					if (cancelled) {
						return;
					}

					const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
					if (/permission|notallowed|denied/i.test(fallbackMessage)) {
						setPermissionDenied(true);
						return;
					}

					setScannerError('Unable to start the QR scanner on this device.');
					console.error('Scanner error:', fallbackError);
				}
			}
		};

		void startCamera();

		return () => {
			cancelled = true;
			stopScanner();
		};
	}, [fetchSignupWithEventID, loading, scanSuccess, stopScanner]);

	return (
		<div className="scanner-page">
			<h2>Scan QR Code</h2>
			{ scanSuccess ? (
				<div className="scanner-success">
					<svg width="64" height="64" viewBox="0 0 64 64" fill="none">
						<circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3"/>
						<path d="M20 32L28 40L44 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
					<span>Signed Up!</span>
				</div>
			) : (
				<>
					{ permissionDenied ? (
						<div className="scanner-permission-denied">
							<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
								<circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5"/>
								<path d="M24 14v12M24 34v.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
							</svg>
							<p>Camera access was denied.</p>
							<p>Please allow camera permission in your browser settings and reload the page.</p>
						</div>
					) : scannerError ? (
						<div className="scanner-permission-denied">
							<p>{ scannerError }</p>
						</div>
					) : (
						<>
							<span className="scanner-status">{ loading ? 'Signing up...' : 'Point your camera at an event QR code' }</span>
							<div className="scanner-wrapper">
								<div className="scanner-region">
									<video ref={ videoRef } muted playsInline />
								</div>
							</div>
						</>
					) }
				</>
			) }
		</div>
	);
};

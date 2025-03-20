import { Scanner } from "@yudiel/react-qr-scanner";

export const QRScanner = () => {
	return <Scanner onScan={ (result) => console.log(result) } />;
};
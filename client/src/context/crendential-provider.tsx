import { useState } from "react";
import { UserDetails } from "../constants/interfaces";
import { CredentialsContext } from "./crendential-context";


export const CredentialsProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<UserDetails | null>(null);
	
	return (
		<CredentialsContext.Provider value={{ user, setUser }}>
			{ children }
		</CredentialsContext.Provider>
	);
};
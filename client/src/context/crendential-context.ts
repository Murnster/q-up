import { createContext } from 'react';
import { UserDetails } from '../constants/interfaces';

export const CredentialsContext = createContext<{ user: UserDetails | null; setUser: (user: UserDetails | null) => void; } | undefined>(undefined);
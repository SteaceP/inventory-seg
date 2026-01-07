import { createContext } from 'react';

export interface ThemeContextType {
	darkMode: boolean;
	compactView: boolean;
	displayName: string;
	avatarUrl: string;
	role: string;
	language: 'fr' | 'en' | 'ar';
	toggleDarkMode: (enabled: boolean) => void;
	toggleCompactView: (enabled: boolean) => void;
	setUserProfile: (profile: { displayName?: string; avatarUrl?: string }) => void;
	setLanguage: (lang: 'fr' | 'en' | 'ar') => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

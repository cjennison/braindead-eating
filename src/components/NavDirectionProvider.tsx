"use client";

import { usePathname } from "next/navigation";
import {
	createContext,
	type ReactNode,
	useContext,
	useMemo,
	useRef,
} from "react";

const TAB_ORDER: Record<string, number> = {
	"/": 0,
	"/weight": 1,
	"/profile": 2,
};

interface NavDirectionContextValue {
	direction: number;
}

const NavDirectionContext = createContext<NavDirectionContextValue>({
	direction: 0,
});

export function useNavDirection() {
	return useContext(NavDirectionContext);
}

export function NavDirectionProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const prevIndexRef = useRef(TAB_ORDER[pathname] ?? 0);

	const currentIndex = TAB_ORDER[pathname] ?? -1;
	let direction = 0;

	if (currentIndex >= 0) {
		direction =
			currentIndex > prevIndexRef.current
				? 1
				: currentIndex < prevIndexRef.current
					? -1
					: 0;
		prevIndexRef.current = currentIndex;
	}

	const value = useMemo(() => ({ direction }), [direction]);

	return (
		<NavDirectionContext.Provider value={value}>
			{children}
		</NavDirectionContext.Provider>
	);
}

"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { NavDirectionProvider } from "@/components/NavDirectionProvider";
import { UserProvider } from "@/components/UserProvider";

export function Providers({ children }: { children: ReactNode }) {
	return (
		<SessionProvider>
			<NavDirectionProvider>
				<UserProvider>{children}</UserProvider>
			</NavDirectionProvider>
			<BottomNav />
		</SessionProvider>
	);
}

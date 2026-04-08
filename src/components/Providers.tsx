"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { NavDirectionProvider } from "@/components/NavDirectionProvider";
import { theme } from "@/theme";

export function Providers({ children }: { children: ReactNode }) {
	return (
		<SessionProvider>
			<MantineProvider theme={theme} defaultColorScheme="dark">
				<Notifications position="top-center" />
				<NavDirectionProvider>{children}</NavDirectionProvider>
				<BottomNav />
			</MantineProvider>
		</SessionProvider>
	);
}

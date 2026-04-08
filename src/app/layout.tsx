import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/bricolage-grotesque/700.css";
import "@fontsource/bricolage-grotesque/800.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/600.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";
import { ColorSchemeScript } from "@mantine/core";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
	title: "Brain Dead Eating",
	description: "It's Brain Dead.",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<head>
				<ColorSchemeScript defaultColorScheme="dark" />
			</head>
			<body
				style={{
					margin: 0,
				}}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}

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
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { theme } from "@/theme";

const SITE_URL = "https://braindeadeating.com";
const SITE_NAME = "Brain Dead Eating";
const SITE_DESCRIPTION =
	"The simplest calorie tracker ever made. " +
	"Type what you ate in plain English, and AI does the rest. " +
	"No barcode scanning, no food databases, no thinking required.";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: "Brain Dead Eating - The Simplest Calorie Tracker",
		template: "%s | Brain Dead Eating",
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	authors: [{ name: "Chris Jennison", url: "https://chrisjennison.dev" }],
	keywords: [
		"calorie tracker",
		"calorie counter",
		"AI calorie tracker",
		"simple calorie tracker",
		"easy calorie counter",
		"food tracker",
		"macro tracker",
		"weight loss app",
		"calorie counting app",
		"nutrition tracker",
		"diet tracker",
		"food diary",
		"AI nutrition",
		"plain English calorie tracker",
	],
	openGraph: {
		type: "website",
		siteName: SITE_NAME,
		title: "Brain Dead Eating - The Simplest Calorie Tracker",
		description: SITE_DESCRIPTION,
		url: SITE_URL,
		locale: "en_US",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Brain Dead Eating - The Simplest Calorie Tracker",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Brain Dead Eating - The Simplest Calorie Tracker",
		description: SITE_DESCRIPTION,
		images: ["/og-image.png"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	alternates: {
		canonical: SITE_URL,
	},
	manifest: "/manifest.webmanifest",
	icons: {
		icon: [
			{ url: "/icons/icon-48.webp", sizes: "48x48" },
			{ url: "/icons/icon-96.webp", sizes: "96x96" },
			{ url: "/icons/icon-192.webp", sizes: "192x192" },
			{ url: "/icons/icon-512.webp", sizes: "512x512" },
		],
		apple: "/apple-touch-icon.png",
	},
	category: "health",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "Brain Dead Eating",
		applicationCategory: "HealthApplication",
		operatingSystem: "Web, iOS, Android",
		description:
			"The simplest calorie tracker ever made. " +
			"Type what you ate in plain English, and AI does the rest. " +
			"No barcode scanning, no food databases, no thinking required.",
		url: SITE_URL,
		author: {
			"@type": "Person",
			name: "Chris Jennison",
			url: "https://chrisjennison.dev",
		},
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		featureList: [
			"AI-powered calorie estimation from plain English",
			"Macro tracking (protein, carbs, fat)",
			"Weight tracking with visual charts",
			"Exercise calorie offset tracking",
			"Food history and daily summaries",
			"Data export in JSON format",
		],
	};

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<ColorSchemeScript defaultColorScheme="light" />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd),
					}}
				/>
			</head>
			<body
				style={{
					margin: 0,
				}}
			>
				<MantineProvider theme={theme} defaultColorScheme="light">
					<Notifications position="top-center" />
					{children}
				</MantineProvider>
			</body>
		</html>
	);
}

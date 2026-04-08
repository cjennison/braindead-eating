import type { CapacitorConfig } from "@capacitor/cli";

const appUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
	appId: "com.cjennison.braindead-eating",
	appName: "Brain Dead Eating",
	webDir: "public",
	server: {
		androidScheme: "https",
		...(appUrl ? { url: appUrl } : {}),
		// Keep Google OAuth redirects inside WKWebView instead of
		// opening Safari, so the session cookie stays in the app.
		allowNavigation: [
			"accounts.google.com",
			"*.google.com",
			"*.googleapis.com",
			"*.gstatic.com",
		],
	},
};

export default config;

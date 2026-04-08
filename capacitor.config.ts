import type { CapacitorConfig } from "@capacitor/cli";

const appUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
	appId: "com.braindead.eating",
	appName: "Brain Dead Eating",
	webDir: "public",
	ios: {
		overrideUserAgent:
			"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
	},
	server: {
		androidScheme: "https",
		...(appUrl ? { url: appUrl } : {}),
	},
};

export default config;

import type { CapacitorConfig } from "@capacitor/cli";

const appUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
	appId: "com.braindead.eating",
	appName: "Brain Dead Eating",
	webDir: "public",
	server: {
		androidScheme: "https",
		...(appUrl ? { url: appUrl } : {}),
	},
};

export default config;

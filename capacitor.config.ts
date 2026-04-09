import type { CapacitorConfig } from "@capacitor/cli";

const appUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
	appId: "com.cjennison.braindead-eating",
	appName: "Braindead Eating",
	webDir: "public",
	server: {
		androidScheme: "https",
		...(appUrl ? { url: appUrl } : {}),
	},
};

export default config;

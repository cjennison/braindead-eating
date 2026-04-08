import type { CapacitorConfig } from "@capacitor/cli";

const appUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
	appId: "com.braindead.eating",
	appName: "Brain Dead Eating",
	webDir: "public",
	plugins: {
		GoogleAuth: {
			iosClientId:
				"344158561006-ijclh8eajb31j3irs2t8m97d315mh8ii.apps.googleusercontent.com",
			serverClientId:
				"344158561006-l4gs9f78kg8617a6ddht1hpfi4qua3rb.apps.googleusercontent.com",
			scopes: ["email", "profile"],
		},
	},
	server: {
		androidScheme: "https",
		...(appUrl ? { url: appUrl } : {}),
	},
};

export default config;

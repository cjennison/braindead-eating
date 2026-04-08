import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.braindead.eating",
  appName: "Brain Dead Eating",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;

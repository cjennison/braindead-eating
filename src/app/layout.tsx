import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
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
      <body style={{ backgroundColor: "#FAF9F6", margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

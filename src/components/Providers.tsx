"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { theme } from "@/theme";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <MantineProvider theme={theme}>
        <Notifications position="top-center" />
        {children}
      </MantineProvider>
    </SessionProvider>
  );
}

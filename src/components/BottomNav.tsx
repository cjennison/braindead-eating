"use client";

import { Group, Text, UnstyledButton } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Eat" },
  { href: "/weight", label: "Wt" },
  { href: "/profile", label: "Me" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #E0E0E0",
        paddingBottom: "env(safe-area-inset-bottom)",
        zIndex: 100,
      }}
    >
      <Group
        justify="space-around"
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "8px 0",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <UnstyledButton
              key={item.href}
              component={Link}
              href={item.href}
              style={{
                textAlign: "center",
                padding: "8px 24px",
                minWidth: 64,
                minHeight: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              <Text
                size="lg"
                fw={isActive ? 700 : 400}
                c={isActive ? "sage.5" : "dimmed"}
              >
                {item.label}
              </Text>
            </UnstyledButton>
          );
        })}
      </Group>
    </div>
  );
}

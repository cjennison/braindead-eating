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
				bottom: "calc(16px + env(safe-area-inset-bottom))",
				left: 0,
				right: 0,
				zIndex: 100,
				pointerEvents: "none",
			}}
		>
			<div
				style={{
					maxWidth: 400,
					margin: "0 auto",
					width: "calc(100% - 32px)",
					backgroundColor: "var(--mantine-color-body)",
					backdropFilter: "blur(20px)",
					WebkitBackdropFilter: "blur(20px)",
					borderRadius: "100px",
					border: "1px solid var(--mantine-color-default-border)",
					boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
					pointerEvents: "auto",
				}}
			>
				<Group
					justify="space-between"
					gap={0}
					style={{
						padding: "8px",
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
									padding: "12px 24px",
									borderRadius: "100px",
									minWidth: 80,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									backgroundColor: isActive
										? "rgba(45, 212, 191, 0.1)"
										: "transparent",
									transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
								}}
								aria-current={isActive ? "page" : undefined}
							>
								<Text
									size="md"
									fw={isActive ? 800 : 500}
									c={isActive ? "teal.5" : "dimmed"}
									style={{
										fontFamily: "var(--mantine-font-family-headings)",
										letterSpacing: "0.02em",
									}}
								>
									{item.label}
								</Text>
							</UnstyledButton>
						);
					})}
				</Group>
			</div>
		</div>
	);
}

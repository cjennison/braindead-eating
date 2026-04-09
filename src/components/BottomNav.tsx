"use client";

import { Text, UnstyledButton } from "@mantine/core";
import {
	IconFlame,
	IconFlameFilled,
	IconScale,
	IconUser,
	IconUserFilled,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

const ICON_SIZE = 24;
const ICON_STROKE = 1.5;

interface NavItem {
	href: string;
	label: string;
	icon: ComponentType<{ size: number; stroke: number }>;
	activeIcon: ComponentType<{ size: number; stroke: number }>;
}

const NAV_ITEMS: NavItem[] = [
	{
		href: "/app",
		label: "Eat",
		icon: IconFlame,
		activeIcon: IconFlameFilled,
	},
	{
		href: "/app/weight",
		label: "Weight",
		icon: IconScale,
		activeIcon: IconScale,
	},
	{
		href: "/app/profile",
		label: "Profile",
		icon: IconUser,
		activeIcon: IconUserFilled,
	},
];

const TAB_ROUTES = new Set([
	"/app",
	"/app/weight",
	"/app/profile",
	"/app/history",
]);

export function BottomNav() {
	const pathname = usePathname();

	if (!TAB_ROUTES.has(pathname)) {
		return null;
	}

	return (
		<nav
			style={{
				position: "fixed",
				bottom: 0,
				left: 0,
				right: 0,
				zIndex: 100,
				backgroundColor: "var(--mantine-color-body)",
				borderTop: "1px solid var(--mantine-color-default-border)",
				paddingBottom: "env(safe-area-inset-bottom, 0px)",
			}}
			aria-label="Main navigation"
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-around",
					alignItems: "center",
					height: 56,
					maxWidth: 480,
					margin: "0 auto",
				}}
			>
				{NAV_ITEMS.map((item) => {
					const isActive = pathname === item.href;
					const Icon = isActive ? item.activeIcon : item.icon;

					return (
						<UnstyledButton
							key={item.href}
							component={Link}
							href={item.href}
							aria-current={isActive ? "page" : undefined}
							aria-label={item.label}
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								flex: 1,
								height: "100%",
								gap: 2,
								position: "relative",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 48,
									height: 28,
									borderRadius: 14,
									backgroundColor: isActive
										? "var(--mantine-color-teal-light)"
										: "transparent",
									transition:
										"background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
								}}
							>
								<Icon size={ICON_SIZE} stroke={isActive ? 2 : ICON_STROKE} />
							</div>
							<Text
								size="xs"
								fw={isActive ? 700 : 500}
								c={isActive ? "teal.5" : "dimmed"}
								style={{
									lineHeight: 1,
									fontSize: 12,
								}}
							>
								{item.label}
							</Text>
						</UnstyledButton>
					);
				})}
			</div>
		</nav>
	);
}

"use client";

import {
	Button,
	Center,
	Container,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { signIn } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { PageTransition } from "@/components/PageTransition";

const APP_URL = "https://braindead-eating.vercel.app";

async function startNativeSignIn() {
	const { Browser } = await import("@capacitor/browser");
	const { App } = await import("@capacitor/app");

	return new Promise<string>((resolve, reject) => {
		let listenerHandle: { remove: () => Promise<void> } | null = null;

		const timeout = setTimeout(() => {
			cleanup();
			reject(new Error("Sign-in timed out"));
		}, 120_000);

		const cleanup = async () => {
			clearTimeout(timeout);
			if (listenerHandle) {
				await listenerHandle.remove();
			}
		};

		App.addListener("appUrlOpen", async (event) => {
			await cleanup();
			try {
				await Browser.close();
			} catch {
				// Browser may already be closed
			}

			const url = new URL(event.url);
			const exchange = url.searchParams.get("exchange");
			if (!exchange) {
				reject(new Error("Missing exchange token"));
				return;
			}
			resolve(exchange);
		}).then((handle) => {
			listenerHandle = handle;
		});

		const callbackPath = "/api/auth/mobile-callback";
		const authUrl = `${APP_URL}/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackPath)}`;
		Browser.open({ url: authUrl });
	});
}

export default function SignInPage() {
	const [ready, setReady] = useState(false);
	const [signingIn, setSigningIn] = useState(false);
	const [isNative, setIsNative] = useState(false);
	const signingInRef = useRef(false);

	useEffect(() => {
		import("@capacitor/core").then(({ Capacitor }) => {
			setIsNative(Capacitor.isNativePlatform());
		});
		setReady(true);
	}, []);

	const handleSignIn = async () => {
		if (signingInRef.current) return;
		signingInRef.current = true;
		setSigningIn(true);

		if (isNative) {
			try {
				const exchange = await startNativeSignIn();
				const encoded = encodeURIComponent(exchange);
				window.location.href = `${APP_URL}/api/auth/exchange?exchange=${encoded}`;
			} catch {
				setSigningIn(false);
				signingInRef.current = false;
			}
		} else {
			signIn("google", { callbackUrl: "/app" });
		}
	};

	return (
		<PageTransition>
			<Container size={480} py="xl">
				<Center mih="80vh">
					<Stack align="center" gap="xl">
						<Stack align="center" gap="xs">
							<Title order={1} ta="center" size="2rem" fw={800}>
								Brain Dead Eating
							</Title>
							<Text c="dimmed" size="lg" ta="center">
								Sign in or create an account
							</Text>
						</Stack>
						{ready ? (
							<Stack align="center" gap="sm" w="100%" maw={320}>
								<Button
									size="xl"
									onClick={handleSignIn}
									fullWidth
									loading={signingIn}
								>
									Continue with Google
								</Button>
								<Text c="dimmed" size="sm" ta="center">
									New here? This creates your account automatically.
								</Text>
							</Stack>
						) : (
							<Stack align="center" gap="sm" w="100%" maw={320}>
								<Skeleton height={52} radius="md" w="100%" />
								<Text c="dimmed" size="sm" ta="center">
									Getting things ready...
								</Text>
							</Stack>
						)}
					</Stack>
				</Center>
			</Container>
		</PageTransition>
	);
}

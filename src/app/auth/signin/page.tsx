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
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { PageTransition } from "@/components/PageTransition";

const isNative = typeof window !== "undefined" && "Capacitor" in window;

export default function SignInPage() {
	const [ready, setReady] = useState(false);
	const [signingIn, setSigningIn] = useState(false);
	const router = useRouter();

	useEffect(() => {
		setReady(true);
	}, []);

	const handleNativeSignIn = async () => {
		setSigningIn(true);
		try {
			const { GoogleAuth } = await import("@southdevs/capacitor-google-auth");
			await GoogleAuth.initialize();
			const result = await GoogleAuth.signIn({
				scopes: ["email", "profile"],
			});
			const idToken = result.authentication.idToken;

			const res = await fetch("/api/auth/native-google", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ idToken }),
			});

			if (!res.ok) {
				throw new Error("Failed to create session");
			}

			router.push("/");
		} catch {
			notifications.show({
				title: "Sign in failed",
				message: "Something went wrong. Try again.",
				color: "coral",
			});
			setSigningIn(false);
		}
	};

	const handleWebSignIn = () => {
		setSigningIn(true);
		signIn("google", { callbackUrl: "/" });
	};

	return (
		<PageTransition>
			<Container size={480} py="xl">
				<Center mih="80vh">
					<Stack align="center" gap="xl">
						<Title order={1} ta="center" size="2.5rem">
							Brain Dead Eating
						</Title>
						<Text c="dimmed" size="xl" ta="center">
							It's Brain Dead.
						</Text>
						{ready ? (
							<Button
								size="xl"
								onClick={isNative ? handleNativeSignIn : handleWebSignIn}
								fullWidth
								maw={320}
								loading={signingIn}
							>
								Sign in with Google
							</Button>
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

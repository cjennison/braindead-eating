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
import { useEffect, useState } from "react";
import { PageTransition } from "@/components/PageTransition";

export default function SignInPage() {
	const [ready, setReady] = useState(false);
	const [signingIn, setSigningIn] = useState(false);

	useEffect(() => {
		setReady(true);
	}, []);

	const handleSignIn = () => {
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
								onClick={handleSignIn}
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

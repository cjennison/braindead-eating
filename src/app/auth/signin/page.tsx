"use client";

import { Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import { signIn } from "next-auth/react";

export default function SignInPage() {
	return (
		<Container size={480} py="xl">
			<Center mih="80vh">
				<Stack align="center" gap="xl">
					<Title order={1} ta="center" size="2.5rem">
						Brain Dead Eating
					</Title>
					<Text c="dimmed" size="xl" ta="center">
						It's Brain Dead.
					</Text>
					<Button
						size="xl"
						onClick={() => signIn("google", { callbackUrl: "/" })}
						fullWidth
						maw={320}
					>
						Sign in with Google
					</Button>
				</Stack>
			</Center>
		</Container>
	);
}

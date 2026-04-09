"use client";

import { Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
	const [hasSession, setHasSession] = useState(false);
	const [checked, setChecked] = useState(false);

	useEffect(() => {
		fetch("/api/auth/session")
			.then((res) => res.json())
			.then((data) => {
				setHasSession(Boolean(data?.user));
				setChecked(true);
			})
			.catch(() => {
				setChecked(true);
			});
	}, []);

	return (
		<Container size={480} py="xl">
			<Center mih="80vh">
				<Stack align="center" gap="xl">
					<Title order={1} ta="center" size="2.5rem">
						Brain Dead Eating
					</Title>
					<Text
						size="xl"
						ta="center"
						c="dimmed"
						maw={360}
						style={{ lineHeight: 1.5 }}
					>
						Calorie tracking so simple you don't have to think about it.
					</Text>

					{checked && (
						<Stack gap="md" w="100%" maw={320}>
							{hasSession ? (
								<Button component={Link} href="/app" size="xl" fullWidth>
									Open App
								</Button>
							) : (
								<Button
									component={Link}
									href="/auth/signin"
									size="xl"
									fullWidth
								>
									Get Started
								</Button>
							)}
						</Stack>
					)}
				</Stack>
			</Center>
		</Container>
	);
}

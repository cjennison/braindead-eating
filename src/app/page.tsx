"use client";

import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Center,
	Container,
	Divider,
	Group,
	Paper,
	Progress,
	Stack,
	Table,
	Text,
	Textarea,
	Title,
} from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";

const DEMO_ITEMS = [
	{
		input: "3 slices of costco pizza and a diet coke",
		items: [
			{ name: "Costco Cheese Pizza (3 slices)", cal: 2130 },
			{ name: "Diet Coke (About 1 can)", cal: 0 },
		],
		macros: { protein: 96, carbs: 210, fat: 84 },
		totalCal: 2130,
	},
	{
		input: "chicken tendies",
		items: [{ name: "Chicken Tenders (5 pieces)", cal: 850 }],
		macros: { protein: 50, carbs: 60, fat: 45 },
		totalCal: 850,
	},
	{
		input: "choccy milk",
		items: [
			{ name: "Chocolate Milk (16 oz)", cal: 420 },
			{ name: "Pure Joy (Infinite)", cal: 0 },
		],
		macros: { protein: 16, carbs: 54, fat: 16 },
		totalCal: 420,
	},
	{
		input: "a mortgage",
		items: [{ name: "Avocado Toast (2 slices)", cal: 350 }],
		macros: { protein: 12, carbs: 30, fat: 22 },
		totalCal: 350,
	},
	{
		input: "pizza and a bag of snack mix",
		items: [
			{ name: "Cheese Pizza (2 slices)", cal: 560 },
			{ name: "Chex Mix (1 bag)", cal: 420 },
		],
		macros: { protein: 32, carbs: 95, fat: 38 },
		totalCal: 980,
	},
	{
		input: "egg sammies",
		items: [{ name: "Egg Sandwich (2 items)", cal: 550 }],
		macros: { protein: 28, carbs: 40, fat: 30 },
		totalCal: 550,
	},
];

function TypingDemo() {
	const [text, setText] = useState("");
	const [itemIndex, setItemIndex] = useState(0);
	const [phase, setPhase] = useState<"typing" | "sending" | "done">("typing");

	const [accumulatedItems, setAccumulatedItems] = useState<
		{ name: string; cal: number }[]
	>([]);
	const [accumulatedMacros, setAccumulatedMacros] = useState({
		protein: 0,
		carbs: 0,
		fat: 0,
	});
	const [accumulatedCals, setAccumulatedCals] = useState(0);

	useEffect(() => {
		if (phase !== "typing") return;

		let timeout: NodeJS.Timeout;
		let currentIndex = 0;
		const currentText = DEMO_ITEMS[itemIndex].input;

		// Clear if we looped
		if (itemIndex === 0 && accumulatedItems.length > 0) {
			setAccumulatedItems([]);
			setAccumulatedMacros({ protein: 0, carbs: 0, fat: 0 });
			setAccumulatedCals(0);
		}

		const typeChar = () => {
			if (currentIndex < currentText.length) {
				setText(currentText.slice(0, currentIndex + 1));
				currentIndex++;
				timeout = setTimeout(typeChar, 40 + Math.random() * 40);
			} else {
				timeout = setTimeout(() => setPhase("sending"), 500);
			}
		};

		timeout = setTimeout(typeChar, 800);

		return () => clearTimeout(timeout);
	}, [phase, itemIndex]);

	useEffect(() => {
		if (phase === "sending") {
			const timeout = setTimeout(() => {
				setPhase("done");
				const item = DEMO_ITEMS[itemIndex];
				setAccumulatedItems((prev) => [...item.items, ...prev].slice(0, 4)); // keep last 4 items max
				setAccumulatedMacros((prev) => ({
					protein: Math.min(150, prev.protein + item.macros.protein),
					carbs: Math.min(250, prev.carbs + item.macros.carbs),
					fat: Math.min(80, prev.fat + item.macros.fat),
				}));
				setAccumulatedCals((prev) => prev + item.totalCal);
			}, 800);
			return () => clearTimeout(timeout);
		}
		if (phase === "done") {
			const timeout = setTimeout(() => {
				setPhase("typing");
				setText("");
				setItemIndex((prev) => (prev + 1) % DEMO_ITEMS.length);
			}, 3000);
			return () => clearTimeout(timeout);
		}
	}, [phase]);

	return (
		<Stack w="100%" maw={400} gap="lg">
			<Paper
				withBorder
				p="md"
				radius="xl"
				w="100%"
				style={{
					boxShadow: "0 12px 32px rgba(0,0,0,0.05)",
					borderColor: phase === "done" ? "#5BAFA8" : undefined,
					transition: "border-color 0.3s ease",
				}}
			>
				<Stack gap="md">
					<Box pos="relative">
						<Textarea
							size="xl"
							radius="xl"
							autosize
							minRows={1}
							maxRows={4}
							value={text}
							readOnly
							placeholder="What did you eat?"
							styles={{
								input: {
									fontSize: "1.1rem",
									paddingRight: "60px",
									paddingTop: "14px",
									paddingBottom: "14px",
									backgroundColor: "var(--mantine-color-gray-1)",
									border: "1px solid var(--mantine-color-default-border)",
									lineHeight: 1.4,
								},
							}}
						/>
						<ActionIcon
							size="lg"
							radius="xl"
							color={phase === "sending" ? "gray" : "dark"}
							loading={phase === "sending"}
							style={{
								position: "absolute",
								right: "8px",
								top: "50%",
								transform: "translateY(-50%)",
							}}
						>
							{phase === "done" ? (
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="white"
									strokeWidth="3"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							) : (
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<line x1="12" y1="19" x2="12" y2="5"></line>
									<polyline points="5 12 12 5 19 12"></polyline>
								</svg>
							)}
						</ActionIcon>
					</Box>
				</Stack>
			</Paper>

			<Paper withBorder radius="lg" p="xl">
				<Stack gap="lg">
					<Stack gap="sm" mih={140} justify="flex-start">
						{accumulatedItems.length === 0 && (
							<Text c="dimmed" size="sm" ta="center" mt="xl" fs="italic">
								Waiting for food...
							</Text>
						)}
						{accumulatedItems.map((item, i) => (
							<Group
								key={i}
								justify="space-between"
								align="flex-start"
								wrap="nowrap"
								style={{
									animation:
										phase === "done" && i < DEMO_ITEMS[itemIndex].items.length
											? "popIn 0.3s ease-out"
											: "none",
								}}
							>
								<Text fw={600} size="md" lh={1.3} style={{ flex: 1 }}>
									{item.name}
								</Text>
								<Text c="teal.6" fw={700} size="md">
									{item.cal} cal
								</Text>
							</Group>
						))}
						<Divider variant="dashed" my="xs" />
						<Group justify="space-between" align="center">
							<Text
								c="dimmed"
								size="xs"
								fw={700}
								style={{ letterSpacing: "1px" }}
							>
								TOTAL
							</Text>
							<Text c="teal.6" fw={800} size="xl">
								{accumulatedCals.toLocaleString()} cal
							</Text>
						</Group>
					</Stack>

					<Divider />

					<Stack gap="md">
						<Title order={4} size="1rem">
							Today's Macros
						</Title>

						<Stack gap={4}>
							<Group justify="space-between">
								<Text
									size="10px"
									c="dimmed"
									fw={700}
									style={{ letterSpacing: "1px" }}
								>
									PROTEIN
								</Text>
								<Text size="sm" fw={700}>
									{accumulatedMacros.protein} g
								</Text>
							</Group>
							<Progress
								value={(accumulatedMacros.protein / 150) * 100}
								color="teal.5"
								size="md"
								radius="xl"
								style={{ transition: "width 0.5s ease" }}
							/>
						</Stack>

						<Stack gap={4}>
							<Group justify="space-between">
								<Text
									size="10px"
									c="dimmed"
									fw={700}
									style={{ letterSpacing: "1px" }}
								>
									CARBS
								</Text>
								<Text size="sm" fw={700}>
									{accumulatedMacros.carbs} g
								</Text>
							</Group>
							<Progress
								value={(accumulatedMacros.carbs / 250) * 100}
								color="sage.5"
								size="md"
								radius="xl"
								style={{ transition: "width 0.5s ease" }}
							/>
						</Stack>

						<Stack gap={4}>
							<Group justify="space-between">
								<Text
									size="10px"
									c="dimmed"
									fw={700}
									style={{ letterSpacing: "1px" }}
								>
									FAT
								</Text>
								<Text size="sm" fw={700}>
									{accumulatedMacros.fat} g
								</Text>
							</Group>
							<Progress
								value={(accumulatedMacros.fat / 80) * 100}
								color="coral.5"
								size="md"
								radius="xl"
								style={{ transition: "width 0.5s ease" }}
							/>
						</Stack>
					</Stack>
				</Stack>
			</Paper>
		</Stack>
	);
}

export default function LandingPage() {
	const [hasSession, setHasSession] = useState(false);
	const [checked, setChecked] = useState(false);
	const [scrollProgress, setScrollProgress] = useState(0);

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

	useEffect(() => {
		const handleScroll = () => {
			// Calculate how close we are to the bottom of the page
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			const scrollY = window.scrollY;

			// Get distance from bottom
			const distanceFromBottom = documentHeight - (scrollY + windowHeight);

			// Convert to a 0-1 progress value (1 being at the very bottom)
			// Start showing the cat when we're within 600px of the bottom
			const threshold = 600;
			const progress = Math.max(
				0,
				Math.min(1, 1 - distanceFromBottom / threshold),
			);

			setScrollProgress(progress);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		// Initial check
		handleScroll();

		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<Container size={480} py="xl">
			<Stack
				align="center"
				gap="clamp(2rem, 6vw, 4rem)"
				mih="80vh"
				pt="clamp(2rem, 10vw, 4rem)"
			>
				<Stack align="center" gap="lg" w="100%">
					<Title
						order={1}
						ta="center"
						size="clamp(2.5rem, 8vw, 4rem)"
						lh={1.05}
						style={{ letterSpacing: "-1px" }}
					>
						Brain Dead Eating
					</Title>
					<Text
						size="clamp(1.1rem, 4vw, 1.3rem)"
						ta="center"
						fw={500}
						maw={400}
						c="dimmed"
						style={{ lineHeight: 1.4 }}
					>
						For the single brain cell you have left at the end of the day.
					</Text>
				</Stack>

				<TypingDemo />

				<Stack gap="xl" w="100%" maw={400} mt="xl" pb={120}>
					<Paper p="xl" radius="xl" withBorder>
						<Title order={3} size="1.25rem" mb="sm">
							Why are you working so hard on MyFitnessPal?
						</Title>
						<Text c="dimmed" size="1.1rem" lh={1.5}>
							Searching for "Banana Farms brand banana pudding special"? You
							don't have time for that. Just tell it what you ate. It's that
							simple. Let the AI do the math. <code>Banana pudding</code> -
							done.
						</Text>
					</Paper>

					<Paper p="xl" radius="xl" withBorder>
						<Title order={3} size="1.25rem" mb="sm">
							Built for people
						</Title>
						<Text c="dimmed" size="1.1rem" lh={1.5}>
							You are people. It's designed specifically to be used with one
							thumb while you're half-asleep on the couch. You literally don't
							have to think.
						</Text>
					</Paper>

					<Paper
						p="xl"
						radius="xl"
						withBorder
						bg="var(--mantine-primary-color-filled)"
					>
						<Title order={3} size="1.25rem" mb="sm" c="white">
							Mostly Free. Slightly $1.
						</Title>
						<Text c="white" size="1.1rem" lh={1.5} opacity={0.9}>
							It's mostly free to use, but AI and servers aren't. Pitching in $1
							a month helps me keep the lights on, covers my time, and ensures
							you can keep putting absolutely zero effort into tracking your
							food.
						</Text>
					</Paper>

					<Title
						order={2}
						ta="center"
						size="2rem"
						mt="xl"
						fw={900}
						lts="-0.5px"
					>
						Us vs Them
					</Title>

					<Paper withBorder radius="xl" overflow="hidden" mt="sm">
						<Table layout="fixed">
							<Table.Thead bg="var(--mantine-color-gray-0)">
								<Table.Tr>
									<Table.Th p="md" w="50%">
										<Badge color="sage" size="lg" variant="filled">
											Brain Dead
										</Badge>
									</Table.Th>
									<Table.Th p="md" w="50%">
										<Badge color="gray" size="lg" variant="light">
											The $20 Apps
										</Badge>
									</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								<Table.Tr bg="var(--mantine-color-gray-0)">
									<Table.Td colSpan={2} py="xs" px="md">
										<Text
											size="xs"
											fw={800}
											tt="uppercase"
											lts="1px"
											c="dimmed"
										>
											Tracking
										</Text>
									</Table.Td>
								</Table.Tr>
								<Table.Tr>
									<Table.Td p="md" valign="top">
										<Text size="1rem" fw={600} lh={1.4}>
											Text what you ate. We do the math.
										</Text>
									</Table.Td>
									<Table.Td p="md" valign="top">
										<Text size="0.95rem" c="dimmed" lh={1.4}>
											Search an uncurated database of 14,321 slightly different
											variations of pizza brands.
										</Text>
									</Table.Td>
								</Table.Tr>

								<Table.Tr bg="var(--mantine-color-gray-0)">
									<Table.Td colSpan={2} py="xs" px="md">
										<Text
											size="xs"
											fw={800}
											tt="uppercase"
											lts="1px"
											c="dimmed"
										>
											Goals & Targets
										</Text>
									</Table.Td>
								</Table.Tr>
								<Table.Tr>
									<Table.Td p="md" valign="top">
										<Text size="1rem" fw={600} lh={1.4}>
											We stick to macros and calories. That's literally it.
										</Text>
									</Table.Td>
									<Table.Td p="md" valign="top">
										<Text size="0.95rem" c="dimmed" lh={1.4}>
											25 different charts showing your sodium macro-cycle trend
											over a 10-year baseline.
										</Text>
									</Table.Td>
								</Table.Tr>

								<Table.Tr bg="var(--mantine-color-gray-0)">
									<Table.Td colSpan={2} py="xs" px="md">
										<Text
											size="xs"
											fw={800}
											tt="uppercase"
											lts="1px"
											c="dimmed"
										>
											Social Community
										</Text>
									</Table.Td>
								</Table.Tr>
								<Table.Tr>
									<Table.Td p="md" valign="top">
										<Text size="1rem" fw={600} lh={1.4}>
											None. Use instagram or something.
										</Text>
									</Table.Td>
									<Table.Td p="md" valign="top">
										<Text size="0.95rem" c="dimmed" lh={1.4}>
											A feed of strangers posting pictures of their sad chicken
											breasts.
										</Text>
									</Table.Td>
								</Table.Tr>

								<Table.Tr bg="var(--mantine-color-gray-0)">
									<Table.Td colSpan={2} py="xs" px="md">
										<Text
											size="xs"
											fw={800}
											tt="uppercase"
											lts="1px"
											c="dimmed"
										>
											Personal Trainers
										</Text>
									</Table.Td>
								</Table.Tr>
								<Table.Tr>
									<Table.Td p="md" valign="top">
										<Text size="1rem" fw={600} lh={1.4}>
											We don't have them. Why do you need a trainer to type in
											your lunch?
										</Text>
									</Table.Td>
									<Table.Td p="md" valign="top">
										<Text size="0.95rem" c="dimmed" lh={1.4}>
											A $20/month tier where an AI pretends to be a fitness guru
											named 'Todd'.
										</Text>
									</Table.Td>
								</Table.Tr>
							</Table.Tbody>
						</Table>
					</Paper>
				</Stack>
			</Stack>
			{checked && (
				<Box
					pos="fixed"
					bottom={0}
					left={0}
					right={0}
					p="md"
					bg="var(--mantine-color-body)"
					style={{
						borderTop: "1px solid var(--mantine-color-default-border)",
						zIndex: 100,
						boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
					}}
				>
					<Center>
						<Box pos="relative" w="100%" maw={480}>
							<Box
								pos="absolute"
								right={24}
								style={{
									// Peak height is 40px above the bottom padding minus its native size padding, start fully hidden below the button
									bottom: `calc(-120px + ${scrollProgress * 200}px)`,
									width: "120px",
									height: "120px",
									zIndex: -1,
									transition: "bottom 0.1s ease-out, transform 0.2s",
									transform: `rotate(${scrollProgress * 10 - 5}deg)`,
									pointerEvents: "none",
								}}
							>
								{/* Using an img tag assuming the file is in public/orangecat.png */}
								<img
									src="/orangecat.png"
									alt="Sneaky orange cat"
									style={{
										width: "100%",
										height: "100%",
										objectFit: "contain",
									}}
								/>
							</Box>

							<Stack w="100%" pb="xs">
								{hasSession ? (
									<Button
										component={Link}
										href="/app"
										size="xl"
										radius="xl"
										fullWidth
										style={{ position: "relative", zIndex: 2 }}
									>
										Open App
									</Button>
								) : (
									<Button
										component={Link}
										href="/auth/signin"
										size="xl"
										radius="xl"
										fullWidth
										style={{ position: "relative", zIndex: 2 }}
									>
										Start Tracking
									</Button>
								)}
							</Stack>
						</Box>
					</Center>
				</Box>
			)}
		</Container>
	);
}

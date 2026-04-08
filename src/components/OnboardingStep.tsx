"use client";

import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface OnboardingStepProps {
	step: number;
	totalSteps: number;
	title: string;
	children: ReactNode;
	onNext: () => void;
	onSkip: () => void;
	nextLabel?: string;
	nextDisabled?: boolean;
	loading?: boolean;
}

export function OnboardingStep({
	step,
	totalSteps,
	title,
	children,
	onNext,
	onSkip,
	nextLabel = "Next",
	nextDisabled = false,
	loading = false,
}: OnboardingStepProps) {
	return (
		<Container size={480} py="xl">
			<AnimatePresence mode="wait">
				<motion.div
					key={step}
					initial={{ opacity: 0, x: 40 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -40 }}
					transition={{
						duration: 0.25,
						ease: [0.25, 0.1, 0.25, 1],
					}}
				>
					<Stack mih="80vh" justify="center" gap="xl">
						<Text c="dimmed" ta="center">
							Step {step} of {totalSteps}
						</Text>
						<Title order={2} ta="center" size="1.75rem">
							{title}
						</Title>
						{children}
						<Button
							fullWidth
							onClick={onNext}
							disabled={nextDisabled}
							loading={loading}
						>
							{nextLabel}
						</Button>
						<Button
							variant="subtle"
							color="gray"
							fullWidth
							onClick={onSkip}
							disabled={loading}
						>
							Skip
						</Button>
					</Stack>
				</motion.div>
			</AnimatePresence>
		</Container>
	);
}

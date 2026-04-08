"use client";

import {
	Card,
	Group,
	NumberInput,
	SegmentedControl,
	Stack,
	Text,
} from "@mantine/core";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { OnboardingStep } from "@/components/OnboardingStep";
import {
	calculateCalorieTarget,
	DEFICIT_MODES,
	type DeficitMode,
	formatNumber,
	getWeeklyLossLabel,
	toStoredWeight,
	type WeightUnit,
} from "@/types";

const TOTAL_STEPS = 3;
const DEFAULT_DEFICIT_MODE: DeficitMode = "locked-in";

export default function OnboardingPage() {
	const { update } = useSession();
	const [step, setStep] = useState(1);
	const [unit, setUnit] = useState<WeightUnit>("lbs");
	const [currentWeight, setCurrentWeight] = useState<number | string>("");
	const [goalWeight, setGoalWeight] = useState<number | string>("");
	const [selectedMode, setSelectedMode] =
		useState<DeficitMode>(DEFAULT_DEFICIT_MODE);
	const [saving, setSaving] = useState(false);

	const finishOnboarding = async (overrides: Record<string, unknown> = {}) => {
		setSaving(true);
		const rawWeight = typeof currentWeight === "number" ? currentWeight : null;
		const rawGoal = typeof goalWeight === "number" ? goalWeight : null;
		const storedWeight = rawWeight ? toStoredWeight(rawWeight, unit) : null;
		const storedGoal = rawGoal ? toStoredWeight(rawGoal, unit) : null;
		const mode = overrides.deficitMode ?? selectedMode;

		const modeOption = DEFICIT_MODES.find((m) => m.id === mode);
		const target =
			storedWeight && modeOption
				? calculateCalorieTarget(storedWeight, modeOption.deficitPerDay)
				: null;

		const body: Record<string, unknown> = {
			onboardingComplete: true,
			deficitMode: mode,
			unit,
		};

		if (storedWeight) body.currentWeight = storedWeight;
		if (storedGoal) body.goalWeight = storedGoal;
		if (target) body.dailyCalorieTarget = target;

		await fetch("/api/user", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		await update();
		window.location.href = "/";
	};

	const skipAll = () => finishOnboarding({ deficitMode: DEFAULT_DEFICIT_MODE });

	if (step === 1) {
		return (
			<OnboardingStep
				step={1}
				totalSteps={TOTAL_STEPS}
				title="What's your current weight?"
				onNext={() => setStep(2)}
				onSkip={() => setStep(2)}
				nextDisabled={typeof currentWeight !== "number" || currentWeight <= 0}
			>
				<SegmentedControl
					value={unit}
					onChange={(val) => setUnit(val as WeightUnit)}
					data={[
						{ label: "lbs", value: "lbs" },
						{ label: "kg", value: "kg" },
					]}
					fullWidth
				/>
				<NumberInput
					value={currentWeight}
					onChange={setCurrentWeight}
					placeholder="Enter weight"
					min={unit === "kg" ? 20 : 50}
					max={unit === "kg" ? 450 : 999}
					decimalScale={1}
					suffix={` ${unit}`}
					hideControls
					styles={{
						input: {
							fontSize: "2rem",
							textAlign: "center",
							fontWeight: 700,
							height: "auto",
							padding: "16px",
						},
					}}
				/>
			</OnboardingStep>
		);
	}

	if (step === 2) {
		return (
			<OnboardingStep
				step={2}
				totalSteps={TOTAL_STEPS}
				title="What's your goal weight?"
				onNext={() => setStep(3)}
				onSkip={() => setStep(3)}
				nextDisabled={typeof goalWeight !== "number" || goalWeight <= 0}
			>
				<NumberInput
					value={goalWeight}
					onChange={setGoalWeight}
					placeholder="Enter goal"
					min={unit === "kg" ? 20 : 50}
					max={unit === "kg" ? 450 : 999}
					decimalScale={1}
					suffix={` ${unit}`}
					hideControls
					styles={{
						input: {
							fontSize: "2rem",
							textAlign: "center",
							fontWeight: 700,
							height: "auto",
							padding: "16px",
						},
					}}
				/>
			</OnboardingStep>
		);
	}

	const weight =
		typeof currentWeight === "number"
			? toStoredWeight(currentWeight, unit)
			: toStoredWeight(180, "lbs");

	return (
		<OnboardingStep
			step={3}
			totalSteps={TOTAL_STEPS}
			title="Pick your intensity."
			onNext={() => finishOnboarding()}
			onSkip={skipAll}
			nextLabel="Let's go"
			loading={saving}
		>
			<Text c="dimmed" ta="center">
				Based on your numbers, here's what we recommend:
			</Text>
			<Stack gap="sm">
				{DEFICIT_MODES.map((mode) => {
					const target = calculateCalorieTarget(weight, mode.deficitPerDay);
					const isSelected = selectedMode === mode.id;
					return (
						<Card
							key={mode.id}
							padding="md"
							radius="md"
							withBorder
							onClick={() => setSelectedMode(mode.id as DeficitMode)}
							style={{
								cursor: "pointer",
								borderColor: isSelected
									? "var(--mantine-color-sage-5)"
									: undefined,
								borderWidth: isSelected ? 2 : 1,
							}}
						>
							<Group justify="space-between">
								<div>
									<Text fw={600}>{mode.label}</Text>
									<Text c="dimmed" size="sm">
										{mode.subtitle}
									</Text>
								</div>
								<div style={{ textAlign: "right" }}>
									<Text fw={500}>{formatNumber(target)} cal/day</Text>
									<Text c="dimmed" size="xs">
										{getWeeklyLossLabel(mode.deficitPerDay, unit)}
									</Text>
								</div>
							</Group>
						</Card>
					);
				})}
			</Stack>
		</OnboardingStep>
	);
}

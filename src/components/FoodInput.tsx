"use client";

import { Button, Text, Textarea } from "@mantine/core";
import { useState } from "react";
import { getRandomPlaceholder, INPUT_MAX_LENGTH } from "@/types";

interface FoodInputProps {
	onSubmit: (input: string) => Promise<void>;
	disabled?: boolean;
}

export function FoodInput({ onSubmit, disabled }: FoodInputProps) {
	const [value, setValue] = useState("");
	const [loading, setLoading] = useState(false);
	const [placeholder] = useState(() => getRandomPlaceholder());

	const trimmed = value.trim();
	const overLimit = trimmed.length > INPUT_MAX_LENGTH;

	const handleSubmit = async () => {
		if (!trimmed || loading || overLimit) return;

		setLoading(true);
		await onSubmit(trimmed);
		setValue("");
		setLoading(false);
	};

	return (
		<div style={{ position: "relative" }}>
			<Textarea
				placeholder={placeholder}
				value={value}
				onChange={(e) => setValue(e.currentTarget.value)}
				minRows={3}
				maxRows={5}
				autosize
				disabled={loading || disabled}
				aria-label="What did you eat?"
				variant="filled"
				radius="xl"
				size="lg"
				styles={{
					input: {
						fontSize: "1.25rem",
						padding: "1.5rem",
						backgroundColor: "var(--mantine-color-default)",
						boxShadow: "inset 0 2px 4px rgba(0,0,0,0.15)",
						border: "1px solid var(--mantine-color-default-border)",
						transition: "border-color 0.2s ease, box-shadow 0.2s ease",
						"&:focus": {
							borderColor: "var(--mantine-color-teal-5)",
							boxShadow:
								"0 0 0 2px rgba(45, 212, 191, 0.2), inset 0 2px 4px rgba(0,0,0,0.15)",
						},
					},
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						handleSubmit();
					}
				}}
			/>
			{trimmed.length > 0 && (
				<Text size="xs" c={overLimit ? "coral" : "dimmed"} ta="right" mt={4}>
					{trimmed.length}/{INPUT_MAX_LENGTH}
				</Text>
			)}
			<Button
				fullWidth
				mt="lg"
				size="lg"
				radius="xl"
				color="teal"
				onClick={handleSubmit}
				loading={loading}
				disabled={!trimmed || disabled || overLimit}
				loaderProps={{ type: "dots" }}
				style={{
					height: "3.5rem",
					fontSize: "1.25rem",
					fontFamily: "var(--mantine-font-family-headings)",
					letterSpacing: "0.02em",
					boxShadow:
						trimmed && !disabled && !loading && !overLimit
							? "0 4px 14px 0 rgba(45, 212, 191, 0.39)"
							: "none",
				}}
			>
				{loading ? "Logging..." : "Log it"}
			</Button>
		</div>
	);
}

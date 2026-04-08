import OpenAI from "openai";
import type { AIParsedResponse, AIResponse } from "@/types";
import { roundCalories, roundGrams } from "@/types";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	project: process.env.OPENAI_PROJECT_ID,
});

const SYSTEM_PROMPT = `You are a food calorie and macro estimator. The user will describe what they ate in natural language.

Your job:
1. Parse each distinct food item from the input.
2. Estimate calories, protein (g), carbs (g), and fat (g) for each item.
3. Use common serving sizes when not specified (e.g., "a coffee" = 8oz black coffee, "a beer" = 12oz regular beer, "toast" = 1 slice with butter).
4. Add clarifying details to item names (e.g., "Coffee (black, 8oz)", "Beer (regular, 12oz)").
5. Round calories to the nearest 5. Round grams to the nearest whole number.
6. If the input is not food (e.g., "hello", "what's the weather", gibberish, random text), set is_food to false and provide a helpful error_message.

Be accurate but practical. Pick the most common interpretation. Assume standard American portions unless otherwise specified.`;

interface OpenAIFoodResult {
	is_food: boolean;
	error_message: string;
	items: {
		name: string;
		calories: number;
		protein_g: number;
		carbs_g: number;
		fat_g: number;
	}[];
	total_calories: number;
	total_protein_g: number;
	total_carbs_g: number;
	total_fat_g: number;
}

const FOOD_PARSE_SCHEMA = {
	name: "food_parse_result",
	strict: true,
	schema: {
		type: "object",
		properties: {
			is_food: { type: "boolean" },
			error_message: { type: "string" },
			items: {
				type: "array",
				items: {
					type: "object",
					properties: {
						name: { type: "string" },
						calories: { type: "number" },
						protein_g: { type: "number" },
						carbs_g: { type: "number" },
						fat_g: { type: "number" },
					},
					required: ["name", "calories", "protein_g", "carbs_g", "fat_g"],
					additionalProperties: false,
				},
			},
			total_calories: { type: "number" },
			total_protein_g: { type: "number" },
			total_carbs_g: { type: "number" },
			total_fat_g: { type: "number" },
		},
		required: [
			"is_food",
			"error_message",
			"items",
			"total_calories",
			"total_protein_g",
			"total_carbs_g",
			"total_fat_g",
		],
		additionalProperties: false,
	},
} as const;

export async function parseFood(input: string): Promise<AIResponse> {
	const completion = await openai.chat.completions.create({
		model: "gpt-5.4-nano",
		messages: [
			{ role: "system", content: SYSTEM_PROMPT },
			{ role: "user", content: input },
		],
		response_format: {
			type: "json_schema",
			json_schema: FOOD_PARSE_SCHEMA,
		},
		temperature: 0.3,
	});

	const content = completion.choices[0]?.message?.content;
	if (!content) {
		return {
			error: true,
			message: "Something went wrong. Try again.",
		};
	}

	const result: OpenAIFoodResult = JSON.parse(content);

	if (!result.is_food) {
		return {
			error: true,
			message:
				result.error_message ||
				"I couldn't find any food in that. Try something like '2 eggs and toast'.",
		};
	}

	const parsed: AIParsedResponse = {
		items: result.items.map((item) => ({
			name: item.name,
			calories: roundCalories(item.calories),
			protein_g: roundGrams(item.protein_g),
			carbs_g: roundGrams(item.carbs_g),
			fat_g: roundGrams(item.fat_g),
		})),
		total: {
			calories: roundCalories(result.total_calories),
			protein_g: roundGrams(result.total_protein_g),
			carbs_g: roundGrams(result.total_carbs_g),
			fat_g: roundGrams(result.total_fat_g),
		},
	};

	return parsed;
}

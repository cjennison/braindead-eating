import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTodayForTimezone } from "@/lib/date";
import { connectDB } from "@/lib/db";
import { AiUsage } from "@/lib/models/AiUsage";
import { FoodLog } from "@/lib/models/FoodLog";
import { User } from "@/lib/models/User";
import { parseFood } from "@/lib/openai";
import { getAiDailyLimit, getEffectiveTier, INPUT_MAX_LENGTH } from "@/types";

export async function POST(request: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const input = body.input;

	if (!input || typeof input !== "string" || input.trim().length === 0) {
		return NextResponse.json(
			{ error: "Tell me what you ate." },
			{ status: 400 },
		);
	}

	const trimmed = input.trim();
	if (trimmed.length > INPUT_MAX_LENGTH) {
		return NextResponse.json(
			{ error: "Keep it shorter. Just list what you ate." },
			{ status: 400 },
		);
	}

	await connectDB();

	const user = await User.findById(session.user.id).lean();
	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const typedUser = {
		timezone: (user as Record<string, unknown>).timezone ?? "UTC",
		subscriptionTier:
			(user as Record<string, unknown>).subscriptionTier ?? "free",
		subscriptionExpiresAt:
			(user as Record<string, unknown>).subscriptionExpiresAt ?? null,
	} as {
		timezone: string;
		subscriptionTier: "free" | "pro" | "admin";
		subscriptionExpiresAt: Date | null;
	};
	const today = getTodayForTimezone(typedUser.timezone);

	const effectiveTier = getEffectiveTier({
		subscriptionTier: typedUser.subscriptionTier,
		subscriptionExpiresAt: typedUser.subscriptionExpiresAt,
	});

	const dailyLimit = getAiDailyLimit(effectiveTier);

	if (dailyLimit !== null) {
		const usage = await AiUsage.findOne({
			userId: session.user.id,
			date: today,
		});

		if (usage && usage.count >= dailyLimit) {
			return NextResponse.json(
				{
					error:
						effectiveTier === "free"
							? "You've used all 5 logs for today. Upgrade to Pro for 25 per day, or wait until midnight."
							: "You've logged all your meals for today. Resets at midnight.",
				},
				{ status: 429 },
			);
		}
	}

	await AiUsage.findOneAndUpdate(
		{ userId: session.user.id, date: today },
		{ $inc: { count: 1 } },
		{ upsert: true },
	);

	const result = await parseFood(trimmed);

	if ("error" in result) {
		return NextResponse.json({ error: result.message }, { status: 422 });
	}

	const foodLog = await FoodLog.create({
		userId: session.user.id,
		date: today,
		rawInput: trimmed,
		items: result.items,
		totalCalories: result.total.calories,
		totalProtein_g: result.total.protein_g,
		totalCarbs_g: result.total.carbs_g,
		totalFat_g: result.total.fat_g,
	});

	return NextResponse.json(foodLog, { status: 201 });
}

export async function GET(request: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await connectDB();

	const { searchParams } = new URL(request.url);
	let date = searchParams.get("date");

	if (!date) {
		const user = await User.findById(session.user.id).lean();
		const typedUser = user as unknown as { timezone: string } | null;
		date = getTodayForTimezone(typedUser?.timezone || "UTC");
	}

	const [logs, usage] = await Promise.all([
		FoodLog.find({
			userId: session.user.id,
			date,
		})
			.sort({ createdAt: -1 })
			.lean(),
		AiUsage.findOne({
			userId: session.user.id,
			date,
		}).lean(),
	]);

	return NextResponse.json({
		logs,
		aiUsageCount: (usage as { count: number } | null)?.count ?? 0,
	});
}

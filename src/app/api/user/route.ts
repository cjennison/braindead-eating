import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { AiUsage } from "@/lib/models/AiUsage";
import { FoodLog } from "@/lib/models/FoodLog";
import { User } from "@/lib/models/User";
import { WeightLog } from "@/lib/models/WeightLog";
import type { WeightUnit } from "@/types";
import {
	calculateCalorieTarget,
	DEFICIT_MODES,
	MAX_CALORIES_PER_DAY,
	MIN_CALORIES_PER_DAY,
} from "@/types";

const VALID_DEFICIT_MODES = new Set<string>(
	DEFICIT_MODES.map((m) => m.id).concat(["custom"]),
);
const VALID_UNITS = new Set<string>(["lbs", "kg"]);

export async function GET() {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await connectDB();

	const user = await User.findById(session.user.id).lean();
	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	return NextResponse.json({
		...user,
		subscriptionTier: user.subscriptionTier ?? "free",
		subscriptionExpiresAt: user.subscriptionExpiresAt ?? null,
		subscriptionSource: user.subscriptionSource ?? null,
		trialUsed: user.trialUsed ?? false,
	});
}

export async function PATCH(request: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const updates: Record<string, unknown> = {};

	if (body.currentWeight !== undefined) {
		if (typeof body.currentWeight !== "number" || body.currentWeight <= 0) {
			return NextResponse.json(
				{ error: "Enter a valid weight." },
				{ status: 400 },
			);
		}
		updates.currentWeight = body.currentWeight;
	}

	if (body.goalWeight !== undefined) {
		if (
			body.goalWeight !== null &&
			(typeof body.goalWeight !== "number" || body.goalWeight <= 0)
		) {
			return NextResponse.json(
				{ error: "Enter a valid goal weight." },
				{ status: 400 },
			);
		}
		updates.goalWeight = body.goalWeight;
	}

	if (body.unit !== undefined) {
		if (!VALID_UNITS.has(body.unit)) {
			return NextResponse.json(
				{ error: "Unit must be lbs or kg." },
				{ status: 400 },
			);
		}
		updates.unit = body.unit;
	}

	if (body.deficitMode !== undefined) {
		if (!VALID_DEFICIT_MODES.has(body.deficitMode)) {
			return NextResponse.json(
				{ error: "Invalid deficit mode." },
				{ status: 400 },
			);
		}
		updates.deficitMode = body.deficitMode;
	}

	if (body.dailyCalorieTarget !== undefined) {
		if (
			typeof body.dailyCalorieTarget !== "number" ||
			body.dailyCalorieTarget < MIN_CALORIES_PER_DAY ||
			body.dailyCalorieTarget > MAX_CALORIES_PER_DAY
		) {
			return NextResponse.json(
				{
					error: `Calorie target must be between ${MIN_CALORIES_PER_DAY} and ${MAX_CALORIES_PER_DAY}.`,
				},
				{ status: 400 },
			);
		}
		updates.dailyCalorieTarget = body.dailyCalorieTarget;
	}

	if (body.onboardingComplete !== undefined) {
		updates.onboardingComplete = Boolean(body.onboardingComplete);
	}

	if (
		updates.deficitMode &&
		updates.deficitMode !== "custom" &&
		updates.currentWeight
	) {
		const mode = DEFICIT_MODES.find((m) => m.id === updates.deficitMode);
		if (mode) {
			updates.dailyCalorieTarget = calculateCalorieTarget(
				updates.currentWeight as number,
				mode.deficitPerDay,
				(updates.unit as WeightUnit) || "lbs",
			);
		}
	}

	await connectDB();

	const user = await User.findByIdAndUpdate(session.user.id, updates, {
		new: true,
	}).lean();

	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	return NextResponse.json(user);
}

export async function DELETE() {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await connectDB();

	const userId = session.user.id;

	await Promise.all([
		User.findByIdAndDelete(userId),
		FoodLog.deleteMany({ userId }),
		WeightLog.deleteMany({ userId }),
		AiUsage.deleteMany({ userId }),
	]);

	return NextResponse.json({ success: true });
}

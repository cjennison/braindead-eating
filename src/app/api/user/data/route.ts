import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { AiUsage } from "@/lib/models/AiUsage";
import { ExerciseLog } from "@/lib/models/ExerciseLog";
import { FoodLog } from "@/lib/models/FoodLog";
import { User } from "@/lib/models/User";
import { WeightLog } from "@/lib/models/WeightLog";

export async function GET() {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await connectDB();

	const userId = session.user.id;

	const [user, foodLogs, weightLogs, exerciseLogs, aiUsage] = await Promise.all(
		[
			User.findById(userId).select("-__v").lean(),
			FoodLog.find({ userId })
				.select("-__v")
				.sort({ date: -1, createdAt: -1 })
				.lean(),
			WeightLog.find({ userId }).select("-__v").sort({ date: -1 }).lean(),
			ExerciseLog.find({ userId }).select("-__v").sort({ date: -1 }).lean(),
			AiUsage.find({ userId }).select("-__v").sort({ date: -1 }).lean(),
		],
	);

	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const exportData = {
		exportedAt: new Date().toISOString(),
		account: {
			email: (user as Record<string, unknown>).email,
			name: (user as Record<string, unknown>).name,
			createdAt: (user as Record<string, unknown>).createdAt,
			timezone: (user as Record<string, unknown>).timezone,
			unit: (user as Record<string, unknown>).unit,
			currentWeight: (user as Record<string, unknown>).currentWeight,
			goalWeight: (user as Record<string, unknown>).goalWeight,
			deficitMode: (user as Record<string, unknown>).deficitMode,
			dailyCalorieTarget: (user as Record<string, unknown>).dailyCalorieTarget,
			subscriptionTier: (user as Record<string, unknown>).subscriptionTier,
		},
		foodLogs: foodLogs.map((log) => {
			const l = log as Record<string, unknown>;
			return {
				date: l.date,
				rawInput: l.rawInput,
				items: l.items,
				totalCalories: l.totalCalories,
				totalProtein_g: l.totalProtein_g,
				totalCarbs_g: l.totalCarbs_g,
				totalFat_g: l.totalFat_g,
				createdAt: l.createdAt,
			};
		}),
		weightLogs: weightLogs.map((log) => {
			const l = log as Record<string, unknown>;
			return {
				date: l.date,
				weight: l.weight,
				createdAt: l.createdAt,
			};
		}),
		exerciseLogs: exerciseLogs.map((log) => {
			const l = log as Record<string, unknown>;
			return {
				date: l.date,
				caloriesBurned: l.caloriesBurned,
				createdAt: l.createdAt,
			};
		}),
		aiUsage: aiUsage.map((log) => {
			const l = log as Record<string, unknown>;
			return {
				date: l.date,
				count: l.count,
			};
		}),
	};

	return new NextResponse(JSON.stringify(exportData, null, 2), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Content-Disposition":
				'attachment; filename="braindead-eating-data.json"',
		},
	});
}

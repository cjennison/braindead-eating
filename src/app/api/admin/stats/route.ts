import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getTodayForTimezone } from "@/lib/date";
import { connectDB } from "@/lib/db";
import { AiUsage } from "@/lib/models/AiUsage";
import { FoodLog } from "@/lib/models/FoodLog";
import { User } from "@/lib/models/User";

export async function GET() {
	const adminId = await requireAdmin();
	if (!adminId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	await connectDB();

	const today = getTodayForTimezone("UTC");

	const [
		totalUsers,
		tierCounts,
		aiUsageToday,
		foodLogsToday,
		totalFoodLogs,
		usersAtLimit,
	] = await Promise.all([
		User.countDocuments(),
		User.aggregate([
			{
				$group: {
					_id: { $ifNull: ["$subscriptionTier", "free"] },
					count: { $sum: 1 },
				},
			},
		]),
		AiUsage.aggregate([
			{ $match: { date: today } },
			{ $group: { _id: null, total: { $sum: "$count" } } },
		]),
		FoodLog.countDocuments({ date: today }),
		FoodLog.countDocuments(),
		AiUsage.countDocuments({
			date: today,
			count: { $gte: 5 },
		}),
	]);

	const tiers: Record<string, number> = { free: 0, pro: 0, admin: 0 };
	for (const entry of tierCounts) {
		const e = entry as { _id: string; count: number };
		if (e._id in tiers) {
			tiers[e._id] = e.count;
		}
	}

	return NextResponse.json({
		totalUsers,
		tiers,
		aiUsageToday:
			(aiUsageToday[0] as { total: number } | undefined)?.total ?? 0,
		foodLogsToday,
		totalFoodLogs,
		usersAtLimit,
	});
}

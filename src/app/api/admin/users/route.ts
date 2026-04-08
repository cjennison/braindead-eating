import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getTodayForTimezone } from "@/lib/date";
import { connectDB } from "@/lib/db";
import { AiUsage } from "@/lib/models/AiUsage";
import { FoodLog } from "@/lib/models/FoodLog";
import { User } from "@/lib/models/User";

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
	const adminId = await requireAdmin();
	if (!adminId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	await connectDB();

	const { searchParams } = request.nextUrl;
	const search = searchParams.get("search")?.trim() ?? "";
	const page = Math.max(1, Number(searchParams.get("page")) || 1);
	const limit = Math.min(
		MAX_PAGE_SIZE,
		Math.max(1, Number(searchParams.get("limit")) || DEFAULT_PAGE_SIZE),
	);
	const skip = (page - 1) * limit;

	const filter: Record<string, unknown> = {};
	if (search) {
		const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		filter.$or = [
			{ name: { $regex: escaped, $options: "i" } },
			{ email: { $regex: escaped, $options: "i" } },
		];
	}

	const [users, total] = await Promise.all([
		User.find(filter)
			.select(
				"email name subscriptionTier subscriptionExpiresAt subscriptionSource trialUsed createdAt",
			)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		User.countDocuments(filter),
	]);

	const today = getTodayForTimezone("UTC");
	const userIds = users.map((u: Record<string, unknown>) => u._id);

	const [usageDocs, logCounts] = await Promise.all([
		AiUsage.find({ userId: { $in: userIds }, date: today }).lean(),
		FoodLog.aggregate([
			{ $match: { userId: { $in: userIds } } },
			{ $group: { _id: "$userId", count: { $sum: 1 } } },
		]),
	]);

	const usageMap = new Map<string, number>();
	for (const doc of usageDocs) {
		const d = doc as unknown as {
			userId: { toString(): string };
			count: number;
		};
		usageMap.set(d.userId.toString(), d.count);
	}

	const logCountMap = new Map<string, number>();
	for (const entry of logCounts) {
		const e = entry as { _id: { toString(): string }; count: number };
		logCountMap.set(e._id.toString(), e.count);
	}

	const enriched = users.map((u: Record<string, unknown>) => {
		const id = (u._id as { toString(): string }).toString();
		return {
			...u,
			subscriptionTier: u.subscriptionTier ?? "free",
			subscriptionExpiresAt: u.subscriptionExpiresAt ?? null,
			subscriptionSource: u.subscriptionSource ?? null,
			trialUsed: u.trialUsed ?? false,
			aiUsageToday: usageMap.get(id) ?? 0,
			totalFoodLogs: logCountMap.get(id) ?? 0,
		};
	});

	return NextResponse.json({
		users: enriched,
		total,
		page,
		totalPages: Math.ceil(total / limit),
	});
}

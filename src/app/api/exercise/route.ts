import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTodayForTimezone } from "@/lib/date";
import { connectDB } from "@/lib/db";
import { ExerciseLog } from "@/lib/models/ExerciseLog";
import { User } from "@/lib/models/User";

export async function GET(request: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await connectDB();

	const { searchParams } = new URL(request.url);
	const startDate = searchParams.get("startDate");
	const endDate = searchParams.get("endDate");

	if (startDate && endDate) {
		const logs = await ExerciseLog.find({
			userId: session.user.id,
			date: { $gte: startDate, $lte: endDate },
			caloriesBurned: { $gt: 0 },
		})
			.sort({ date: -1 })
			.lean();

		const byDate: Record<string, number> = {};
		for (const log of logs) {
			byDate[log.date as string] = log.caloriesBurned as number;
		}

		return NextResponse.json({ exerciseByDate: byDate });
	}

	const user = await User.findById(session.user.id).lean();
	const typedUser = user as unknown as { timezone: string } | null;
	const today = getTodayForTimezone(typedUser?.timezone || "UTC");

	const log = await ExerciseLog.findOne({
		userId: session.user.id,
		date: today,
	}).lean();

	return NextResponse.json({
		caloriesBurned:
			(log as { caloriesBurned: number } | null)?.caloriesBurned ?? 0,
	});
}

export async function POST(request: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const delta = body.delta;

	if (typeof delta !== "number" || !Number.isInteger(delta)) {
		return NextResponse.json({ error: "Invalid adjustment." }, { status: 400 });
	}

	await connectDB();

	const user = await User.findById(session.user.id).lean();
	const typedUser = user as unknown as { timezone: string } | null;
	const today = getTodayForTimezone(typedUser?.timezone || "UTC");

	const existing = await ExerciseLog.findOne({
		userId: session.user.id,
		date: today,
	});

	const currentBurn = existing?.caloriesBurned ?? 0;
	const newBurn = Math.max(0, currentBurn + delta);

	const log = await ExerciseLog.findOneAndUpdate(
		{ userId: session.user.id, date: today },
		{ caloriesBurned: newBurn },
		{ upsert: true, new: true },
	);

	return NextResponse.json({
		caloriesBurned: (log as { caloriesBurned: number }).caloriesBurned,
	});
}

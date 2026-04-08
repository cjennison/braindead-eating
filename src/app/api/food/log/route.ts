import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTodayForTimezone } from "@/lib/date";
import { connectDB } from "@/lib/db";
import { AiUsage } from "@/lib/models/AiUsage";
import { FoodLog } from "@/lib/models/FoodLog";
import { User } from "@/lib/models/User";
import { parseFood } from "@/lib/openai";
import { AI_DAILY_LIMIT } from "@/types";

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
  if (trimmed.length > 500) {
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

  const typedUser = user as unknown as { timezone: string };
  const today = getTodayForTimezone(typedUser.timezone || "UTC");

  const usage = await AiUsage.findOne({
    userId: session.user.id,
    date: today,
  });

  if (usage && usage.count >= AI_DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: "You've logged all your meals for today. Resets at midnight.",
      },
      { status: 429 },
    );
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

  const logs = await FoodLog.find({
    userId: session.user.id,
    date,
  })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(logs);
}

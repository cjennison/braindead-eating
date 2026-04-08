import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTodayForTimezone } from "@/lib/date";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { WeightLog } from "@/lib/models/WeightLog";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const logs = await WeightLog.find({ userId: session.user.id })
    .sort({ date: -1 })
    .limit(30)
    .lean();

  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const weight = body.weight;

  if (!weight || typeof weight !== "number" || weight <= 0) {
    return NextResponse.json(
      { error: "Enter a valid weight." },
      { status: 400 },
    );
  }

  await connectDB();

  const user = await User.findById(session.user.id).lean();
  const typedUser = user as unknown as { timezone: string } | null;
  const today = getTodayForTimezone(typedUser?.timezone || "UTC");

  const log = await WeightLog.findOneAndUpdate(
    { userId: session.user.id, date: today },
    { weight },
    { upsert: true, new: true },
  );

  await User.findByIdAndUpdate(session.user.id, {
    currentWeight: weight,
  });

  return NextResponse.json(log, { status: 201 });
}

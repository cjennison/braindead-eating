import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { getEffectiveTier } from "@/types";

const TRIAL_DURATION_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

	const typedUser = {
		subscriptionTier:
			(user as Record<string, unknown>).subscriptionTier ?? "free",
		subscriptionExpiresAt:
			(user as Record<string, unknown>).subscriptionExpiresAt ?? null,
		subscriptionSource:
			(user as Record<string, unknown>).subscriptionSource ?? null,
		trialUsed: (user as Record<string, unknown>).trialUsed ?? false,
	} as {
		subscriptionTier: "free" | "pro" | "admin";
		subscriptionExpiresAt: Date | null;
		subscriptionSource: string | null;
		trialUsed: boolean;
	};

	const effectiveTier = getEffectiveTier({
		subscriptionTier: typedUser.subscriptionTier,
		subscriptionExpiresAt: typedUser.subscriptionExpiresAt,
	});

	return NextResponse.json({
		tier: effectiveTier,
		storedTier: typedUser.subscriptionTier,
		expiresAt: typedUser.subscriptionExpiresAt,
		source: typedUser.subscriptionSource,
		trialUsed: typedUser.trialUsed,
	});
}

export async function POST(request: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = (await request.json()) as { action?: string };

	if (body.action !== "start-trial") {
		return NextResponse.json({ error: "Unknown action." }, { status: 400 });
	}

	await connectDB();

	const user = await User.findById(session.user.id);
	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	if (user.trialUsed) {
		return NextResponse.json(
			{ error: "You've already used your free trial." },
			{ status: 409 },
		);
	}

	const effectiveTier = getEffectiveTier({
		subscriptionTier: user.subscriptionTier,
		subscriptionExpiresAt: user.subscriptionExpiresAt,
	});

	if (effectiveTier === "pro" || effectiveTier === "admin") {
		return NextResponse.json(
			{ error: "You already have an active subscription." },
			{ status: 409 },
		);
	}

	const expiresAt = new Date(Date.now() + TRIAL_DURATION_DAYS * MS_PER_DAY);

	user.subscriptionTier = "pro";
	user.subscriptionExpiresAt = expiresAt;
	user.subscriptionSource = "trial";
	user.trialUsed = true;
	await user.save();

	return NextResponse.json({
		tier: "pro",
		expiresAt,
		source: "trial",
	});
}

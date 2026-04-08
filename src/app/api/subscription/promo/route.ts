import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { PromoCode } from "@/lib/models/PromoCode";
import { User } from "@/lib/models/User";
import { getEffectiveTier } from "@/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const CODE_PATTERN = /^[A-Z0-9]{3,20}$/;

export async function POST(request: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = (await request.json()) as { code?: string };
	const rawCode = body.code;

	if (!rawCode || typeof rawCode !== "string") {
		return NextResponse.json({ error: "Enter a promo code." }, { status: 400 });
	}

	const code = rawCode.trim().toUpperCase();

	if (!CODE_PATTERN.test(code)) {
		return NextResponse.json(
			{ error: "That doesn't look like a valid code." },
			{ status: 400 },
		);
	}

	await connectDB();

	const promo = await PromoCode.findOne({ code, active: true });

	if (!promo) {
		return NextResponse.json(
			{ error: "That code isn't valid." },
			{ status: 404 },
		);
	}

	if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
		return NextResponse.json(
			{ error: "That code has already been used." },
			{ status: 410 },
		);
	}

	const userId = session.user.id;

	const alreadyRedeemed = promo.redeemedBy.some(
		(id: { toString(): string }) => id.toString() === userId,
	);
	if (alreadyRedeemed) {
		return NextResponse.json(
			{ error: "You've already used this code." },
			{ status: 409 },
		);
	}

	const user = await User.findById(userId);
	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const currentTier = getEffectiveTier({
		subscriptionTier: user.subscriptionTier,
		subscriptionExpiresAt: user.subscriptionExpiresAt,
	});

	if (currentTier === "admin") {
		return NextResponse.json(
			{ error: "You already have admin access." },
			{ status: 409 },
		);
	}

	if (promo.tier === "pro" && currentTier === "pro") {
		return NextResponse.json(
			{ error: "You already have an active subscription." },
			{ status: 409 },
		);
	}

	const expiresAt = promo.durationDays
		? new Date(Date.now() + promo.durationDays * MS_PER_DAY)
		: null;

	await User.updateOne(
		{ _id: user._id },
		{
			$set: {
				subscriptionTier: promo.tier,
				subscriptionExpiresAt: expiresAt,
				subscriptionSource: "promo",
			},
		},
	);

	promo.currentUses += 1;
	promo.redeemedBy.push(new mongoose.Types.ObjectId(userId));
	await promo.save();

	return NextResponse.json({
		tier: promo.tier,
		expiresAt,
		source: "promo",
	});
}

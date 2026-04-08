import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

const VALID_TIERS = new Set(["free", "pro", "admin"]);

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
	const adminId = await requireAdmin();
	if (!adminId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	const { id } = await params;

	const body = (await request.json()) as {
		subscriptionTier?: string;
	};

	if (!body.subscriptionTier || !VALID_TIERS.has(body.subscriptionTier)) {
		return NextResponse.json(
			{ error: "Tier must be free, pro, or admin." },
			{ status: 400 },
		);
	}

	await connectDB();

	const user = await User.findByIdAndUpdate(
		id,
		{
			$set: {
				subscriptionTier: body.subscriptionTier,
				subscriptionExpiresAt: null,
				subscriptionSource: body.subscriptionTier === "free" ? null : "promo",
			},
		},
		{ new: true },
	)
		.select(
			"email name subscriptionTier subscriptionExpiresAt subscriptionSource trialUsed createdAt",
		)
		.lean();

	if (!user) {
		return NextResponse.json({ error: "User not found." }, { status: 404 });
	}

	return NextResponse.json(user);
}

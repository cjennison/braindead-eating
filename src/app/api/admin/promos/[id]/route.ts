import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/db";
import { PromoCode } from "@/lib/models/PromoCode";

const VALID_TIERS = new Set(["pro", "admin"]);

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
		active?: boolean;
		tier?: string;
		durationDays?: number | null;
		maxUses?: number | null;
	};

	const updates: Record<string, unknown> = {};

	if (body.active !== undefined) {
		updates.active = Boolean(body.active);
	}

	if (body.tier !== undefined) {
		if (!VALID_TIERS.has(body.tier)) {
			return NextResponse.json(
				{ error: "Tier must be pro or admin." },
				{ status: 400 },
			);
		}
		updates.tier = body.tier;
	}

	if (body.durationDays !== undefined) {
		if (
			body.durationDays !== null &&
			(typeof body.durationDays !== "number" || body.durationDays < 1)
		) {
			return NextResponse.json(
				{ error: "Duration must be a positive number." },
				{ status: 400 },
			);
		}
		updates.durationDays = body.durationDays;
	}

	if (body.maxUses !== undefined) {
		if (
			body.maxUses !== null &&
			(typeof body.maxUses !== "number" || body.maxUses < 1)
		) {
			return NextResponse.json(
				{ error: "Max uses must be a positive number." },
				{ status: 400 },
			);
		}
		updates.maxUses = body.maxUses;
	}

	if (Object.keys(updates).length === 0) {
		return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
	}

	await connectDB();

	const promo = await PromoCode.findByIdAndUpdate(
		id,
		{ $set: updates },
		{ new: true },
	).lean();

	if (!promo) {
		return NextResponse.json(
			{ error: "Promo code not found." },
			{ status: 404 },
		);
	}

	return NextResponse.json(promo);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
	const adminId = await requireAdmin();
	if (!adminId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	const { id } = await params;

	await connectDB();

	const promo = await PromoCode.findByIdAndDelete(id);

	if (!promo) {
		return NextResponse.json(
			{ error: "Promo code not found." },
			{ status: 404 },
		);
	}

	return NextResponse.json({ deleted: true });
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/db";
import { PromoCode } from "@/lib/models/PromoCode";

const CODE_PATTERN = /^[A-Z0-9]{3,20}$/;
const VALID_TIERS = new Set(["pro", "admin"]);

export async function GET() {
	const adminId = await requireAdmin();
	if (!adminId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	await connectDB();

	const codes = await PromoCode.find().sort({ createdAt: -1 }).lean();

	return NextResponse.json(codes);
}

export async function POST(request: Request) {
	const adminId = await requireAdmin();
	if (!adminId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	const body = (await request.json()) as {
		code?: string;
		tier?: string;
		durationDays?: number | null;
		maxUses?: number | null;
	};

	const code = body.code?.trim().toUpperCase();
	if (!code || !CODE_PATTERN.test(code)) {
		return NextResponse.json(
			{ error: "Code must be 3-20 alphanumeric characters." },
			{ status: 400 },
		);
	}

	if (!body.tier || !VALID_TIERS.has(body.tier)) {
		return NextResponse.json(
			{ error: "Tier must be pro or admin." },
			{ status: 400 },
		);
	}

	if (
		body.durationDays !== undefined &&
		body.durationDays !== null &&
		(typeof body.durationDays !== "number" || body.durationDays < 1)
	) {
		return NextResponse.json(
			{ error: "Duration must be a positive number." },
			{ status: 400 },
		);
	}

	if (
		body.maxUses !== undefined &&
		body.maxUses !== null &&
		(typeof body.maxUses !== "number" || body.maxUses < 1)
	) {
		return NextResponse.json(
			{ error: "Max uses must be a positive number." },
			{ status: 400 },
		);
	}

	await connectDB();

	const existing = await PromoCode.findOne({ code });
	if (existing) {
		return NextResponse.json(
			{ error: "That code already exists." },
			{ status: 409 },
		);
	}

	const promo = await PromoCode.create({
		code,
		tier: body.tier,
		durationDays: body.durationDays ?? null,
		maxUses: body.maxUses ?? null,
	});

	return NextResponse.json(promo, { status: 201 });
}

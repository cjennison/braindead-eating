import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { GdprRequest } from "@/lib/models/GdprRequest";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TYPES = new Set(["export", "delete"]);
const RATE_LIMIT_HOURS = 24;

export async function POST(request: Request) {
	const body = await request.json();
	const email = body.email;
	const type = body.type;

	if (!email || typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
		return NextResponse.json(
			{ error: "Enter a valid email address." },
			{ status: 400 },
		);
	}

	if (!type || !VALID_TYPES.has(type)) {
		return NextResponse.json(
			{ error: "Request type must be export or delete." },
			{ status: 400 },
		);
	}

	await connectDB();

	const cutoff = new Date(Date.now() - RATE_LIMIT_HOURS * 60 * 60 * 1000);
	const recentRequest = await GdprRequest.findOne({
		email: email.toLowerCase().trim(),
		createdAt: { $gte: cutoff },
	});

	if (recentRequest) {
		return NextResponse.json({
			message:
				"Your request has been received. We will process it within 30 days.",
		});
	}

	await GdprRequest.create({
		email: email.toLowerCase().trim(),
		type,
	});

	return NextResponse.json({
		message:
			"Your request has been received. We will process it within 30 days.",
	});
}

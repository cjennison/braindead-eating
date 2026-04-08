import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

const GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

interface GoogleTokenInfo {
	aud: string;
	email: string;
	email_verified: string;
	name: string;
	picture: string;
	sub: string;
}

export async function POST(request: Request) {
	const body = (await request.json()) as { idToken?: string };
	const { idToken } = body;

	if (!idToken) {
		return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
	}

	const tokenRes = await fetch(
		`${GOOGLE_TOKEN_INFO_URL}?id_token=${encodeURIComponent(idToken)}`,
	);

	if (!tokenRes.ok) {
		return NextResponse.json({ error: "Invalid token" }, { status: 401 });
	}

	const tokenInfo = (await tokenRes.json()) as GoogleTokenInfo;

	const validClientIds = [
		process.env.AUTH_GOOGLE_ID,
		process.env.AUTH_GOOGLE_IOS_CLIENT_ID,
	].filter(Boolean);

	if (!validClientIds.includes(tokenInfo.aud)) {
		return NextResponse.json({ error: "Invalid audience" }, { status: 401 });
	}

	if (tokenInfo.email_verified !== "true") {
		return NextResponse.json({ error: "Email not verified" }, { status: 401 });
	}

	await connectDB();

	let user = await User.findOne({ email: tokenInfo.email });

	if (!user) {
		user = await User.create({
			email: tokenInfo.email,
			name: tokenInfo.name || "User",
			image: tokenInfo.picture || "",
			timezone: "UTC",
		});
	}

	const secret = process.env.AUTH_SECRET;
	if (!secret) {
		return NextResponse.json(
			{ error: "Server configuration error" },
			{ status: 500 },
		);
	}

	const isSecure = request.url.startsWith("https://");
	const cookieName = isSecure
		? "__Secure-authjs.session-token"
		: "authjs.session-token";

	const sessionToken = await encode({
		token: {
			email: user.email,
			name: user.name,
			picture: user.image,
			sub: tokenInfo.sub,
			userId: user._id.toString(),
			onboardingComplete: user.onboardingComplete,
		},
		secret,
		salt: cookieName,
		maxAge: SESSION_MAX_AGE,
	});

	const response = NextResponse.json({ success: true });

	response.cookies.set(cookieName, sessionToken, {
		httpOnly: true,
		secure: isSecure,
		sameSite: "lax",
		path: "/",
		maxAge: SESSION_MAX_AGE,
	});

	return response;
}

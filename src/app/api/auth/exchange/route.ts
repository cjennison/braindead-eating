import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

const EXCHANGE_TTL_MS = 60_000;

function decrypt(
	encoded: string,
	secret: string,
): { s: string; t: number } | null {
	try {
		const [ivHex, encHex] = encoded.split(":");
		if (!ivHex || !encHex) return null;

		const key = crypto.scryptSync(secret, "mobile-auth-exchange", 32);
		const decipher = crypto.createDecipheriv(
			"aes-256-cbc",
			key,
			Buffer.from(ivHex, "hex"),
		);
		const decrypted = Buffer.concat([
			decipher.update(Buffer.from(encHex, "hex")),
			decipher.final(),
		]);
		const payload = JSON.parse(decrypted.toString("utf8"));

		if (typeof payload.t !== "number" || typeof payload.s !== "string") {
			return null;
		}

		if (Date.now() - payload.t > EXCHANGE_TTL_MS) {
			return null;
		}

		return payload;
	} catch {
		return null;
	}
}

export async function GET(request: NextRequest) {
	const secret = process.env.AUTH_SECRET;

	if (!secret) {
		return NextResponse.json(
			{ error: "Server configuration error" },
			{ status: 500 },
		);
	}

	const exchangeToken = request.nextUrl.searchParams.get("exchange");

	if (!exchangeToken) {
		return NextResponse.json(
			{ error: "Missing exchange token" },
			{ status: 400 },
		);
	}

	const payload = decrypt(exchangeToken, secret);

	if (!payload) {
		return NextResponse.json(
			{ error: "Invalid or expired token" },
			{ status: 401 },
		);
	}

	const isSecure = request.nextUrl.protocol === "https:";
	const cookieName = isSecure
		? "__Secure-authjs.session-token"
		: "authjs.session-token";

	const response = NextResponse.redirect(new URL("/", request.url), {
		status: 302,
	});
	response.cookies.set(cookieName, payload.s, {
		httpOnly: true,
		secure: isSecure,
		sameSite: "lax",
		maxAge: 30 * 24 * 60 * 60,
		path: "/",
	});

	return response;
}

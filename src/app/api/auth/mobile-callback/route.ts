import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

function encrypt(payload: string, secret: string): string {
	const key = crypto.scryptSync(secret, "mobile-auth-exchange", 32);
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
	const encrypted = Buffer.concat([
		cipher.update(payload, "utf8"),
		cipher.final(),
	]);
	return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export async function GET(request: NextRequest) {
	const secret = process.env.AUTH_SECRET;

	if (!secret) {
		return NextResponse.json(
			{ error: "Server configuration error" },
			{ status: 500 },
		);
	}

	const sessionToken =
		request.cookies.get("__Secure-authjs.session-token")?.value ??
		request.cookies.get("authjs.session-token")?.value;

	if (!sessionToken) {
		return NextResponse.json({ error: "No session found" }, { status: 401 });
	}

	const payload = JSON.stringify({
		s: sessionToken,
		t: Date.now(),
	});
	const exchangeToken = encrypt(payload, secret);

	const encoded = encodeURIComponent(exchangeToken);
	const redirectUrl = `braindead-eating://callback?exchange=${encoded}`;

	return NextResponse.redirect(redirectUrl, { status: 302 });
}

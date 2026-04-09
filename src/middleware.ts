import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Only protect /app routes — everything else is public
	if (!pathname.startsWith("/app")) {
		return NextResponse.next();
	}

	const sessionToken =
		request.cookies.get("authjs.session-token") ??
		request.cookies.get("__Secure-authjs.session-token");

	if (!sessionToken) {
		const signInUrl = new URL("/auth/signin", request.url);
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/app/:path*"],
};

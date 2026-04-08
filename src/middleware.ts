import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/auth/signin", "/api/auth", "/_next", "/favicon.ico"];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
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
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

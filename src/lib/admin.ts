import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

/**
 * Verifies the current session belongs to an admin user.
 * Returns the user ID if authorized, or null if not.
 *
 * Every admin API route MUST call this before doing anything.
 * This checks both the session token AND the database record
 * to prevent stale JWT tokens from granting access.
 */
export async function requireAdmin(): Promise<string | null> {
	const session = await auth();
	if (!session?.user?.id) return null;

	await connectDB();

	const user = await User.findById(session.user.id)
		.select("subscriptionTier")
		.lean();

	if (!user) return null;

	const tier = (user as unknown as { subscriptionTier?: string })
		.subscriptionTier;

	if (tier !== "admin") return null;

	return session.user.id;
}

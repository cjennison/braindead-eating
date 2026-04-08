import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [Google],
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	callbacks: {
		async signIn({ user, profile }) {
			await connectDB();

			const existingUser = await User.findOne({ email: user.email });

			if (!existingUser) {
				await User.create({
					email: user.email,
					name: user.name ?? profile?.name ?? "User",
					image: user.image ?? profile?.picture ?? "",
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
				});
			}

			return true;
		},
		async jwt({ token, user, trigger }) {
			if (user || trigger === "update") {
				await connectDB();
				const dbUser = await User.findOne({ email: token.email }).lean();
				if (dbUser) {
					token.userId = (
						dbUser as unknown as { _id: { toString(): string } }
					)._id.toString();
					token.onboardingComplete = (
						dbUser as unknown as { onboardingComplete: boolean }
					).onboardingComplete;
				}
			}
			return token;
		},
		async session({ session, token }) {
			if (token.userId) {
				session.user.id = token.userId as string;
				(
					session as unknown as {
						user: { onboardingComplete: boolean };
					}
				).user.onboardingComplete = token.onboardingComplete as boolean;
			}
			return session;
		},
	},
	pages: {
		signIn: "/auth/signin",
	},
});

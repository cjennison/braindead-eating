import { Anchor, Container, Stack, Text, Title } from "@mantine/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description:
		"How Brain Dead Eating handles your data. " +
		"We collect only what we need, never sell your data, " +
		"and you can delete everything at any time.",
};

const CONTACT_EMAIL = "privacy@braindeadeating.com";

export default function PrivacyPage() {
	return (
		<Container size={480} py="xl">
			<Anchor href="/" size="sm" c="dimmed" mb="md" display="block">
				Back to home
			</Anchor>

			<Title order={2} mb="xl" style={{ letterSpacing: "-0.02em" }}>
				Privacy Policy
			</Title>

			<Stack gap="lg">
				<Text c="dimmed" size="sm">
					Last updated: April 9, 2026
				</Text>

				<section>
					<Title order={4} mb="xs">
						What We Collect
					</Title>
					<Text size="md">
						When you sign in with Google, we store your name, email address, and
						profile picture. When you use the app, we store your food logs,
						weight logs, exercise logs, calorie targets, and preferences. We
						also track how many AI-powered food logs you make each day to
						enforce usage limits.
					</Text>
				</section>

				<section>
					<Title order={4} mb="xs">
						How We Use Your Data
					</Title>
					<Text size="md">
						Your data is used only to provide the calorie tracking service to
						you. We do not sell, share, or give your data to third parties for
						marketing. Food descriptions you enter are sent to OpenAI to
						estimate nutritional values. OpenAI processes this text but does not
						receive your name, email, or account information.
					</Text>
				</section>

				<section>
					<Title order={4} mb="xs">
						Cookies
					</Title>
					<Text size="md">
						We use a single authentication cookie to keep you signed in. We do
						not use tracking cookies, analytics cookies, or advertising cookies.
						No cookie consent banner is needed because we only use strictly
						necessary cookies.
					</Text>
				</section>

				<section>
					<Title order={4} mb="xs">
						Where Your Data Lives
					</Title>
					<Text size="md">
						Your data is stored in MongoDB Atlas. The application is hosted on
						Vercel. Both services process data in the United States.
					</Text>
				</section>

				<section>
					<Title order={4} mb="xs">
						Your Rights
					</Title>
					<Text size="md">
						You have the right to access, export, correct, and delete all of
						your personal data at any time. If you are logged in, you can do
						this from your profile page. If you cannot access your account,
						email {CONTACT_EMAIL} and we will process your request within 30
						days.
					</Text>
					<Stack gap="xs" mt="xs">
						<Text size="md" fw={600}>
							Right to Access
						</Text>
						<Text size="md">
							Download a copy of all your data from your profile page, or
							request it by email.
						</Text>

						<Text size="md" fw={600}>
							Right to Erasure
						</Text>
						<Text size="md">
							Delete your account and all associated data from your profile
							page, or request deletion by email. Deletion is permanent and
							immediate.
						</Text>

						<Text size="md" fw={600}>
							Right to Rectification
						</Text>
						<Text size="md">
							You can update your weight, goals, and preferences from your
							profile page. To correct other data, email us.
						</Text>

						<Text size="md" fw={600}>
							Right to Data Portability
						</Text>
						<Text size="md">
							Your data export is provided in JSON format, which is
							machine-readable and can be used with other services.
						</Text>
					</Stack>
				</section>

				<section>
					<Title order={4} mb="xs">
						Data Retention
					</Title>
					<Text size="md">
						We keep your data for as long as your account exists. When you
						delete your account, all of your data is permanently removed from
						our database immediately. We do not keep backups of deleted
						accounts.
					</Text>
				</section>

				<section>
					<Title order={4} mb="xs">
						Children
					</Title>
					<Text size="md">
						This service is not intended for anyone under 16. We do not
						knowingly collect data from children. If you believe a child has
						created an account, contact us and we will delete it.
					</Text>
				</section>

				<section>
					<Title order={4} mb="xs">
						Changes to This Policy
					</Title>
					<Text size="md">
						If we make changes, we will update this page. For significant
						changes, we will notify you in the app.
					</Text>
				</section>

				<section>
					<Title order={4} mb="xs">
						Contact
					</Title>
					<Text size="md">
						For any privacy questions or to exercise your rights without logging
						in, email {CONTACT_EMAIL}.
					</Text>
				</section>
			</Stack>
		</Container>
	);
}

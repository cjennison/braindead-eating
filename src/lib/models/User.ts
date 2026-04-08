import mongoose, { type Document, Schema } from "mongoose";
import type {
	DeficitMode,
	SubscriptionSource,
	SubscriptionTier,
	WeightUnit,
} from "@/types";

export interface IUser extends Document {
	email: string;
	name: string;
	image: string;
	currentWeight: number | null;
	goalWeight: number | null;
	deficitMode: DeficitMode | null;
	dailyCalorieTarget: number | null;
	unit: WeightUnit;
	timezone: string;
	onboardingComplete: boolean;
	subscriptionTier: SubscriptionTier;
	subscriptionExpiresAt: Date | null;
	subscriptionSource: SubscriptionSource;
	trialUsed: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<IUser>(
	{
		email: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		image: { type: String, default: "" },
		currentWeight: { type: Number, default: null },
		goalWeight: { type: Number, default: null },
		deficitMode: {
			type: String,
			enum: ["cruise", "locked-in", "beast", "maintaining", "custom", null],
			default: null,
		},
		dailyCalorieTarget: { type: Number, default: null },
		unit: {
			type: String,
			enum: ["lbs", "kg"],
			default: "lbs",
		},
		timezone: { type: String, default: "UTC" },
		onboardingComplete: { type: Boolean, default: false },
		subscriptionTier: {
			type: String,
			enum: ["free", "pro", "admin"],
			default: "free",
		},
		subscriptionExpiresAt: { type: Date, default: null },
		subscriptionSource: {
			type: String,
			enum: ["trial", "promo", "apple", "google", null],
			default: null,
		},
		trialUsed: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	},
);

export const User =
	mongoose.models.User || mongoose.model<IUser>("User", userSchema);

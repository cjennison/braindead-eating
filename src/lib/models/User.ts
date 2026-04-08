import mongoose, { type Document, Schema } from "mongoose";
import type { DeficitMode, WeightUnit } from "@/types";

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
	},
	{
		timestamps: true,
	},
);

export const User =
	mongoose.models.User || mongoose.model<IUser>("User", userSchema);

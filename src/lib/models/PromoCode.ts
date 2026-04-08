import mongoose, { type Document, Schema } from "mongoose";
import type { SubscriptionTier } from "@/types";

export interface IPromoCode extends Document {
	code: string;
	tier: Exclude<SubscriptionTier, "free">;
	durationDays: number | null;
	maxUses: number | null;
	currentUses: number;
	redeemedBy: mongoose.Types.ObjectId[];
	active: boolean;
	createdAt: Date;
}

const promoCodeSchema = new Schema<IPromoCode>(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true,
		},
		tier: {
			type: String,
			enum: ["pro", "admin"],
			required: true,
		},
		durationDays: { type: Number, default: null },
		maxUses: { type: Number, default: null },
		currentUses: { type: Number, default: 0 },
		redeemedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
		active: { type: Boolean, default: true },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	},
);

export const PromoCode =
	mongoose.models.PromoCode ||
	mongoose.model<IPromoCode>("PromoCode", promoCodeSchema);

import mongoose, { type Document, Schema } from "mongoose";

export interface IAiUsage extends Document {
	userId: mongoose.Types.ObjectId;
	date: string;
	count: number;
}

const aiUsageSchema = new Schema<IAiUsage>({
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	date: { type: String, required: true },
	count: { type: Number, default: 0 },
});

aiUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

export const AiUsage =
	mongoose.models.AiUsage || mongoose.model<IAiUsage>("AiUsage", aiUsageSchema);

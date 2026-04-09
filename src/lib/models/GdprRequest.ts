import mongoose, { type Document, Schema } from "mongoose";

export interface IGdprRequest extends Document {
	email: string;
	type: "export" | "delete";
	status: "pending" | "completed";
	createdAt: Date;
	completedAt: Date | null;
}

const gdprRequestSchema = new Schema<IGdprRequest>(
	{
		email: { type: String, required: true },
		type: {
			type: String,
			enum: ["export", "delete"],
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "completed"],
			default: "pending",
		},
		completedAt: { type: Date, default: null },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	},
);

gdprRequestSchema.index({ email: 1, createdAt: -1 });

export const GdprRequest =
	mongoose.models.GdprRequest ||
	mongoose.model<IGdprRequest>("GdprRequest", gdprRequestSchema);

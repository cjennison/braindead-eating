import mongoose, { type Document, Schema } from "mongoose";

export interface IWeightLog extends Document {
	userId: mongoose.Types.ObjectId;
	weight: number;
	date: string;
	createdAt: Date;
}

const weightLogSchema = new Schema<IWeightLog>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		weight: { type: Number, required: true },
		date: { type: String, required: true },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	},
);

weightLogSchema.index({ userId: 1, date: -1 });

export const WeightLog =
	mongoose.models.WeightLog ||
	mongoose.model<IWeightLog>("WeightLog", weightLogSchema);

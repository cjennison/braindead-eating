import mongoose, { type Document, Schema } from "mongoose";

export interface IExerciseLog extends Document {
	userId: mongoose.Types.ObjectId;
	date: string;
	caloriesBurned: number;
	createdAt: Date;
	updatedAt: Date;
}

const exerciseLogSchema = new Schema<IExerciseLog>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		caloriesBurned: { type: Number, required: true, default: 0 },
		date: { type: String, required: true },
	},
	{
		timestamps: true,
	},
);

exerciseLogSchema.index({ userId: 1, date: -1 });

export const ExerciseLog =
	mongoose.models.ExerciseLog ||
	mongoose.model<IExerciseLog>("ExerciseLog", exerciseLogSchema);

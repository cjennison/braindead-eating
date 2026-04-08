import mongoose, { type Document, Schema } from "mongoose";
import type { FoodItem } from "@/types";

export interface IFoodLog extends Document {
	userId: mongoose.Types.ObjectId;
	date: string;
	rawInput: string;
	items: FoodItem[];
	totalCalories: number;
	totalProtein_g: number;
	totalCarbs_g: number;
	totalFat_g: number;
	createdAt: Date;
}

const foodItemSchema = new Schema<FoodItem>(
	{
		name: { type: String, required: true },
		calories: { type: Number, required: true },
		protein_g: { type: Number, required: true },
		carbs_g: { type: Number, required: true },
		fat_g: { type: Number, required: true },
	},
	{ _id: false },
);

const foodLogSchema = new Schema<IFoodLog>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		date: { type: String, required: true, index: true },
		rawInput: { type: String, required: true },
		items: { type: [foodItemSchema], required: true },
		totalCalories: { type: Number, required: true },
		totalProtein_g: { type: Number, required: true },
		totalCarbs_g: { type: Number, required: true },
		totalFat_g: { type: Number, required: true },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	},
);

foodLogSchema.index({ userId: 1, date: 1 });

export const FoodLog =
	mongoose.models.FoodLog || mongoose.model<IFoodLog>("FoodLog", foodLogSchema);

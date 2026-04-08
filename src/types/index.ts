export interface FoodItem {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface FoodLogEntry {
  _id: string;
  userId: string;
  date: string;
  rawInput: string;
  items: FoodItem[];
  totalCalories: number;
  totalProtein_g: number;
  totalCarbs_g: number;
  totalFat_g: number;
  createdAt: string;
}

export interface WeightLogEntry {
  _id: string;
  userId: string;
  weight: number;
  date: string;
  createdAt: string;
}

export type DeficitMode =
  | "cruise"
  | "locked-in"
  | "beast"
  | "maintaining"
  | "custom";

export type WeightUnit = "lbs" | "kg";

export interface UserProfile {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface AIParsedResponse {
  items: FoodItem[];
  total: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
}

export interface AIErrorResponse {
  error: true;
  message: string;
}

export type AIResponse = AIParsedResponse | AIErrorResponse;

export interface DeficitModeOption {
  id: DeficitMode;
  label: string;
  subtitle: string;
  deficitPerDay: number;
  weeklyLoss: string;
}

export const DEFICIT_MODES: DeficitModeOption[] = [
  {
    id: "cruise",
    label: "Cruise Control",
    subtitle: "Slow and steady. You'll barely notice.",
    deficitPerDay: 250,
    weeklyLoss: "~0.5 lb/week",
  },
  {
    id: "locked-in",
    label: "Locked In",
    subtitle: "Real results. Real discipline.",
    deficitPerDay: 500,
    weeklyLoss: "~1 lb/week",
  },
  {
    id: "beast",
    label: "Beast Mode",
    subtitle: "Maximum effort. Not for the faint.",
    deficitPerDay: 750,
    weeklyLoss: "~1.5 lb/week",
  },
  {
    id: "maintaining",
    label: "Holding Steady",
    subtitle: "You're good where you are.",
    deficitPerDay: 0,
    weeklyLoss: "Maintenance",
  },
];

export const PLACEHOLDER_EXAMPLES = [
  "a bowl of cereal and OJ",
  "leftover pizza, 2 slices",
  "grande iced coffee with oat milk",
  "2 beers and some chips",
  "chicken sandwich and a coke",
  "3 glasses of red wine",
  "protein shake and a banana",
];

const CALORIE_ROUND_TO = 5;
const CLOSE_THRESHOLD = 0.15;
const LBS_PER_KG = 2.20462;

export const AI_DAILY_LIMIT = 5;

export const MIN_CALORIES_PER_DAY = 1200;
export const MAX_CALORIES_PER_DAY = 5000;

export function roundCalories(cal: number): number {
  return Math.round(cal / CALORIE_ROUND_TO) * CALORIE_ROUND_TO;
}

export function roundGrams(g: number): number {
  return Math.round(g);
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function getCalorieStatus(
  remaining: number,
  target: number,
): "on-track" | "close" | "over" {
  if (remaining <= 0) return "over";
  if (remaining <= target * CLOSE_THRESHOLD) return "close";
  return "on-track";
}

/**
 * Mifflin-St Jeor BMR estimate.
 * Simplified: uses weight only (no height/age/sex).
 * Returns a rough maintenance estimate in calories.
 * Formula: 10 * weight_kg + 1200 (simplified sedentary estimate)
 */
export function estimateMaintenanceCalories(
  weightLbs: number,
  unit: WeightUnit = "lbs",
): number {
  const weightKg = unit === "lbs" ? weightLbs * 0.453592 : weightLbs;
  const maintenance = 10 * weightKg + 1200;
  return roundCalories(maintenance);
}

export function calculateCalorieTarget(
  weightLbs: number,
  deficitPerDay: number,
  unit: WeightUnit = "lbs",
): number {
  const maintenance = estimateMaintenanceCalories(weightLbs, unit);
  const target = maintenance - deficitPerDay;
  return Math.max(roundCalories(target), MIN_CALORIES_PER_DAY);
}

export function getRandomPlaceholder(): string {
  const index = Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length);
  return PLACEHOLDER_EXAMPLES[index];
}

/** Convert stored weight (always lbs) to display unit. */
export function toDisplayWeight(storedLbs: number, unit: WeightUnit): number {
  if (unit === "kg") {
    return Math.round((storedLbs / LBS_PER_KG) * 10) / 10;
  }
  return Math.round(storedLbs * 10) / 10;
}

/** Convert user input (in their preferred unit) to lbs for storage. */
export function toStoredWeight(inputValue: number, unit: WeightUnit): number {
  if (unit === "kg") {
    return Math.round(inputValue * LBS_PER_KG * 10) / 10;
  }
  return inputValue;
}

/** Weekly weight loss label adapted to the user's unit. */
export function getWeeklyLossLabel(
  deficitPerDay: number,
  unit: WeightUnit,
): string {
  if (deficitPerDay === 0) return "Maintenance";
  const lbsPerWeek = (deficitPerDay * 7) / 3500;
  if (unit === "kg") {
    const kgPerWeek = lbsPerWeek / LBS_PER_KG;
    return `~${kgPerWeek.toFixed(1)} kg/week`;
  }
  return `~${lbsPerWeek.toFixed(1)} lb/week`;
}

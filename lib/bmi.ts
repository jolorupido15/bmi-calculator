export type BMICategory = "underweight" | "normal" | "overweight" | "obese";

export interface BMIResult {
  bmi: number;
  category: BMICategory;
  message: string;
  gaugePercent: number;
}

export function calculateBMI(weightKg: number, heightM: number): BMIResult {
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  const category = getCategory(bmi);
  return { bmi, category, message: getMessage(category), gaugePercent: getGauge(bmi) };
}

export function calculateBMIImperial(weightLbs: number, heightIn: number): BMIResult {
  const bmi = Math.round((703 * weightLbs / (heightIn * heightIn)) * 10) / 10;
  const category = getCategory(bmi);
  return { bmi, category, message: getMessage(category), gaugePercent: getGauge(bmi) };
}

function getCategory(bmi: number): BMICategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

function getMessage(cat: BMICategory): string {
  const map = {
    underweight: "You are below the healthy weight range. Consider consulting a healthcare provider.",
    normal: "You are within the healthy weight range. Keep it up!",
    overweight: "You are above the healthy weight range. Small lifestyle changes can help.",
    obese: "Your BMI indicates obesity. A healthcare provider can help you set goals.",
  };
  return map[cat];
}

function getGauge(bmi: number): number {
  const min = 15, max = 40;
  return Math.min(100, Math.max(0, ((bmi - min) / (max - min)) * 100));
}
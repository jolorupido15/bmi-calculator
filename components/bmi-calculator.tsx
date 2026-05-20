"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { calculateBMI, calculateBMIImperial, type BMIResult } from "@/lib/bmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  unit: z.enum(["metric", "imperial"]),
  weightKg: z.string().optional(),
  heightCm: z.string().optional(),
  weightLbs: z.string().optional(),
  heightFt: z.string().optional(),
  heightIn: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.unit === "metric") {
    if (!data.weightKg) ctx.addIssue({ path: ["weightKg"], code: "custom", message: "Weight is required" });
    if (!data.heightCm) ctx.addIssue({ path: ["heightCm"], code: "custom", message: "Height is required" });
    if (data.weightKg && Number(data.weightKg) <= 0) ctx.addIssue({ path: ["weightKg"], code: "custom", message: "Must be greater than 0" });
    if (data.heightCm && Number(data.heightCm) <= 0) ctx.addIssue({ path: ["heightCm"], code: "custom", message: "Must be greater than 0" });
  } else {
    if (!data.weightLbs) ctx.addIssue({ path: ["weightLbs"], code: "custom", message: "Weight is required" });
    if (!data.heightFt) ctx.addIssue({ path: ["heightFt"], code: "custom", message: "Feet is required" });
    if (data.weightLbs && Number(data.weightLbs) <= 0) ctx.addIssue({ path: ["weightLbs"], code: "custom", message: "Must be greater than 0" });
    if (data.heightFt && Number(data.heightFt) <= 0) ctx.addIssue({ path: ["heightFt"], code: "custom", message: "Must be greater than 0" });
  }
});

type FormValues = z.infer<typeof schema>;

const categoryStyles: Record<string, { label: string; text: string }> = {
  underweight: { label: "Underweight", text: "text-blue-500" },
  normal: { label: "Normal weight", text: "text-green-500" },
  overweight: { label: "Overweight", text: "text-amber-500" },
  obese: { label: "Obese", text: "text-red-500" },
};

export function BMICalculator() {
  const [result, setResult] = useState<BMIResult | null>(null);
  const [gaugePos, setGaugePos] = useState(0);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      unit: "metric",
      weightKg: "",
      heightCm: "",
      weightLbs: "",
      heightFt: "",
      heightIn: "",
    },
  });

useEffect(() => {
    if (result) {
      console.log("gauge percent:", result.gaugePercent);
      setGaugePos(0);
      const t = setTimeout(() => setGaugePos(result.gaugePercent), 100);
      return () => clearTimeout(t);
    }
  }, [result]);

  function onSubmit(values: FormValues) {
    let res: BMIResult;
    if (values.unit === "metric") {
      const weightKg = parseFloat(values.weightKg!);
      const heightM = parseFloat(values.heightCm!) / 100;
      res = calculateBMI(weightKg, heightM);
    } else {
      const weightLbs = parseFloat(values.weightLbs!);
      const heightIn = parseFloat(values.heightFt!) * 12 + parseFloat(values.heightIn || "0");
      res = calculateBMIImperial(weightLbs, heightIn);
    }
    setResult(res);
  }

  function handleReset() {
    form.reset({ unit });
    setResult(null);
    setGaugePos(0);
  }

  function handleUnitChange(val: string) {
    const u = val as "metric" | "imperial";
    setUnit(u);
    form.setValue("unit", u);
    form.clearErrors();
    setResult(null);
  }

  const cat = result ? categoryStyles[result.category] : null;

  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader className="text-center pb-2 pt-8">
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l3-3 3 3 3-6 3 9 3-6" />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold">BMI Calculator</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Enter your measurements to check your body mass index.</p>
      </CardHeader>

      <CardContent className="space-y-5 pb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="metric" onValueChange={handleUnitChange} className="w-full">
              <TabsList className="w-full rounded-full bg-muted p-1">
                <TabsTrigger value="metric" className="rounded-full flex-1 data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-muted-foreground">
                  Metric (kg/cm)
                </TabsTrigger>
                <TabsTrigger value="imperial" className="rounded-full flex-1 data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-muted-foreground">
                  Imperial (lb/ft)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="metric" className="space-y-4 mt-4">
                <FormField control={form.control as any} name="weightKg" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 70" step="0.1" className="rounded-xl h-12" aria-invalid={!!form.formState.errors.weightKg} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control as any} name="heightCm" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 175" step="0.1" className="rounded-xl h-12" aria-invalid={!!form.formState.errors.heightCm} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </TabsContent>

              <TabsContent value="imperial" className="space-y-4 mt-4">
                <FormField control={form.control as any} name="weightLbs" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Weight (lbs)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 154" className="rounded-xl h-12" aria-invalid={!!form.formState.errors.weightLbs} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control as any} name="heightFt" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Feet</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 5" className="rounded-xl h-12" aria-invalid={!!form.formState.errors.heightFt} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control as any} name="heightIn" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Inches</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 9" className="rounded-xl h-12" aria-invalid={!!form.formState.errors.heightIn} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-1">
  <Button type="submit" className="flex-1 h-12 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-base">
    Calculate BMI
  </Button>
</div>
          </form>
        </Form>

        {result && cat && (
  <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
    <Separator />
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your BMI</p>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${cat.text}`}>
          {cat.label}
        </span>
      </div>
      <p className="text-6xl font-mono font-bold">{result.bmi}</p>
    </div>

            <div className="space-y-2">
              <div className="relative h-4">
  <div className="absolute inset-0 rounded-full overflow-hidden flex">
    <div className="flex-1 bg-blue-500" />
    <div className="flex-1 bg-green-500" />
    <div className="flex-1 bg-amber-500" />
    <div className="flex-1 bg-red-500" />
  </div>
  <div
    className="absolute w-4 h-4 bg-white border-2 border-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-md top-1/2"
    style={{ left: `${gaugePos}%`, transition: "left 1s ease-out" }}
  />
</div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>

           <p className="text-sm text-center text-muted-foreground">{result.message}</p>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl font-semibold"
              onClick={handleReset}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Calculator
            </Button>
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">BMI Categories</p>
          <div className="space-y-2">
            {[
              { label: "Underweight", range: "< 18.5", text: "text-blue-500" },
              { label: "Normal weight", range: "18.5 - 24.9", text: "text-green-500" },
              { label: "Overweight", range: "25 - 29.9", text: "text-amber-500" },
              { label: "Obese", range: ">= 30", text: "text-red-500" },
            ].map((c) => (
              <div key={c.label} className="flex items-center justify-between text-sm">
                <span className={`font-medium ${c.text}`}>{c.label}</span>
                <span className="text-muted-foreground text-xs font-mono">{c.range}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
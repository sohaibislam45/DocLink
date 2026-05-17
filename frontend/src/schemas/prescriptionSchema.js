import * as z from "zod";

export const medicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().optional().or(z.literal("")),
});

export const prescriptionSchema = z.object({
  patientName: z.string().min(2, "Patient name must be at least 2 characters"),
  age: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  diagnosis: z.string().min(2, "Diagnosis is required"),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional().or(z.literal("")),
  medicines: z.array(medicineSchema).min(1, "At least one medicine is required"),
});

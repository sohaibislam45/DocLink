import * as z from "zod";

export const medicineSchema = z.object({
  name: z.string()
    .min(1, "Medicine name is required")
    .max(100, "Medicine name is too long")
    .regex(/^[a-zA-Z0-9\s\-().]+$/, "Medicine name contains invalid characters"),
  dosage: z.string()
    .min(1, "Dosage is required")
    .max(50, "Dosage value is too long"),
  frequency: z.string()
    .min(1, "Frequency is required"),
  duration: z.string().max(50, "Duration is too long").optional().or(z.literal("")),
});

export const prescriptionSchema = z.object({
  patientName: z.string()
    .min(2, "Patient name must be at least 2 characters")
    .max(100, "Patient name is too long")
    .regex(/^[a-zA-Z\s\-'.]+$/, "Patient name can only contain letters, spaces, and hyphens"),
  age: z.union([
    z.string().regex(/^\d{0,3}$/, "Age must be a valid number (max 3 digits)"),
    z.literal(""),
  ]).optional(),
  gender: z.string().optional().or(z.literal("")),
  weight: z.union([
    z.string().regex(/^\d{0,3}$/, "Weight must be a positive number (max 3 digits)"),
    z.literal(""),
  ]).optional(),
  diagnosis: z.string()
    .min(2, "Diagnosis is required")
    .max(300, "Diagnosis is too long"),
  notes: z.string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  medicines: z.array(medicineSchema).min(1, "At least one medicine is required"),
});

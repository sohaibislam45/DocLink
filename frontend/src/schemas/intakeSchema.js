import * as z from "zod";

export const connectSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  age: z.coerce.number({ invalid_type_error: "Please enter a valid age" })
    .int()
    .min(1, "Age must be at least 1")
    .max(120, "Age must be less than 120"),
  weight: z.coerce.number({ invalid_type_error: "Please enter a valid weight" })
    .min(1, "Weight must be at least 1 kg")
    .max(500, "Weight must be less than 500 kg"),
  gender: z.string().min(1, "Please select a gender"),
  reason: z.string()
    .min(5, "Reason must be at least 5 characters")
    .max(300, "Reason must be less than 300 characters"),
  paymentOption: z.string().min(1, "Please select a payment option"),
});

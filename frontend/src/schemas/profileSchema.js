import * as z from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  allergies: z.string().optional(),
});

export const doctorProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  specialty: z.string().min(1, "Specialty is required"),
  experience: z.coerce.number().min(0, "Experience cannot be negative"),
  fee: z.coerce.number().min(0, "Fee cannot be negative"),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  education: z.string().min(2, "Education and qualifications are required"),
});

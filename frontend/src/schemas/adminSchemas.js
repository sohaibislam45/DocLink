import { z } from "zod";

export const adminDoctorSchema = z.object({
  name:       z.string().min(2, "Name is required"),
  specialty:  z.string().min(1, "Specialty is required"),
  experience: z.coerce.number().min(0, "Experience required"),
  fee:        z.coerce.number().min(1, "Fee required"),
  bio:        z.string().optional(),
  gender:     z.enum(["male", "female"]),
  education:  z.string().min(1, "Education & Qualifications is required"),
  experienceDetails: z.string().min(1, "Professional Experience is required"),
  rating:     z.coerce.number().min(0).max(5).default(0),
  isOnline:   z.boolean().optional(),
  email:      z.string().email("Invalid email address"),
  password:   z.string().optional().or(z.literal("")),
});

export const adminPatientSchema = z.object({
  name:      z.string().min(2, "Name required"),
  phone:     z.string().optional(),
  dob:       z.string().optional(),
  gender:    z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
});

export const settingsSchema = z.object({
  platformFee:         z.coerce.number().min(0, "Fee must be 0 or more").max(500),
  maintenanceMode:     z.boolean(),
  announcementBanner:  z.string().max(200, "Max 200 characters").optional(),
});

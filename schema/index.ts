import { z } from "zod";

export const formSchema = z.object({
  // Client Information
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  phoneNumber: z
    .string()
    .min(10, {
      message: "Please enter a valid phone number.",
    })
    .regex(/^\+?[\d\s\-\(\)]{10,}$/, {
      message: "Please enter a valid phone number format.",
    }),
  emailAddress: z.string().email({
    message: "Please enter a valid email address.",
  }),
  propertyType: z.string().min(1, {
    message: "Please select a property type.",
  }),
  serviceAddress: z.string().min(10, {
    message:
      "Please provide a complete address including barangay, city, and landmarks.",
  }),

  // Service Details
  serviceType: z.string().min(1, {
    message: "Please select a service type.",
  }),
  specificService: z.string().min(1, {
    message: "Please select a specific service.",
  }),
  urgencyLevel: z.string().min(1, {
    message: "Please select an urgency level.",
  }),
  budgetRange: z.string().optional(),
  problemDescription: z.string().min(10, {
    message: "Please provide a detailed problem description.",
  }),

  // Preferred Schedule
  preferredDate: z.date({
    error: "Please select a preferred date.",
  }),
  preferredTime: z.string().min(1, {
    message: "Please select a preferred time.",
  }),
  alternativeDate: z.date().optional(),
  alternativeTime: z.string().optional(),

  // Additional Information
  accessInstructions: z.string().optional(),
  specialRequests: z.string().optional(),
  preferredContactMethod: z.string().min(1, {
    message: "Please select a preferred contact method.",
  }),
  bestTimeToCall: z.string().min(1, {
    message: "Please select the best time to call.",
  }),
});

export type FormData = z.infer<typeof formSchema>;
export type FormFieldName = keyof FormData;

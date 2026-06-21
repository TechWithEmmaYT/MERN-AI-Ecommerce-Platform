import { z } from "zod";

export const addressSchema = z.object({
  recipientName: z.string().trim().min(1, "Receiver name is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  street: z.string().trim().min(1, "Street address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().min(1, "Country is required"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

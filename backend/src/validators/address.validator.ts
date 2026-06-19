import { z } from "zod";

export const createAddressSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  phone: z.string().min(1, "Phone is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;

import { z } from "zod";
import type { AddressType } from "@/types/auth.type";

export const addressSchema = z.object({
  name: z.string().trim().min(1, "Receiver name is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  street: z.string().trim().min(1, "Street address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().min(1, "Country is required"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const starterAddresses: AddressType[] = [
  {
    _id: "starter-address-1",
    userId: "starter-user",
    recipientName: "Amina Yusuf",
    phone: "+1 415 555 0198",
    street: "214 Green Market Avenue",
    city: "San Francisco",
    state: "California",
    postalCode: "94105",
    country: "United States",
    isDefault: true,
  },
  {
    _id: "starter-address-2",
    userId: "starter-user",
    recipientName: "Daniel Cole",
    phone: "+1 415 555 0134",
    street: "88 Ocean View Road",
    city: "Oakland",
    state: "California",
    postalCode: "94607",
    country: "United States",
    isDefault: false,
  },
];

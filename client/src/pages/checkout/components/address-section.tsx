import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  addressSchema,
  type AddressFormValues,
} from "@/constants/address";
import type { AddressType } from "@/types/auth.type";
import { Skeleton } from "@/components/ui/skeleton";

type AddressSectionProps = {
  addresses: AddressType[];
  selectedAddressId: string;
  onSelectAddress: (addressId: string) => void;
  onAddAddress: (values: AddressFormValues) => void;
  isAdding: boolean;
  isLoading?: boolean;
};

const AddressSection = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddAddress,
  isAdding,
  isLoading,
}: AddressSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
        recipientName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
    },
  });

  const handleSubmit = (values: AddressFormValues) => {
    onAddAddress(values);
    form.reset();
    setIsOpen(false);
  };

  return (
    <div className="flex h-[360px] min-h-0 flex-col gap-4">
      {isLoading ? (
        <div className="min-h-0 flex-1 overflow-y-auto pr-2 space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex gap-3 rounded-xl border border-border bg-background p-4 animate-pulse">
              <Skeleton className="size-4 rounded-full mt-1 shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
          <RadioGroup value={selectedAddressId} onValueChange={onSelectAddress}>
            {addresses.map((address) => {
              const isSelected = selectedAddressId === address._id;

              return (
                <Label
                  key={address._id}
                  htmlFor={address._id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 transition-colors",
                    isSelected && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem id={address._id} value={address._id} className="mt-1" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1 text-left font-normal">
                    <span className="flex items-center gap-2 font-medium text-foreground text-sm">
                      <MapPin className="size-4 text-primary" />
                      {address.street}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {address.recipientName} · {address.phone}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {address.city}, {address.state}, {address.postalCode}, {address.country}
                    </span>
                  </span>
                </Label>
              );
            })}
          </RadioGroup>
        </div>
      ) : (
        <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-border bg-background p-6 text-center">
          <p className="max-w-sm text-sm text-muted-foreground">
            Add a delivery address before choosing a payment method.
          </p>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="lg" type="button" variant="default" className="w-fit">
            <Plus data-icon="inline-start" />
            Add new address
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Add delivery address</DialogTitle>
            <DialogDescription className="-mt-2">
              Save a delivery address for this checkout.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receiver name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 555 010 8842" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street address</FormLabel>
                    <FormControl>
                      <Input placeholder="214 Green Market Avenue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="California" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="94105" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? "Saving..." : "Save address"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressSection;

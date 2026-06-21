import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  addressSchema,
  type AddressFormValues,
} from "@/constants/address";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAddressesQueryFn, createAddressMutationFn } from "@/lib/api";
import { toast } from "sonner";

const AccountAddressesPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddressesQueryFn,
  });
  
  const addresses = data?.addresses || [];

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

  const createAddressMutation = useMutation({
    mutationFn: createAddressMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added successfully");
      form.reset();
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add address");
    },
  });

 

  const handleSubmit = (values: AddressFormValues) => {
    createAddressMutation.mutate(values);
  };

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 py-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Addresses</h1>
          <p className="text-sm text-muted-foreground">
            Manage delivery addresses for faster checkout.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus data-icon="inline-start" />
              Add new address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-lg">Add delivery address</DialogTitle>
              <DialogDescription className="-mt-2">
                Save a delivery address to use during checkout.
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
                  <Button size="lg" className="px-4" type="submit" disabled={createAddressMutation.isPending}>
                    {createAddressMutation.isPending ? "Saving..." : "Save address"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="bg-background shadow-xs">
              <CardContent className="flex h-full flex-col gap-4 p-4">
                <div className="flex flex-1 items-start gap-3">
                  <Skeleton className="size-9 shrink-0 rounded-lg" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => {
            const isSelected = address.isDefault;

            return (
              <Card
                key={address._id}
                className={cn(
                  "bg-background shadow-xs",
                  isSelected && "ring-1 ring-primary"
                )}
              >
                <CardContent className="flex h-full flex-col gap-4 p-4">
                  <div className="flex flex-1 items-start gap-3 text-left">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-medium text-foreground">
                        {address.street}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {address.recipientName} - {address.phone}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {address.city}, {address.state}, {address.postalCode}, {address.country}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      {isSelected ? "Default delivery address" : "Saved address"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty className="border border-border">
          <EmptyMedia variant="icon">
            <MapPin />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No addresses saved</EmptyTitle>
            <EmptyDescription>
              Add a delivery address to make checkout faster.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};

export default AccountAddressesPage;

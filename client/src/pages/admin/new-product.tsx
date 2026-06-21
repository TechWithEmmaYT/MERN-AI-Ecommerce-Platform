import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllCategoriesQueryFn, createProductMutationFn, generateProductAiMutationFn } from "@/lib/api";
import { calculateSalePrice } from "@/lib/utils";
import ProductImageUploader from "./components/product-image-uploader";

const productFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(160),
  description: z.string().trim().max(5000),
  originalPrice: z.number().min(0, "Price must be 0 or more"),
  discountPercent: z.number().min(0).max(100),
  discountLabel: z.string().trim().max(120),
  unit: z.string().trim().min(1).max(60),
  stockCount: z.number().int().min(0),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AdminNewProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategoriesQueryFn,
  });

  const categories = categoriesData?.categories || [];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      categoryId: "",
      name: "",
      description: "",
      originalPrice: 0,
      discountPercent: 0,
      discountLabel: "",
      unit: "piece",
      stockCount: 0,
      isActive: true,
    },
  });

  const originalPrice = form.watch("originalPrice");
  const discountPercent = form.watch("discountPercent");
  const salePrice = calculateSalePrice(originalPrice, discountPercent);

  const createMutation = useMutation({
    mutationFn: createProductMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product created successfully");
      navigate("/admin/products");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create product");
    },
  });

  const aiMutation = useMutation({
    mutationFn: generateProductAiMutationFn,
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "AI generation failed");
    },
  });

  const handleRephraseTitle = () => {
    const name = form.getValues("name");
    if (!name.trim()) return;
    const unit = form.getValues("unit");
    aiMutation.mutate(
      { action: "rephrase-title", title: name, unit },
      { onSuccess: (data) => form.setValue("name", data.result) }
    );
  };

  const handleGenerateDesc = () => {
    const name = form.getValues("name");
    if (!name.trim()) return;
    aiMutation.mutate(
      { action: "generate-desc", title: name },
      { onSuccess: (data) => form.setValue("description", data.result) }
    );
  };

  const onSubmit = (values: ProductFormValues) => {
    setImageError(null);
    if (images.length === 0) {
      setImageError("At least one image is required");
      return;
    }
    createMutation.mutate({
      ...values,
      images,
      discountLabel: values.discountLabel || "",
    });
  };

  if (categoriesLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Product</h2>
          <p className="text-muted-foreground">Add a new product to your store catalog.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              <div className="space-y-4 rounded-xl border bg-card p-6">
                <h3 className="text-sm font-medium">Basic Information</h3>

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Product Name</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                         className="gap-2 bg-linear-to-r from-purple-500 from-50%  to-blue-500 text-white"
                          disabled={!field.value.trim() || aiMutation.isPending}
                          onClick={handleRephraseTitle}
                        >
                          {aiMutation.isPending && aiMutation.variables?.action === "rephrase-title"  ? (
                            <Spinner  />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          Rephrase
                        </Button>
                      </div>
                      <FormControl>
                        <Input placeholder="e.g. Organic Whole Milk" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Description</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                            className="gap-2 bg-linear-to-r from-purple-500 from-50%  to-blue-500 text-white"
                          disabled={!form.watch("name").trim() || aiMutation.isPending}
                          onClick={handleGenerateDesc}
                        >
                          {aiMutation.isPending && aiMutation.variables?.action === "generate-desc"  ? (
                            <Spinner  />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          Generate
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Brief product description..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 rounded-xl border bg-card p-6">
                <h3 className="text-sm font-medium">Pricing & Discount</h3>

                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <fieldset
                  className="space-y-4 rounded-lg border p-4"
                  disabled={originalPrice <= 0}
                >
                  <FormField
                    control={form.control}
                    name="discountPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percent (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Label</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 20% OFF" {...field} />
                        </FormControl>
                        <FormDescription>Optional display label for the discount badge.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {discountPercent > 0 && originalPrice > 0 && (
                    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Sale price:</span>
                      <span className="font-semibold text-foreground">${salePrice.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">
                        ({discountPercent}% off ${originalPrice.toFixed(2)})
                      </span>
                    </div>
                  )}
                </fieldset>
              </div>

              <div className="space-y-4 rounded-xl border bg-card p-6">
                <h3 className="text-sm font-medium">Inventory & Settings</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="piece" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stockCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md py-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Product will be visible in the store.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <ProductImageUploader images={images} onImagesChange={setImages} error={imageError} />

              <Button type="submit" className="w-full" size="lg" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

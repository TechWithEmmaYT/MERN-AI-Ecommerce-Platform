import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginMutationFn, registerMutationFn } from "@/lib/api";
import type { LoginType, RegisterType } from "@/types/auth.type";
import Logo from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().trim().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().trim().min(1, "Password is required"),
});

export const AuthDialog = () => {
  const { isAuthOpen, closeAuth, view, setView } = useAuth();
  const queryClient = useQueryClient();

  const fetchCart = useCart((state) => state.fetchCart);

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: loginMutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      await fetchCart();
      toast.success("Successfully logged in!");
      closeAuth();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to login. Try again."
      );
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: registerMutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      await fetchCart();
      toast.success("Successfully registered!");
      closeAuth();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create account. Try again."
      );
    },
  });

  // Forms Setup
  const loginForm = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onLoginSubmit = (values: LoginType) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterType) => {
    registerMutation.mutate(values);
  };

  return (
    <Dialog open={isAuthOpen} onOpenChange={(open) => !open && closeAuth()}>
      <DialogContent key={view} className="sm:max-w-md py-8 px-8">
        <DialogHeader className="flex flex-col items-center justify-center gap-1">
          <Logo />
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {view === "login" ? "Sign in to your account" : "Create your account"}
          </DialogTitle>
        </DialogHeader>

        {view === "login" ? (
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-4 py-2"
            >
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full bg-green-light! text-white"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("register")}
                  className="font-medium text-foreground underline underline-offset-4 cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </form>
          </Form>
        ) : (
          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-4 py-2"
            >
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full bg-green-light! text-white"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Create account"}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="font-medium text-foreground underline underline-offset-4 cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

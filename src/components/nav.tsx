import CartButton from "@/components/cart-button";
import Logo from "@/components/logo";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { logoutMutationFn } from "@/lib/api";
import { PUBLIC_ROUTES } from "@/routes/route";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, LogOut, MapPin, MessageSquareText, Package, Search, UserRound } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { useUser } from "@/hooks/use-user";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

import { toast } from "sonner";

const Nav = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { data: user } = useUser();
  const { openAuth } = useAuth();

  const isAdmin = user?.isAdmin;
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const resetCart = useCart((state) => state.resetCart);

  const logoutMutation = useMutation({
    mutationFn: logoutMutationFn,
    onSuccess: async () => {
      queryClient.setQueryData(["current-user"], null);
      queryClient.removeQueries({ queryKey: ["current-user"] });
      resetCart();
      toast.success("Successfully logged out");
      navigate(PUBLIC_ROUTES.HOME);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to log out");
    }
  });

  const navigateToSearch = (value: string) => {
    const query = value.trim();
    setSearch(query);
    navigate(
      query
        ? `${PUBLIC_ROUTES.SEARCH_RESULTS}?q=${encodeURIComponent(query)}`
        : PUBLIC_ROUTES.SEARCH_RESULTS
    );
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch(search);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex h-16 w-full max-w-[1450px] mx-auto items-center gap-4 px-4">
        <Logo className="shrink-0 lg:mr-10" />

        <form onSubmit={handleSearch} className="min-w-0 flex-1">
          <InputGroup className="mx-auto h-11 w-full max-w-6xl rounded-full border border-black/70 bg-background px-2">
            <InputGroupAddon align="inline-start" className="pl-2 pr-1">
              <Search className="size-5" />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, and recipes"
              className="h-10 text-base font-medium"
              type="search"
            />
          </InputGroup>
        </form>

        <ModeToggle />
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="hidden shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-foreground transition hover:bg-accent md:flex"
              >
                <Avatar size="sm">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <span className="leading-tight">
                  <span className="block text-[12px] font-medium">
                    Welcome back
                  </span>
                  <span className="block max-w-28 truncate text-sm font-bold">
                    {user.name}
                  </span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-59 py-4">
              <DropdownMenuLabel>
                <span className="block truncate text-foreground">{user.name}</span>
                <span className="block truncate font-normal">{user.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="space-y-2">
                <DropdownMenuItem asChild>
                  <Link to="/orders">
                    <Package />
                    Order history
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/addresses">
                    <MapPin />
                    Addresses
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/reviews">
                    <MessageSquareText />
                    Ratings & reviews
                  </Link>
                </DropdownMenuItem>
                {isAdmin ? (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <LayoutDashboard />
                      Admin portal
                    </Link>
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="hidden shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-foreground transition hover:bg-accent md:flex"
          >
            <UserRound className="size-7 stroke-[2.3]" />
            <span className="leading-tight text-left">
              <span className="block text-[12px] font-medium">Welcome</span>
              <span className="block text-sm font-bold">
                Sign in / Register
              </span>
            </span>
          </button>
        )}

        <CartButton />
      </div>
    </header>
  );
};

export default Nav;

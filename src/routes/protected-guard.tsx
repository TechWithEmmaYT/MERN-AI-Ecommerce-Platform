import Logo from "@/components/logo";
import { Spinner } from "@/components/ui/spinner";
//import { useUser } from "@/hooks/use-user";
import { Navigate, Outlet } from "react-router-dom";
import { PUBLIC_ROUTES } from "./route";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const ProtectedGuard = () => {
  // const { data, isLoading } = useUser();
  const openAuth = useAuth((state) => state.openAuth);

  const isLoading = false;
  const data = {name:"John"}


  useEffect(() => {
    if (!isLoading && !data) {
      openAuth("login");
    }
  }, [data, isLoading, openAuth]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Logo />
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!data) {
    return <Navigate to={PUBLIC_ROUTES.HOME} replace />;
  }

  return <Outlet />;
};

export default ProtectedGuard;

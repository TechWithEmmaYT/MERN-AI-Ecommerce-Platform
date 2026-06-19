import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  ScrollRestoration,
  Outlet,
} from "react-router-dom";
import AppLayout from "@/layouts/app-layout";
import AccountLayout from "@/layouts/account-layout";
import AdminLayout from "@/layouts/admin-layout";
import NotFoundPage from "@/pages/not-found";
import { protectedRoutesPaths, publicRoutesPaths, adminRoutesPaths } from "./route";
import ProtectedGuard from "./protected-guard";

const RootLayout = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
);

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route element={<AppLayout />}>
        {publicRoutesPaths.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}

        <Route element={<ProtectedGuard />}>
          {protectedRoutesPaths
            .filter(({ account }) => !account)
            .map(({ path, element: Element }) => (
              <Route key={path} path={path} element={<Element />} />
            ))}

          <Route element={<AccountLayout />}>
            {protectedRoutesPaths
              .filter(({ account }) => account)
              .map(({ path, element: Element }) => (
                <Route key={path} path={path} element={<Element />} />
              ))}
          </Route>
        </Route>
      </Route>

      {/* Admin Protected Routes with Admin Sidebar Layout */}
      <Route element={<ProtectedGuard />}>
        <Route element={<AdminLayout />}>
          {adminRoutesPaths.map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  ),
);


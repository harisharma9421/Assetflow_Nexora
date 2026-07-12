import { redirect } from "next/navigation";

/**
 * Root page — redirects to login.
 * Once middleware-based auth guard is in place,
 * authenticated users will be redirected to /dashboard automatically.
 */
export default function RootPage() {
  redirect("/login");
}

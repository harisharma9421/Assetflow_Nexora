import { redirect } from "next/navigation";

/**
 * Root page — redirects authenticated users to dashboard,
 * unauthenticated users to login.
 * The actual auth check will be handled by middleware later.
 */
export default function RootPage() {
  redirect("/dashboard");
}

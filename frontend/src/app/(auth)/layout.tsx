/**
 * Auth route group layout — minimal pass-through.
 * Each page uses AuthPageWrapper for the two-column layout.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

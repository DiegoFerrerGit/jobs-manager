import { getCurrentUser } from "@/lib/auth";
import AppLayoutClient from "@/components/AppLayoutClient";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <AppLayoutClient user={user}>
      {children}
    </AppLayoutClient>
  );
}

// components/AuthWrapper.tsx
import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/context/auth-context";
export default async function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get initial user data on the server
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  const user = session?.user;

  return (
    <AuthProvider initialUser={user} initialSession={session}>
      {children}
    </AuthProvider>
  );
}

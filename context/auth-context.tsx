"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Session, AuthError } from "@supabase/supabase-js";
// import { useRouter } from "next/navigation";
// const router = useRouter();
interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: "donor" | "ngo" | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    data: { user: User | null; session: Session | null };
    error: AuthError | null;
  }>;
  signOut: () => Promise<{ error?: string }>;
  refreshUserType: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  initialUser = null,
  initialSession = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialSession?: Session | null;
}) => {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialUser);
  const [userType, setUserType] = useState<"donor" | "ngo" | null>(null);
  const [loading, setLoading] = useState<boolean>(!initialUser);
  const supabase = createClient();

  useEffect(() => {
    // Only get user if we don't have initial data
    if (!initialUser) {
      const getUser = async () => {
        try {
          // ✅ Use getUser() instead of getSession() for security
          const {
            data: { user: authUser },
            error,
          } = await supabase.auth.getUser();

          if (error || !authUser) {
            setSession(null);
            setUser(null);
            setUserType(null);
            setLoading(false);
            return;
          }

          // Get the session after confirming user is authentic
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();

          setUser(authUser);
          setSession(currentSession); // ✅ Fixed: was setting session instead of initialSession
          await checkUserType(authUser);
          setLoading(false);
        } catch (error) {
          console.error("Error getting user:", error);
          setLoading(false);
        }
      };
      getUser();
    } else {
      // ✅ Check userType for initial user too
      checkUserType(initialUser).finally(() => setLoading(false));
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      setUser(session?.user ?? null);
      setSession(session);

      if (session?.user) {
        // ✅ Check userType when user signs in
        await checkUserType(session.user);
      } else {
        setUserType(null);
      }

      setLoading(false);

      // Handle sign out
      if (event === "SIGNED_OUT") {
        setUserType(null);
        // Refresh the page to clear any cached data
        window.location.href = "/";
        // router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, initialUser]);

  const checkUserType = async (authUser: User | null) => {
    if (!authUser) {
      setUserType(null);
      return;
    }

    try {
      console.log("Checking user type for:", authUser.email);

      // Check if user is a donor
      const { data: donorData, error: donorError } = await supabase
        .from("donor")
        .select("id")
        .eq("id", authUser.id)
        .maybeSingle(); // ✅ Use maybeSingle() instead of single() to avoid errors

      if (donorData) {
        console.log("User is donor");
        setUserType("donor");
        return;
      }

      // Only check NGO if donor check didn't find anything and there was no error
      if (!donorError || donorError.code === "PGRST116") {
        const { data: ngoData, error: ngoError } = await supabase
          .from("ngo")
          .select("id")
          .eq("id", authUser.id)
          .maybeSingle(); // ✅ Use maybeSingle() instead of single()

        if (ngoData) {
          console.log("User is NGO");
          setUserType("ngo");
          return;
        }

        if (!ngoError || ngoError.code === "PGRST116") {
          console.log("User is neither donor nor NGO");
          setUserType(null);
        } else {
          throw ngoError;
        }
      } else {
        throw donorError;
      }
    } catch (error) {
      console.error("Error checking user type:", error);
      setUserType(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      // Don't manually set user/session here - let onAuthStateChange handle it
      // This ensures proper userType checking
      return {};
    } catch (error) {
      setLoading(false);
      return { error: "An unexpected error occurred" };
    }
  };

  const signUp = async (
    email: string,
    password: string
  ): Promise<{
    data: { user: User | null; session: Session | null };
    error: AuthError | null;
  }> => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (!error && data.user) {
        // Don't manually set state here - let onAuthStateChange handle it
        // This ensures proper userType checking
      }

      setLoading(false);
      return { data, error };
    } catch (error) {
      setLoading(false);
      return {
        data: { user: null, session: null },
        error: error as AuthError,
      };
    }
  };

  const signOut = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setLoading(false);
        return { error: error.message };
      }
      setLoading(false);

      // onAuthStateChange will handle the state update and redirect
      return {};
    } catch (error) {
      setLoading(false);
      return { error: "An unexpected error occurred" };
    }
  };

  // ✅ Helper function to manually refresh user type
  const refreshUserType = async () => {
    if (user) {
      await checkUserType(user);
    }
  };

  const value = {
    user,
    session,
    userType,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUserType,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

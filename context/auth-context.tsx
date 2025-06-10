"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userType: "donor" | "ngo" | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userType: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<"donor" | "ngo" | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        await checkUserType(initialSession.user); // 👈 Important!
      }

      setLoading(false);
    };

    const checkUserType = async (authUser: User) => {
      try {
        const { data: donorData, error: donorError } = await supabase
          .from("donor")
          .select("id")
          .eq("id", authUser?.id)
          .single();

        if (donorData) {
          console.log("user is donor");
          setUserType("donor");
          return;
        }

        if (donorError && donorError.code !== "PGRST116") {
          throw donorError;
        }

        const { data: ngoData, error: ngoError } = await supabase
          .from("ngo")
          .select("id")
          .eq("id", authUser?.id)
          .single();

        if (ngoData) {
          console.log("user is ngo");
          setUserType("ngo");
          return;
        }

        if (ngoError && ngoError.code !== "PGRST116") {
          throw ngoError;
        }

        console.log("user is neither donor nor ngo");
        setUserType(null);
      } catch (error) {
        console.error("Error checking user type:", error);
        setUserType(null);
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      const newUser = currentSession?.user || null;
      setUser(newUser);

      if (newUser) {
        await checkUserType(newUser); // 👈 Re-check user type on auth change
      } else {
        setUserType(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const contextValue: AuthContextType = {
    session,
    user,
    userType,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

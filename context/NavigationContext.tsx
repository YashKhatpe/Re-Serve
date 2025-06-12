"use client";
// contexts/NavigationContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface NavigationContextType {
  isNavigating: boolean;
  loadingText: string;
  setNavigationState: (loading: boolean, text?: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const setNavigationState = (loading: boolean, text: string = "") => {
    setIsNavigating(loading);
    setLoadingText(text);
  };

  return (
    <NavigationContext.Provider
      value={{ isNavigating, loadingText, setNavigationState }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};

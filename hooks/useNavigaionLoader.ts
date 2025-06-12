"use client";
import { useRouter } from "next/navigation";
import { useNavigation } from "@/context/NavigationContext";

// Define route-specific loading messages
const LOADING_MESSAGES: Record<string, string> = {
  "/donate": "to Donate page...",
  "/food-listing": "to Food listings page...",
  "/dashboard": "to Dashboard...",
  "/profile": "to Loading your profile...",
  "/about": "to Loading about page...",
  "/features": "to Features page...",
  "/products": "to your product...",
  "/order-details": "to Order details page...",
  "/how-it-works": "...",
  // Add more routes as needed
};

export const useNavigationLoader = () => {
  const router = useRouter();
  const { isNavigating, setNavigationState } = useNavigation();

  const navigateWithLoader = (path: string, customMessage?: string) => {
    try {
      // Get loading message - use custom message, route-specific, or default
      const loadingMessage =
        customMessage ||
        LOADING_MESSAGES[path] ||
        `Redirecting to ${path.replace("/", "")} page...`;

      setNavigationState(true, loadingMessage);
      router.push(path);

      // Small delay to ensure smooth transition
      setTimeout(() => {
        setNavigationState(false);
      }, 300);
    } catch (error) {
      console.error("Navigation error:", error);
      setNavigationState(false);
    }
  };

  return { isNavigating, navigateWithLoader };
};

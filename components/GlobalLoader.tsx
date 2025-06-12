"use client";
// components/GlobalLoader.tsx
import { useNavigation } from "@/context/NavigationContext";
import Loader from "./Loader";

const GlobalLoader = () => {
  const { isNavigating, loadingText } = useNavigation();

  if (!isNavigating) return null;

  return <Loader text={loadingText} />;
};

export default GlobalLoader;

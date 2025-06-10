"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-500 mb-4"
      onClick={() => router.push("/")}
    >
      <ArrowLeft className="w-4 h-4" />
      Home
    </Button>
  );
};

export default BackButton;

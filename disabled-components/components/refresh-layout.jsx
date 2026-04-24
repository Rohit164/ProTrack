"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { refreshManager } from "@/lib/refresh-manager";

export default function RefreshLayout({ children }) {
  const router = useRouter();
  
  useEffect(() => {
    // Add a listener for refresh events
    const removeListener = refreshManager.addListener(() => {
      console.log("Global refresh triggered");
      router.refresh();
    });
    
    return () => {
      removeListener();
    };
  }, [router]);
  
  return children;
} 
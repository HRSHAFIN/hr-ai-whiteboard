"use client";
import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toast";

// Wraps the app (inside ClerkProvider). As soon as a user is signed in,
// it pings /api/users so the Clerk account gets mirrored into our own
// Neon `users` table (creating the row on first sign-in).
function Provider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const syncUser = async () => {
      try {
        await fetch("/api/users");
      } catch (error) {
        console.error("Failed to sync user with database:", error);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user?.id]);

  return <Toaster>{children}</Toaster>;
}

export default Provider;

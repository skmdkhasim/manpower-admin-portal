"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RootPage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  return (
    <div className="flex h-svh items-center justify-center bg-mist-50">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-800 border-t-transparent" />
    </div>
  );
}

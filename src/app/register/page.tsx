"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuth();

  useEffect(() => {
    openAuthModal("signup", undefined, searchParams.get("ref") ?? undefined);
    router.replace("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterRedirect />
    </Suspense>
  );
}

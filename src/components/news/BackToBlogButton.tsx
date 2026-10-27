"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouteModalClose } from "@/components/ui/RouteModal";

const buttonClassName =
  "inline-flex items-center gap-2 px-5 py-2.5 rounded-full border gf-border gf-bg-white text-sm font-semibold gf-text-black hover:border-gf-orange hover:text-gf-orange transition-colors no-underline";

export default function BackToBlogButton() {
  const closeModal = useRouteModalClose();

  if (closeModal) {
    return (
      <button type="button" onClick={closeModal} className={buttonClassName}>
        <ArrowLeft width={16} height={16} />
        모든 블로그 보기
      </button>
    );
  }

  return (
    <Link href="/blog" className={buttonClassName}>
      <ArrowLeft width={16} height={16} />
      모든 블로그 보기
    </Link>
  );
}

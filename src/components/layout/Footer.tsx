"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import LegalDialogTrigger from "@/components/legal/LegalDialogTrigger";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
  { href: "/about", label: "서비스소개" },
  { href: "/blog", label: "블로그" },
];

// TODO: cms.api 연동 후 serverFetch로 조회한 값으로 교체
const BUSINESS_INFO = [
  { label: "사업자 등록번호", value: "815-34-01726" },
  { label: "대표자명", value: "소윤호" },
  { label: "운영시간", value: "AM 09:00 - PM 18:00" },
  { label: "고객센터", value: "10:00 - 17:00" },
  { label: "통신판매업신고", value: "2026-GANGNAM-SEOUL-04440" },
];

export default function Footer() {
  const pathname = usePathname();
  const [infoOpen, setInfoOpen] = useState(false);

  // 업로드("/upload")만 lg 이상에서 fixed 왼쪽 사이드바(LayerSidebar, w-[220px])를 쓴다.
  // 사이드바는 fixed라 항상 화면에 떠 있으므로, 이 Footer가 일반 문서 흐름에 있어도
  // 그 경로에서는 사이드바 폭만큼 왼쪽 패딩을 줘 겹치지 않게 한다.
  const isUploadShell = pathname.startsWith("/upload");

  // LayerShell(다크 상단 네비) 경로는 푸터도 다크 스코프로 맞춘다.
  const isDarkShell =
    pathname === "/" ||
    pathname.startsWith("/resources") ||
    pathname.startsWith("/introduce") ||
    pathname.startsWith("/blog");

  return (
    <footer
      className={cn(
        "hidden border-t border-gf-border bg-gf-white md:block",
        isUploadShell && "lg:pl-[220px]",
        isDarkShell && "gf-dark",
      )}
    >
      <div className="relative px-10">
        {/* 사업자 정보 패널 — 고정 바 위로 플로팅 */}
        {infoOpen && (
          <div className="absolute inset-x-0 bottom-full border-t border-gf-border bg-gf-white px-10 py-5 shadow-[0_-8px_16px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-gf-gray2">
              {BUSINESS_INFO.map((item) => (
                <span key={item.label}>
                  <span className="font-bold text-gf-gray1">{item.label}</span> {item.value}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-gf-gray2">
              © {new Date().getFullYear()} GOSPELFIX. All rights reserved.
            </p>
          </div>
        )}

        {/* 상단 바 — 브랜드 + 정보 토글 + 링크 */}
        <div className="flex h-[33px] flex-wrap items-center gap-x-5 gap-y-2 text-[11px]">
          <Link
            href="/"
            className="flex items-center gap-0.5 font-black tracking-[-0.03em] no-underline text-gf-black"
          >
            <span className="font-kr">GOSPEL</span>
            <span className="font-kr text-gf-orange">FIX</span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setInfoOpen((prev) => !prev)}
            aria-expanded={infoOpen}
            className="h-auto gap-1 rounded-none p-0 text-[11px] text-gf-gray2 hover:bg-transparent hover:text-gf-black aria-expanded:bg-transparent aria-expanded:text-gf-black"
          >
            사업자 정보
            {infoOpen ? (
              <ChevronUpIcon className="size-3.5" />
            ) : (
              <ChevronDownIcon className="size-3.5" />
            )}
          </Button>
          <span className="text-gf-border">|</span>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="no-underline text-gf-gray1 transition-colors hover:text-gf-black"
              >
                {link.label}
              </Link>
            ))}
            <LegalDialogTrigger
              type="terms"
              className="text-gf-gray1 transition-colors hover:text-gf-black"
            >
              이용약관
            </LegalDialogTrigger>
            <LegalDialogTrigger
              type="privacy"
              className="text-gf-gray1 transition-colors hover:text-gf-black"
            >
              개인정보처리방침
            </LegalDialogTrigger>
            <LegalDialogTrigger
              type="refund"
              className="text-gf-gray1 transition-colors hover:text-gf-black"
            >
              환불정책
            </LegalDialogTrigger>
          </nav>
        </div>
      </div>
    </footer>
  );
}

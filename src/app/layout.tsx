import type { Metadata } from "next";
import "./globals.css";
import RecoilProvider from "@/components/providers/RecoilProvider";
import PostHogProvider from "@/components/providers/PostHogProvider";
import AuthProvider from "@/components/auth/AuthProvider";
import CartProvider from "@/components/cart/CartProvider";
import CookieConsentBanner from "@/components/layout/CookieConsentBanner";
import { Toaster } from "@/components/ui/sonner";

const DEFAULT_SITE_URL = "https://gospelfix-ashy.vercel.app";

// 빈 문자열·끝 슬래시까지 걸러서 metadataBase가 깨지지 않게 한다
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "GOSPELFIX",
  description:
    "CI 로고, 목업, 배너, 광고소재부터 예약 챗봇이 달린 홈페이지·쇼핑몰까지. 사업에서 필요한 요소들 GOSPELFIX 함께 만들어 드립니다.",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/logo.webp",
  },
  openGraph: {
    title: "GOSPELFIX — 브랜딩부터 챗봇 홈페이지까지 한 번에",
    description:
      "CI 로고, 목업, 배너, 광고소재부터 예약 챗봇이 달린 홈페이지·쇼핑몰까지. 사업에서 필요한 요소들 GOSPELFIX 함께 만들어 드립니다.",
    url: SITE_URL,
    siteName: "GOSPELFIX",
    images: [
      {
        url: "/og-image.v5.jpg",
        width: 984,
        height: 477,
        alt: "GOSPELFIX — 브랜딩부터 챗봇 홈페이지까지 한 번에",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GOSPELFIX — 브랜딩부터 챗봇 홈페이지까지 한 번에",
    description:
      "CI 로고, 목업, 배너, 광고소재부터 예약 챗봇이 달린 홈페이지·쇼핑몰까지. 사업에서 필요한 요소들 GOSPELFIX 함께 만들어 드립니다.",
    images: ["/og-image.v5.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <PostHogProvider>
          <RecoilProvider>
            <AuthProvider>
              <CartProvider>{children}</CartProvider>
            </AuthProvider>
            <CookieConsentBanner />
          </RecoilProvider>
        </PostHogProvider>
        <Toaster />
      </body>
    </html>
  );
}

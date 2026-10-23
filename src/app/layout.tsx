import type { Metadata } from "next";
import "./globals.css";
import RecoilProvider from "@/components/providers/RecoilProvider";
import PostHogProvider from "@/components/providers/PostHogProvider";
import AuthProvider from "@/components/auth/AuthProvider";
import CartProvider from "@/components/cart/CartProvider";
import CookieConsentBanner from "@/components/layout/CookieConsentBanner";
import { Toaster } from "@/components/ui/sonner";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gospelfix.vercel.app";

export const metadata: Metadata = {
  title: "GOSPELFIX",
  description:
    "AI가 탑재된 웹 템플릿을 구매하고 바로 서비스를 오픈하세요. 랜딩페이지, 대시보드, 이커머스 — 구매 즉시 바로 런칭할 수 있습니다.",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/logo.webp",
  },
  openGraph: {
    title: "GOSPELFIX — AI 탑재 웹 템플릿 마켓",
    description:
      "AI가 탑재된 웹 템플릿을 구매하고 바로 서비스를 오픈하세요. 랜딩페이지, 대시보드, 이커머스 — 구매 즉시 바로 런칭할 수 있습니다.",
    url: SITE_URL,
    siteName: "GOSPELFIX",
    images: [
      {
        url: "/og-image.v4.jpg",
        width: 1200,
        height: 630,
        alt: "GOSPELFIX — AI 탑재 웹 템플릿 마켓",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GOSPELFIX — AI 탑재 웹 템플릿 마켓",
    description:
      "AI가 탑재된 웹 템플릿을 구매하고 바로 서비스를 오픈하세요. 랜딩페이지, 대시보드, 이커머스 — 구매 즉시 바로 런칭할 수 있습니다.",
    images: ["/og-image.v4.jpg"],
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

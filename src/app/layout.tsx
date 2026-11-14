import type { Metadata } from "next";
import "./globals.css";
import RecoilProvider from "@/components/providers/RecoilProvider";
import PostHogProvider from "@/components/providers/PostHogProvider";
import AuthProvider from "@/components/auth/AuthProvider";
import CartProvider from "@/components/cart/CartProvider";
import CookieConsentBanner from "@/components/layout/CookieConsentBanner";
import { Toaster } from "@/components/ui/sonner";
import { SITE_DESCRIPTION } from "@/lib/siteMetadata";

const DEFAULT_SITE_URL = "https://gospelfix-ashy.vercel.app";

// 빈 문자열·끝 슬래시까지 걸러서 metadataBase가 깨지지 않게 한다
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");

// 네이버 서치어드바이저 소유확인 값. 미설정이면 meta 태그를 아예 출력하지 않는다
const NAVER_SITE_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  title: "GOSPELFIX",
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  ...(NAVER_SITE_VERIFICATION && {
    other: { "naver-site-verification": NAVER_SITE_VERIFICATION },
  }),
  icons: {
    icon: "/logo.webp",
  },
  openGraph: {
    title: "GOSPELFIX — 브랜딩부터 챗봇 홈페이지까지 한 번에",
    description: SITE_DESCRIPTION,
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
    description: SITE_DESCRIPTION,
    images: ["/og-image.v5.jpg"],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
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

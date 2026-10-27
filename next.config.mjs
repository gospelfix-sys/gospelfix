/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.(?<host>.*)",
          },
        ],
        destination: "https://:host/:path*",
        permanent: true,
      },
      {
        // 문의하기(견적) 기능 삭제 후 남은 외부 링크를 홈으로 돌린다. 기능이 되살아날 수 있어
        // 브라우저에 캐시되는 영구 리다이렉트는 쓰지 않는다.
        source: "/quote/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/mall",
        destination: "/",
        permanent: true,
      },
      {
        source: "/mall/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/growth",
        destination: "/layer",
        permanent: true,
      },
      {
        source: "/growth/:path*",
        destination: "/layer/:path*",
        permanent: true,
      },
    ];
  },
  transpilePackages: ["swiper"],
  images: {
    // Vercel Image Optimization이 402(Payment Required)를 반환해 임시로 비활성화함.
    // 결제수단 등록 후 재활성화 검토. remotePatterns는 그때를 위해 유지.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.vimeocdn.com",
      },
    ],
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;

import axios from "axios";
import http from "node:http";
import https from "node:https";
import { headers } from "next/headers";
import { cache } from "react";

export class ServerFetchError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ServerFetchError";
    this.status = status;
  }
}

// Node 기본 http.Agent는 keep-alive가 꺼져 있어 self-fetch마다 TCP(+TLS) 핸드셰이크가
// 재발생한다. 모듈 스코프에서 한 번만 생성해 연결을 재사용한다.
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host");
  const protocol =
    h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${protocol}://${host}`;
}

interface ServerFetchOptions {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
}

/**
 * Server Component/Server Action에서 이 앱 자신의 /api/* Route Handler를 호출하는 공통 헬퍼.
 * SSR 중에는 상대 경로 fetch가 불가능하므로 현재 요청의 host로 절대 URL을 구성하고,
 * Route Handler가 쿠키 기반 인증(getAccessToken)을 쓸 수 있도록 원본 요청의 Cookie 헤더를
 * 그대로 전달한다(별도의 새 HTTP 요청이라 자동으로는 전달되지 않음).
 * axios는 Next.js가 패치한 전역 fetch를 거치지 않아 Data Cache에 잡히지 않으므로
 * 기존 `cache: "no-store"`와 동등한 매 요청 재검증을 별도 옵션 없이 보장한다.
 * 다만 axios는 Next의 Request Memoization(동일 렌더 패스 내 동일 인자 fetch 자동 dedupe)도
 * 함께 우회하므로, React `cache()`로 감싸 요청 단위 메모이제이션을 직접 복원한다
 * (예: generateMetadata와 페이지 컴포넌트가 같은 path를 각각 호출해도 실제 왕복은 1회).
 */
async function serverFetchImpl<T = unknown>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const h = await headers();
  const cookie = h.get("cookie");
  const { method = "GET", body, headers: extraHeaders } = options;

  try {
    const res = await axios.request<T>({
      url: `${await getBaseUrl()}${path}`,
      method,
      data: body,
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}),
        ...extraHeaders,
      },
      httpAgent,
      httpsAgent,
    });

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message =
        (error.response?.data as { error?: string } | undefined)?.error ??
        "요청 처리에 실패했습니다.";
      throw new ServerFetchError(status, message);
    }
    throw error;
  }
}

export const serverFetch = cache(serverFetchImpl) as typeof serverFetchImpl;

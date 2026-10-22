import axios from "axios";
import http from "node:http";
import https from "node:https";

const CMS_API_BASE_URL = process.env.CMS_API_BASE_URL;
const CMS_API_KEY = process.env.CMS_API_KEY;

export class CmsApiError extends Error {
  status: number;
  // cms.api가 어떤 입력 필드로 인한 에러인지 알려줄 때만 채워진다 (예: slug 중복 409).
  field?: string;
  constructor(status: number, message: string, field?: string) {
    super(message);
    this.name = "CmsApiError";
    this.status = status;
    this.field = field;
  }
}

// Node 기본 http.Agent는 keep-alive가 꺼져 있어 요청마다 TCP(+TLS) 핸드셰이크가
// 재발생한다. 모듈 스코프에서 한 번만 생성해 연결을 재사용한다.
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const cmsApiClient = axios.create({
  baseURL: CMS_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  httpAgent,
  httpsAgent,
});

interface CmsApiFetchOptions {
  method?: string;
  body?: string;
  accessToken?: string | null;
  headers?: Record<string, string>;
}

/**
 * gospelfix.cms.api REST API를 서버 사이드에서 호출하는 공통 헬퍼.
 * main의 Route Handler / Server Component에서만 사용한다 (브라우저에서 직접 호출 금지 —
 * CMS_API_KEY가 클라이언트 번들에 노출되면 안 되므로 반드시 서버 사이드 전용).
 */
export async function cmsApiFetch<T = unknown>(
  path: string,
  options: CmsApiFetchOptions = {},
): Promise<T> {
  if (!CMS_API_BASE_URL || !CMS_API_KEY) {
    throw new Error("CMS_API_BASE_URL / CMS_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const { accessToken, headers, method = "GET", body } = options;

  try {
    const res = await cmsApiClient.request<T>({
      url: path,
      method,
      data: body,
      headers: {
        ...headers,
        "X-API-Key": CMS_API_KEY,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const data = error.response?.data as { error?: string; field?: string } | undefined;
      throw new CmsApiError(status, data?.error ?? "요청 처리에 실패했습니다.", data?.field);
    }
    throw error;
  }
}

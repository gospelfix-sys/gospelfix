import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/cmsApi/session";
import { proxyMultipart } from "@/lib/cmsApi/proxyMultipart";

export const runtime = "nodejs";

const CMS_API_BASE_URL = process.env.CMS_API_BASE_URL;
const CMS_API_KEY = process.env.CMS_API_KEY;

// 무료 상품 다운로드용 zip 업로드. multipart는 cmsApiFetch(axios, JSON 전용)로 전달할 수 없어
// proxyMultipart로 원본 본문을 그대로 중계한다.
export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!CMS_API_BASE_URL || !CMS_API_KEY) {
    return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 500 });
  }

  try {
    const res = await proxyMultipart(request, "/api/v1/my-products/files", accessToken);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error ?? "파일 업로드에 실패했습니다." },
        { status: res.status },
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/my-products/files]", error);
    return NextResponse.json({ error: "파일 업로드에 실패했습니다." }, { status: 500 });
  }
}

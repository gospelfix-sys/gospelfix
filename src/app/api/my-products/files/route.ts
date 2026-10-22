import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/cmsApi/session";

export const runtime = "nodejs";

const CMS_API_BASE_URL = process.env.CMS_API_BASE_URL;
const CMS_API_KEY = process.env.CMS_API_KEY;

// 무료 상품 다운로드용 zip 업로드. auth/avatar/route.ts, my-products/images/route.ts와
// 동일하게 multipart는 원본 fetch로 프록시한다(cmsApiFetch는 JSON 전용).
export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!CMS_API_BASE_URL || !CMS_API_KEY) {
    return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const res = await fetch(`${CMS_API_BASE_URL}/api/v1/my-products/files`, {
      method: "POST",
      headers: { "X-API-Key": CMS_API_KEY, Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
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

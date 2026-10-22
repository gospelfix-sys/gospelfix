import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/cmsApi/session";

export const runtime = "nodejs";

const CMS_API_BASE_URL = process.env.CMS_API_BASE_URL;
const CMS_API_KEY = process.env.CMS_API_KEY;

export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!CMS_API_BASE_URL || !CMS_API_KEY) {
    return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 500 });
  }

  try {
    // multipart/form-data는 boundary가 FormData 인스턴스마다 달라 cmsApiFetch(axios,
    // JSON 전용)로 그대로 전달할 수 없다 — 여기서만 예외적으로 원본 fetch로 프록시한다.
    const formData = await request.formData();
    const res = await fetch(`${CMS_API_BASE_URL}/api/v1/auth/avatar`, {
      method: "POST",
      headers: { "X-API-Key": CMS_API_KEY, Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error ?? "아바타 업로드에 실패했습니다." },
        { status: res.status },
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/auth/avatar]", error);
    return NextResponse.json({ error: "아바타 업로드에 실패했습니다." }, { status: 500 });
  }
}

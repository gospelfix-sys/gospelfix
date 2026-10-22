import { NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cmsApi/client";
import { getAccessToken, clearSessionCookies } from "@/lib/cmsApi/session";

export const runtime = "nodejs";

export async function POST() {
  const accessToken = await getAccessToken();

  if (accessToken) {
    try {
      await cmsApiFetch("/api/v1/auth/logout", { method: "POST", accessToken });
    } catch (error) {
      console.error("[api/auth/logout] cms.api logout failed:", error);
      // cms.api 쪽 revoke가 실패해도 main의 로컬 쿠키는 반드시 지운다.
    }
  }

  await clearSessionCookies();
  return NextResponse.json({ success: true });
}

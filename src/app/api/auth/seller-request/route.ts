import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";
import type { SellerIdentityInput } from "@/types/seller.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 신원정보(휴대폰·이메일·사업자 정보)를 다루므로 요청 body를 로그에 남기지 않는다.
export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Partial<SellerIdentityInput> | null;
  if (!body || (body.sellerType !== "individual" && body.sellerType !== "business")) {
    return NextResponse.json({ error: "판매자 유형을 선택해주세요." }, { status: 400 });
  }
  // 알려진 필드만 cms.api로 넘긴다
  const payload: SellerIdentityInput = {
    sellerType: body.sellerType,
    contactName: body.contactName,
    contactPhone: body.contactPhone ?? "",
    contactEmail: body.contactEmail ?? "",
    businessName: body.businessName,
    representativeName: body.representativeName,
    businessAddress: body.businessAddress,
    businessNumber: body.businessNumber,
    businessOpenedAt: body.businessOpenedAt,
    mailOrderReportNumber: body.mailOrderReportNumber,
  };

  try {
    const data = await cmsApiFetch("/api/v1/auth/seller-request", {
      method: "POST",
      body: JSON.stringify(payload),
      accessToken,
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/auth/seller-request]", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "판매자 신청에 실패했습니다." }, { status: 500 });
  }
}

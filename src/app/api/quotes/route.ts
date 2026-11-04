import { NextRequest, NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";

export const dynamic = "force-dynamic";

const MAX_NAME_LENGTH = 50;
const MAX_CONTACT_LENGTH = 100;
const MAX_SUMMARY_LENGTH = 2000;
const MAX_META_LENGTH = 500;
const MAX_LIST_LENGTH = 50;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// 문자열이 아니거나 길이 제한을 넘으면 null — 선택 필드는 잘못된 값을 조용히 버린다
function optionalString(value: unknown, max: number): string | null {
  return typeof value === "string" && value.length <= max ? value : null;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.length <= MAX_META_LENGTH)
    .slice(0, MAX_LIST_LENGTH);
}

// 비로그인 공개 쓰기 경로라 body를 그대로 넘기지 않고 cms.api가 받는 필드만 골라 보낸다.
// ipAddress/userAgent/referer는 Server Action이 최종 사용자 헤더에서 채워 보낸 값이다
// (이 handler는 serverFetch 자기호출을 받으므로 요청 헤더로 다시 계산할 수 없다).
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!isRecord(body)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const contactName = typeof body.contactName === "string" ? body.contactName.trim() : "";
  const contactValue = typeof body.contactValue === "string" ? body.contactValue.trim() : "";
  if (!contactName || !contactValue) {
    return NextResponse.json({ error: "이름과 연락처를 입력해주세요." }, { status: 400 });
  }
  if (contactName.length > MAX_NAME_LENGTH || contactValue.length > MAX_CONTACT_LENGTH) {
    return NextResponse.json({ error: "입력값이 너무 깁니다." }, { status: 400 });
  }

  const estimatedTotal =
    typeof body.estimatedTotal === "number" && Number.isFinite(body.estimatedTotal)
      ? body.estimatedTotal
      : 0;

  try {
    // 로그인 여부는 cms.api가 Bearer 토큰으로 선택적으로 확인한다 (없어도 공개 제출 가능)
    const accessToken = await getAccessToken();

    const data = await cmsApiFetch<{ id: string }>("/api/v1/quotes", {
      method: "POST",
      accessToken: accessToken ?? undefined,
      body: JSON.stringify({
        selectedCategories: stringList(body.selectedCategories),
        selectedItems: Array.isArray(body.selectedItems)
          ? body.selectedItems.slice(0, MAX_LIST_LENGTH)
          : [],
        schedule: optionalString(body.schedule, MAX_META_LENGTH),
        stylePreferences: stringList(body.stylePreferences),
        targetAge: optionalString(body.targetAge, MAX_META_LENGTH),
        contactName,
        contactValue,
        contactEmail: optionalString(body.contactEmail, MAX_CONTACT_LENGTH),
        businessNumber: optionalString(body.businessNumber, MAX_CONTACT_LENGTH),
        projectSummary: optionalString(body.projectSummary, MAX_SUMMARY_LENGTH),
        referenceUrls: stringList(body.referenceUrls),
        estimatedTotal,
        shopIndustry: optionalString(body.shopIndustry, MAX_META_LENGTH),
        shopStatus: optionalString(body.shopStatus, MAX_META_LENGTH),
        productionScope: optionalString(body.productionScope, MAX_META_LENGTH),
        requiredFeatures: stringList(body.requiredFeatures),
        needsSystemDev: body.needsSystemDev === true,
        utmParams: {},
        ipAddress: optionalString(body.ipAddress, MAX_META_LENGTH),
        userAgent: optionalString(body.userAgent, MAX_META_LENGTH),
        referer: optionalString(body.referer, MAX_META_LENGTH),
      }),
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/quotes] unexpected error:", error);
    return NextResponse.json({ error: "견적 제출에 실패했습니다." }, { status: 500 });
  }
}

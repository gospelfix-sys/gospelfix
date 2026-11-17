import { type NextRequest, NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";
import type { PayoutAccount, PayoutAccountInput } from "@/types/payout.types";

export const dynamic = "force-dynamic";

// 계좌번호를 다루는 handler라 요청 body·번호를 로그에 남기지 않는다(오류는 메시지만 기록).
function toErrorResponse(error: unknown, tag: string, fallback: string) {
  if (error instanceof CmsApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(
    `[api/my-payout-account ${tag}]`,
    error instanceof Error ? error.message : "unknown",
  );
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json(null);

  try {
    const { data } = await cmsApiFetch<{ data: PayoutAccount | null }>(
      "/api/v1/my-payout-account",
      { accessToken },
    );
    return NextResponse.json(data);
  } catch (error) {
    // 목록성 조회라 실패해도 화면을 깨뜨리지 않는다(미등록 상태로 보여줌)
    console.error(
      "[api/my-payout-account GET]",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(null);
  }
}

export async function PUT(request: NextRequest) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // 잘못된 JSON이 와도 500이 아니라 400으로 돌려준다
  const input: Partial<PayoutAccountInput> = await request.json().catch(() => ({}));
  if (!input.bankName || !input.accountHolder || !input.accountNumber) {
    return NextResponse.json(
      { error: "은행, 예금주, 계좌번호를 모두 입력해주세요." },
      { status: 400 },
    );
  }

  try {
    const { data } = await cmsApiFetch<{ data: PayoutAccount }>("/api/v1/my-payout-account", {
      method: "PUT",
      body: JSON.stringify({
        bankName: input.bankName,
        accountHolder: input.accountHolder,
        accountNumber: input.accountNumber,
      }),
      accessToken,
    });
    return NextResponse.json(data);
  } catch (error) {
    return toErrorResponse(error, "PUT", "정산 계좌 저장에 실패했습니다.");
  }
}

export async function DELETE() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const data = await cmsApiFetch("/api/v1/my-payout-account", {
      method: "DELETE",
      accessToken,
    });
    return NextResponse.json(data);
  } catch (error) {
    return toErrorResponse(error, "DELETE", "정산 계좌 삭제에 실패했습니다.");
  }
}

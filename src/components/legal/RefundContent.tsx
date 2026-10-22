import ContactCard from "@/components/legal/ContactCard";

export default function RefundContent() {
  return (
    <>
      <p className="text-sm text-gf-gray1 mb-12 leading-relaxed">
        {
          "GOSPELFIX(이하 '회사')의 디지털 콘텐츠 및 제작 용역에 대한 환불·청약철회 기준을 안내합니다."
        }
      </p>

      <div className="flex flex-col gap-12">
        {/* 1. 환불정책 개요 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">1. 환불정책 개요</h2>
          <div className="rounded-xl border border-gf-line bg-gf-orange-bg px-6 py-5 text-sm text-gf-gray1 leading-relaxed">
            <p className="font-semibold text-gf-black mb-2">중요 안내</p>
            <p>
              디지털 콘텐츠 및 제작 용역은 전자상거래법 제17조 제2항 제5호에 따라 구매 후
              제작(용역) 제공이 개시된 경우 청약철회가 제한될 수 있습니다.
            </p>
          </div>
        </section>

        {/* 2. 청약철회 기간 및 예외 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">2. 청약철회 기간 및 예외</h2>
          <ul className="flex flex-col gap-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">①</span>
              <span>
                이용자는 구매 계약 체결일로부터 7일 이내에 청약철회를 할 수 있습니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">②</span>
              <span>
                다만 제작(용역) 제공이 개시된 건에 대해서는 청약철회가 불가능합니다. 제공 개시
                시점은 구매 옵션에 따라 다르게 판단하며, 자세한 기준은 아래 3항을 따릅니다.
              </span>
            </li>
          </ul>
        </section>

        {/* 3. 구매 옵션별 제작(용역) 제공 개시 시점 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">
            3. 구매 옵션별 제작(용역) 제공 개시 시점
          </h2>
          <p className="text-sm text-gf-gray1 mb-4 leading-relaxed">
            몰에서 판매하는 구매 옵션은 &ldquo;단순복사&rdquo;와 &ldquo;커스터마이징&rdquo;으로
            구분되며, 두 옵션 모두 청약철회 제한 대상인 용역에 해당합니다. 다만 제작(용역) 제공이
            개시되는 시점은 옵션별로 다음과 같이 판단합니다.
          </p>
          <ul className="flex flex-col gap-2 ml-5 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>
                <strong className="text-gf-black">단순복사:</strong> 결제 완료 후 담당자가 실제
                제작(적용) 작업에 착수하는 시점부터 제공이 개시된 것으로 봅니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>
                <strong className="text-gf-black">커스터마이징:</strong> 구매 전 카카오 채널을
                통한 상담 및 견적 협의 단계는 제공 개시 전으로 보며, 협의가 완료되어 담당자가 실제
                디자인 수정 작업에 착수하는 시점부터 제공이 개시된 것으로 봅니다.
              </span>
            </li>
          </ul>
          <div className="mt-4 rounded-lg border border-gf-line bg-gf-orange-bg px-4 py-3 text-sm leading-relaxed text-gf-gray1">
            <span className="font-semibold text-gf-black">⚠️ 콘텐츠(내용물)는 포함되지 않아요.</span>{" "}
            상세페이지에서 보시는 샘플 화면 속 상품·사진·문구는 디자인을 보여드리기 위한 예시일
            뿐입니다. 실제로 전달되는 템플릿은 내용이 비어 있는 상태이며, 상품 사진·설명 글 등은
            구매 후 회원님이 직접 채워 넣으셔야 합니다. 이는 결함이 아니므로 환불 사유에
            해당하지 않습니다.
          </div>
        </section>

        {/* 4. 환불이 제한되는 경우 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">4. 환불이 제한되는 경우</h2>
          <ul className="flex flex-col gap-2 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>제작(용역) 제공이 이미 개시된 경우 (위 3항 기준)</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>결과물(소스코드, 파일 등)을 다운로드하거나 전달받아 확인한 경우</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>이용자의 요청으로 커스터마이징이 완료되어 원상회복이 곤란한 경우</span>
            </li>
          </ul>
        </section>

        {/* 5. 회사 귀책 사유로 인한 환불 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">5. 회사 귀책 사유로 인한 환불</h2>
          <p className="text-sm text-gf-gray1 leading-relaxed">
            콘텐츠 또는 결과물 자체의 결함(회사 귀책 사유)으로 인한 경우에는 제작 진행 여부와
            관계없이 환불이 가능합니다.
          </p>
        </section>

        {/* 6. 환불 신청 방법 및 처리 절차 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">6. 환불 신청 방법 및 처리 절차</h2>
          <ul className="flex flex-col gap-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">①</span>
              <span>
                환불 요청은{" "}
                <a
                  href="https://pf.kakao.com/_CqKlX/chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gf-orange no-underline hover:underline"
                >
                  카카오 채널
                </a>
                로 주문 번호와 함께 문의해 주세요.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">②</span>
              <span>회사는 접수된 요청 건에 대해 제작 진행 상황을 확인 후 환불 가능 여부를 안내합니다.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">③</span>
              <span>환불이 확정되면 영업일 기준 3일 이내에 처리됩니다.</span>
            </li>
          </ul>
        </section>

        {/* 7. 환불 방법 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">7. 환불 방법</h2>
          <p className="text-sm text-gf-gray1 leading-relaxed">
            결제는 카카오페이로 이루어지며, 환불 역시 결제 시 이용한 카카오페이 계정으로
            환불금을 재입금하는 방식으로 처리됩니다.
          </p>
        </section>

        {/* 8. 문의처 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">8. 문의처</h2>
          <ContactCard>
            <p>상호: GOSPELFIX</p>
            <p>
              문의:{" "}
              <a
                href="https://pf.kakao.com/_CqKlX/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gf-orange no-underline hover:underline"
              >
                카카오 채널
              </a>
            </p>
          </ContactCard>
        </section>

        {/* 시행일 */}
        <section>
          <p className="text-sm font-bold text-gf-black">시행일: 2026년 6월 18일</p>
        </section>
      </div>
    </>
  );
}

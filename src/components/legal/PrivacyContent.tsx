import ContactCard from "@/components/legal/ContactCard";

export default function PrivacyContent() {
  return (
    <>
      <p className="text-sm text-gf-gray1 mb-12 leading-relaxed">
        {"GOSPELFIX(이하 '회사')는 「개인정보 보호법」을 준수하며, 이용자의 개인정보를 소중히 보호합니다."}
      </p>

      <div className="flex flex-col gap-12">
        {/* 1. 수집하는 개인정보 항목 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">1. 수집하는 개인정보 항목</h2>
          <p className="text-sm text-gf-gray1 mb-4 leading-relaxed">
            회사는 서비스 제공 및 계약 이행을 위해 아래 항목을 수집합니다.
          </p>
          <ul className="flex flex-col gap-2 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>
                <strong className="text-gf-black">필수</strong>: 이름(또는 닉네임), 이메일
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>
                <strong className="text-gf-black">결제 시</strong>: 입금자명 등 결제 확인에
                필요한 최소 정보 (카카오페이로 결제, 별도 결제대행사(PG) 경유 없음)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>
                <strong className="text-gf-black">자동 수집</strong>: 접속 기기·브라우저 정보
                (User-Agent), 방문 일시
              </span>
            </li>
          </ul>
        </section>

        {/* 2. 개인정보의 수집·이용 목적 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">2. 개인정보의 수집·이용 목적</h2>
          <ul className="flex flex-col gap-2 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>회원 가입·인증 및 서비스 제공</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>구매·결제 처리 및 구매 내역 제공</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>서비스 이용 관련 공지·안내 발송</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>(동의 시) 신규 템플릿·이벤트 등 마케팅 정보 안내</span>
            </li>
          </ul>
        </section>

        {/* 3. 보유 및 이용 기간 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">3. 보유 및 이용 기간</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gf-surface">
                  <th className="text-left px-4 py-3 font-semibold text-gf-black border border-gf-line w-1/3">
                    구분
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gf-black border border-gf-line">
                    보유 기간
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 text-gf-gray1 border border-gf-line">회원 정보</td>
                  <td className="px-4 py-3 text-gf-gray1 border border-gf-line">
                    회원 탈퇴 시까지
                  </td>
                </tr>
                <tr className="bg-gf-surface">
                  <td className="px-4 py-3 text-gf-gray1 border border-gf-line">구매·거래 기록</td>
                  <td className="px-4 py-3 text-gf-gray1 border border-gf-line">
                    관련 법령에 따라 보존 (전자상거래법: 계약·청약철회 5년, 대금결제 5년)
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gf-gray1 border border-gf-line">접속 로그</td>
                  <td className="px-4 py-3 text-gf-gray1 border border-gf-line">
                    통신비밀보호법에 따라 3개월
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gf-gray1 leading-relaxed">
            보유 기간이 경과하거나 이용 목적이 달성된 개인정보는 지체 없이 파기합니다.
          </p>
        </section>

        {/* 4. 개인정보의 제3자 제공 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">4. 개인정보의 제3자 제공</h2>
          <p className="text-sm text-gf-gray1 leading-relaxed">
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 결제는 카카오페이로
            이루어지며 별도의 결제대행사(PG)에 정보를 위탁하지 않습니다. 다만 관련 법령에 따른
            요청이 있는 경우에 한해 제공합니다.
          </p>
        </section>

        {/* 5. 개인정보 처리의 위탁 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">5. 개인정보 처리의 위탁</h2>
          <p className="text-sm text-gf-gray1 leading-relaxed">
            회사는 서비스 운영을 위해 일부 업무를 외부 전문업체에 위탁할 수 있습니다(예: 클라우드
            인프라·데이터베이스 호스팅). 위탁 시 관계 법령에 따라 안전하게 관리되도록 필요한
            사항을 규정합니다.
          </p>
        </section>

        {/* 6. 정보주체의 권리·행사 방법 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">6. 정보주체의 권리·행사 방법</h2>
          <p className="text-sm text-gf-gray1 leading-relaxed">
            이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요청할 수
            있습니다. 아래 연락처로 요청하시면 지체 없이 조치합니다.
          </p>
        </section>

        {/* 7. 개인정보의 안전성 확보 조치 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">7. 개인정보의 안전성 확보 조치</h2>
          <p className="text-sm text-gf-gray1 leading-relaxed">
            회사는 개인정보의 안전한 처리를 위해 접근 권한 관리, 전송 구간 암호화(TLS), 접근
            통제 등 합리적인 보호조치를 시행합니다.
          </p>
        </section>

        {/* 8. 개인정보 보호책임자 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">8. 개인정보 보호책임자</h2>
          <ContactCard>
            <p>상호: GOSPELFIX</p>
            <p>개인정보 보호책임자: 대표자</p>
            <p>
              이메일:{" "}
              <a
                href="mailto:support@gospelfix.com"
                className="text-gf-orange no-underline hover:underline"
              >
                support@gospelfix.com
              </a>
            </p>
          </ContactCard>
        </section>

        {/* 9. 고지의 의무 */}
        <section>
          <h2 className="text-lg font-bold text-gf-black mb-4">9. 고지의 의무</h2>
          <p className="text-sm text-gf-gray1 leading-relaxed mb-6">
            본 개인정보처리방침의 내용 추가·삭제·수정이 있을 경우 시행 전 본 페이지를 통해
            공지합니다.
          </p>
          <p className="text-sm font-bold text-gf-black">시행일: 2026년 6월 18일</p>
        </section>
      </div>
    </>
  );
}

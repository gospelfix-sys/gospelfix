import ContactCard from "@/components/legal/ContactCard";

const SECTIONS = [
  { id: "article-1", title: "제1조 (목적)" },
  { id: "article-2", title: "제2조 (용어의 정의)" },
  { id: "article-3", title: "제3조 (약관의 게시와 개정)" },
  { id: "article-4", title: "제4조 (서비스의 제공 및 변경)" },
  { id: "article-5", title: "제5조 (회원가입)" },
  { id: "article-6", title: "제6조 (회원 탈퇴 및 자격 상실)" },
  { id: "article-7", title: "제7조 (구매 계약 체결)" },
  { id: "article-8", title: "제8조 (디지털 콘텐츠 환불 및 청약철회)" },
  { id: "article-9", title: "제9조 (저작권 및 이용 제한)" },
  { id: "article-10", title: "제10조 (책임 제한)" },
  { id: "article-11", title: "제11조 (분쟁 해결)" },
  { id: "article-12", title: "제12조 (준거법 및 관할 법원)" },
  { id: "contact", title: "문의처" },
];

export default function TermsContent() {
  return (
    <>
      <p className="text-sm text-gf-gray1 mb-8 leading-relaxed">
        {
          "GOSPELFIX(이하 '회사')가 제공하는 서비스 이용에 관한 약관입니다. 서비스 이용 전 반드시 읽어주세요."
        }
      </p>

      {/* 목차 */}
      <nav aria-label="목차" className="mb-12 rounded-2xl border border-gf-border bg-gf-bg p-6">
        <p className="mb-3 text-sm font-bold text-gf-black">목차</p>
        <ol className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-gf-gray1 sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="no-underline transition-colors hover:text-gf-orange"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-12">
        {/* 제1조 목적 */}
        <section id="article-1" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">제1조 (목적)</h2>
          <p className="text-sm text-gf-gray1 leading-relaxed">
            이 약관은 GOSPELFIX(이하 &ldquo;회사&rdquo;)가 운영하는 모다(MODA)(이하
            &ldquo;몰&rdquo;)에서 제공하는 인터넷 관련 서비스(이하 &ldquo;서비스&rdquo;)를 이용함에
            있어 회사와 이용자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        {/* 제2조 용어의 정의 */}
        <section id="article-2" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">제2조 (용어의 정의)</h2>
          <ul className="flex flex-col gap-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">①</span>
              <span>
                <strong className="text-gf-black">&ldquo;몰&rdquo;</strong>이란 회사가 재화 또는
                용역(이하 &ldquo;재화 등&rdquo;)을 이용자에게 제공하기 위하여 컴퓨터 등
                정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">②</span>
              <span>
                <strong className="text-gf-black">&ldquo;이용자&rdquo;</strong>란 몰에 접속하여 이
                약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">③</span>
              <span>
                <strong className="text-gf-black">&ldquo;회원&rdquo;</strong>이란 회사에 개인정보를
                제공하여 회원 등록을 한 자로서 회사의 정보를 지속적으로 제공받으며 회사가 제공하는
                서비스를 계속적으로 이용할 수 있는 자를 말합니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">④</span>
              <span>
                <strong className="text-gf-black">&ldquo;디지털 콘텐츠&rdquo;</strong>란 회사가
                제작하여 제공하는 웹 템플릿 등 디지털 형태의 결과물 및 관련 소스코드를 말합니다.
              </span>
            </li>
          </ul>
        </section>

        {/* 제3조 약관의 게시와 개정 */}
        <section id="article-3" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">제3조 (약관의 게시와 개정)</h2>
          <ul className="flex flex-col gap-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">①</span>
              <span>
                회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">②</span>
              <span>
                회사는 「전자상거래 등에서의 소비자 보호에 관한 법률」, 「약관의 규제에 관한 법률」
                등 관련 법령에 위배되지 않는 범위에서 약관을 개정할 수 있습니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">③</span>
              <span>
                약관 변경 시 적용 일자와 변경 사유를 명시하여 현행 약관과 함께 서비스 초기 화면에 그
                적용 일자 7일 전부터 공지합니다. 다만 이용자에게 불리하게 변경하는 경우에는 최소
                30일 이상 공지합니다.
              </span>
            </li>
          </ul>
        </section>

        {/* 제4조 서비스의 제공 및 변경 */}
        <section id="article-4" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">제4조 (서비스의 제공 및 변경)</h2>
          <p className="text-sm text-gf-gray1 mb-4 leading-relaxed">
            회사는 다음과 같은 업무를 수행합니다.
          </p>
          <ul className="flex flex-col gap-2 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>웹 템플릿 등 디지털 콘텐츠의 제작 및 판매 서비스</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>재화 및 용역에 관한 정보 제공과 구매 계약 체결</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>구매가 확정된 건에 대한 제작 진행 및 결과물 전달</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>기타 회사가 정하는 업무</span>
            </li>
          </ul>
        </section>

        {/* 제5조 회원가입 */}
        <section id="article-5" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">제5조 (회원가입)</h2>
          <ul className="flex flex-col gap-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">①</span>
              <span>
                이용자는 회사가 정한 양식에 따라 회원 정보를 기입하고 이 약관에 동의한다는
                의사표시를 함으로써 회원가입을 신청합니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">②</span>
              <span>
                회원은 등록된 정보에 변경이 있는 경우, 즉시 이메일 등의 방법으로 회사에 변경 사항을
                알려야 합니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">③</span>
              <span>
                회원가입 시 소셜 로그인(Google, Kakao 등)을 이용하는 경우 해당 소셜 서비스가
                제공하는 정보를 기반으로 회원 계정이 생성됩니다.
              </span>
            </li>
          </ul>
        </section>

        {/* 제6조 회원 탈퇴 및 자격 상실 */}
        <section id="article-6" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">제6조 (회원 탈퇴 및 자격 상실)</h2>
          <ul className="flex flex-col gap-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">①</span>
              <span>
                회원은 회사에 언제든지 탈퇴를 요청할 수 있으며, 회사는 즉시 회원 탈퇴를 처리합니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">②</span>
              <span>
                회원이 다음 각 호의 사유에 해당하는 경우 회사는 회원 자격을 제한 또는 정지시킬 수
                있습니다.
              </span>
            </li>
          </ul>
          <ul className="flex flex-col gap-2 mt-3 ml-5 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>가입 신청 시 허위 내용을 등록한 경우</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>타인의 서비스 이용을 방해하거나 정보를 도용하는 경우</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>관련 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</span>
            </li>
          </ul>
        </section>

        {/* 제7조 구매 계약 체결 */}
        <section id="article-7" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">제7조 (구매 계약 체결)</h2>
          <ul className="flex flex-col gap-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">①</span>
              <span>
                이용자는 몰에서 다음과 같은 방법으로 구매를 신청하며, 회사는 이용자가 구매 신청을
                함에 있어서 다음의 각 내용을 알기 쉽게 제공하여야 합니다.
              </span>
            </li>
          </ul>
          <ul className="flex flex-col gap-2 mt-3 ml-5 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>재화 등의 검색 및 선택</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>결제 수단 선택 및 결제</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>구매 신청 내용의 확인 또는 회사의 확인에 대한 동의</span>
            </li>
          </ul>
          <ul className="flex flex-col gap-3 mt-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">②</span>
              <span>
                결제 완료 시점에 구매 계약이 체결되며, 회사는 이메일 또는 서비스 내 알림을 통해 주문
                확인 내역을 발송합니다.
              </span>
            </li>
          </ul>
        </section>

        {/* 제8조 디지털 콘텐츠 환불 및 청약철회 */}
        <section id="article-8" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">
            제8조 (디지털 콘텐츠 환불 및 청약철회)
          </h2>
          <div className="rounded-xl border border-gf-line bg-gf-orange-bg px-6 py-5 text-sm text-gf-gray1 leading-relaxed mb-4">
            <p className="font-semibold text-gf-black mb-2">중요 안내</p>
            <p>
              디지털 콘텐츠 및 제작 용역은 전자상거래법 제17조 제2항 제5호에 따라 구매 후 제작(용역)
              제공이 개시된 경우 청약철회가 제한될 수 있습니다.
            </p>
          </div>
          <ul className="flex flex-col gap-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">①</span>
              <span>
                이용자는 구매 계약 체결일로부터 7일 이내에 청약철회를 할 수 있습니다. 단, 제작(용역)
                제공이 개시된 건에 대해서는 청약철회가 불가능합니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">②</span>
              <span>
                몰에서 판매하는 구매 옵션은 &ldquo;단순복사&rdquo;와 &ldquo;커스터마이징&rdquo;으로
                구분되며, 두 옵션 모두 제1항의 청약철회 제한 대상인 용역에 해당합니다. 다만
                제작(용역) 제공이 개시되는 시점은 다음과 같이 옵션별로 다르게 판단합니다.
              </span>
            </li>
          </ul>
          <ul className="flex flex-col gap-2 mt-3 ml-5 text-sm text-gf-gray1">
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
                <strong className="text-gf-black">커스터마이징:</strong> 구매 전 카카오 채널을 통한
                상담 및 견적 협의 단계는 제공 개시 전으로 보며, 협의가 완료되어 담당자가 실제 디자인
                수정 작업에 착수하는 시점부터 제공이 개시된 것으로 봅니다.
              </span>
            </li>
          </ul>
          <ul className="flex flex-col gap-3 mt-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">③</span>
              <span>
                콘텐츠 또는 결과물 자체의 결함(회사 귀책 사유)으로 인한 경우에는 제작 진행 여부와
                관계없이 환불이 가능합니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">④</span>
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
                로 주문 번호와 함께 문의하시면 영업일 기준 3일 이내에 처리됩니다.
              </span>
            </li>
          </ul>
        </section>

        {/* 제9조 저작권 */}
        <section id="article-9" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">제9조 (저작권 및 이용 제한)</h2>
          <ul className="flex flex-col gap-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">①</span>
              <span>
                몰에서 판매되는 모든 디지털 콘텐츠의 저작권 및 지식재산권은 회사 또는 해당 콘텐츠
                제작자에게 귀속됩니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">②</span>
              <span>
                구매한 콘텐츠는 개인적·비상업적 용도에 한해 사용할 수 있습니다. 다음 행위는 엄격히
                금지됩니다.
              </span>
            </li>
          </ul>
          <ul className="flex flex-col gap-2 mt-3 ml-5 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>콘텐츠의 무단 복제, 배포, 전송 및 재판매</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>콘텐츠를 이용한 2차 저작물 생성 및 상업적 활용</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>구매 계정 외 타인과의 파일 공유</span>
            </li>
          </ul>
          <ul className="flex flex-col gap-3 mt-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">③</span>
              <span>
                다만, 상품 상세 페이지에 안내된 라이선스(저작권표시 CC BY 등)가 상업적 이용, 2차
                저작물 제작, 재배포를 명시적으로 허용하는 경우에는 해당 라이선스 조건이 전항에
                우선하여 적용됩니다.
              </span>
            </li>
          </ul>
        </section>

        {/* 제10조 책임 제한 */}
        <section id="article-10" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">제10조 (책임 제한)</h2>
          <ul className="flex flex-col gap-3 text-sm text-gf-gray1">
            <li className="flex gap-2">
              <span className="shrink-0">①</span>
              <span>
                회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중단, 제3자의 해킹 등 불가항력적
                사유로 인해 서비스를 제공할 수 없는 경우 서비스 제공에 대한 책임을 지지 않습니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">②</span>
              <span>
                회사는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">③</span>
              <span>
                회사는 이용자가 서비스를 이용하여 기대하는 수익을 얻지 못하거나 서비스를 통해 얻은
                자료로 인한 손해에 관하여 책임을 지지 않습니다.
              </span>
            </li>
          </ul>
        </section>

        {/* 제11조 분쟁 해결 */}
        <section id="article-11" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">제11조 (분쟁 해결)</h2>
          <p className="text-sm text-gf-gray1 leading-relaxed">
            회사와 이용자 사이에 발생한 전자상거래 분쟁과 관련하여 이용자의 피해 구제 신청이 있는
            경우에는 공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수
            있습니다.
          </p>
        </section>

        {/* 제12조 준거법 및 관할 법원 */}
        <section id="article-12" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">제12조 (준거법 및 관할 법원)</h2>
          <p className="text-sm text-gf-gray1 leading-relaxed">
            회사와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법을 준거법으로 하며, 회사의 본사
            소재지를 관할하는 법원을 합의 관할 법원으로 합니다.
          </p>
        </section>

        {/* 문의처 */}
        <section id="contact" className="scroll-mt-8">
          <h2 className="text-lg font-bold text-gf-black mb-4">문의처</h2>
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

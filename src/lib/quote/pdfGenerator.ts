/**
 * PDF 렌더링 전용 모듈.
 * html2canvas가 동적 생성 DOM에서 Tailwind 클래스를 안정적으로 처리할 수 없는
 * 오프스크린 환경이므로 style= 인라인 속성 사용이 불가피합니다.
 * 이 파일 외 모든 컴포넌트에서는 style= 사용이 금지됩니다.
 */
import type { QuoteWizardState, QuoteCalculationResult, QuoteLineBreakdown } from "@/types/quote.types";
import { formatKRW } from "./calculator";

export async function downloadQuotePdf(
  state: QuoteWizardState,
  breakdown: QuoteCalculationResult,
): Promise<void> {
  // 동적 import로 초기 번들에서 제외
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const el = buildPdfDom(state, breakdown);
  document.body.appendChild(el);

  try {
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let posY = 0;
    while (posY < imgHeight) {
      if (posY > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, -posY, imgWidth, imgHeight);
      posY += pageHeight;
    }

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    pdf.save(`가견적서_${state.contactInfo.name}_${timestamp}.pdf`);
  } finally {
    document.body.removeChild(el);
  }
}

function buildPdfDom(state: QuoteWizardState, breakdown: QuoteCalculationResult): HTMLElement {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  el.style.top = "0";
  el.style.width = "794px"; // A4 at 96dpi
  el.style.background = "#fff";
  el.style.fontFamily = "sans-serif";
  el.style.padding = "60px 56px";
  el.style.color = "#111";
  el.style.fontSize = "14px";
  el.style.lineHeight = "1.6";

  el.innerHTML = `
    <div style="border-bottom:3px solid #ff5500;padding-bottom:24px;margin-bottom:32px;">
      <p style="font-size:11px;font-weight:700;letter-spacing:.15em;color:#ff5500;text-transform:uppercase;margin:0 0 6px;">GOSPELFIX Design</p>
      <h1 style="font-size:28px;font-weight:800;margin:0 0 4px;">가견적서</h1>
      <p style="font-size:12px;color:#888;margin:0;">작성일: ${new Date().toLocaleDateString("ko-KR")}</p>
    </div>

    <section style="margin-bottom:28px;">
      <h2 style="font-size:13px;font-weight:700;letter-spacing:.08em;color:#ff5500;text-transform:uppercase;margin:0 0 12px;">의뢰인 정보</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="padding:6px 0;color:#666;width:120px;">이름</td><td style="padding:6px 0;font-weight:600;">${state.contactInfo.name}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">연락처</td><td style="padding:6px 0;">${state.contactInfo.contact}</td></tr>
        ${state.contactInfo.email ? `<tr><td style="padding:6px 0;color:#666;">이메일</td><td style="padding:6px 0;">${state.contactInfo.email}</td></tr>` : ""}
        ${state.contactInfo.businessNumber ? `<tr><td style="padding:6px 0;color:#666;">사업자/브랜드</td><td style="padding:6px 0;">${state.contactInfo.businessNumber}</td></tr>` : ""}
      </table>
    </section>

    <section style="margin-bottom:28px;">
      <h2 style="font-size:13px;font-weight:700;letter-spacing:.08em;color:#ff5500;text-transform:uppercase;margin:0 0 12px;">견적 내역</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f9f9f9;">
            <th style="padding:10px 12px;text-align:left;font-weight:600;border-bottom:1px solid #eee;">항목</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;border-bottom:1px solid #eee;">수량</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;border-bottom:1px solid #eee;">단가</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;border-bottom:1px solid #eee;">금액</th>
          </tr>
        </thead>
        <tbody>
          ${breakdown.lines
            .map(
              (item: QuoteLineBreakdown) => `
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">
                ${item.label}
                ${item.copywritingSubtotal > 0 ? '<span style="font-size:11px;color:#ff5500;margin-left:4px;">[카피라이팅 포함]</span>' : ""}
              </td>
              <td style="padding:10px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${item.quantity}</td>
              <td style="padding:10px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${formatKRW(item.unitPrice)}</td>
              <td style="padding:10px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${formatKRW(item.subtotal)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </section>

    <section style="background:#fff8f5;border-radius:12px;padding:20px 24px;margin-bottom:28px;border:1px solid #ffe0d0;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:15px;font-weight:700;">예상 합계</span>
        <span style="font-size:22px;font-weight:800;color:#ff5500;">${formatKRW(breakdown.total)}</span>
      </div>
      <p style="font-size:11px;color:#999;margin:8px 0 0;">VAT 별도 · 실제 금액은 상담 후 확정됩니다</p>
    </section>

    <section style="border-top:1px solid #eee;padding-top:20px;font-size:12px;color:#aaa;text-align:center;">
      <p style="margin:0;">본 견적서는 자동 산출된 가견적으로, 실제 작업 범위 및 난이도에 따라 변동될 수 있습니다.</p>
      <p style="margin:4px 0 0;">문의: 카카오톡 @gospelfix</p>
    </section>
  `;

  return el;
}

import type { PublicSellerIdentity } from "@/types/seller.types";

interface SellerIdentityBlockProps {
  identity: PublicSellerIdentity | null;
}

interface BusinessRowProps {
  label: string;
  value: string;
}

function BusinessRow({ label, value }: BusinessRowProps) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-gf-gray2">{label}</dt>
      <dd className="break-all text-gf-black">{value}</dd>
    </div>
  );
}

// 전자상거래법상 주문 전에 구매자에게 보여줘야 하는 판매자 신원정보.
// 사업자는 법정 표시 항목을, 개인은 확인 여부만 보이고 연락처 원문은 노출하지 않는다.
export function SellerIdentityBlock({ identity }: SellerIdentityBlockProps) {
  if (!identity) {
    return (
      <p className="rounded-xl border border-dashed p-3 text-xs text-gf-gray2">
        판매자 신원정보 확인 중입니다.
      </p>
    );
  }

  if (!identity.business) {
    return (
      <p className="rounded-xl border p-3 text-xs text-gf-gray2">
        {identity.verified
          ? "개인 판매자 · 휴대폰·이메일 확인 완료"
          : "개인 판매자 · 신원정보 확인 중입니다."}
      </p>
    );
  }

  const { business } = identity;
  return (
    <section aria-label="판매자 정보" className="rounded-xl border p-3 text-xs">
      <h3 className="mb-2 text-sm font-semibold text-gf-black">판매자 정보</h3>
      <dl className="space-y-1">
        <BusinessRow label="상호" value={business.name} />
        <BusinessRow label="대표자" value={business.representativeName} />
        <BusinessRow label="사업장 주소" value={business.address} />
        <BusinessRow label="전화번호" value={business.phone} />
        <BusinessRow label="사업자등록번호" value={business.businessNumber} />
        <BusinessRow label="통신판매업 신고" value={business.mailOrderReportNumber} />
      </dl>
    </section>
  );
}

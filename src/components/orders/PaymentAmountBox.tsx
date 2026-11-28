import { formatPrice } from "@/lib/utils";

interface PaymentAmountBoxProps {
  amount: number;
  // 부가세가 포함된 금액이면 그 부가세(0이면 표시 안 함). amount는 이미 부가세를 더한 총액이다
  vatAmount?: number;
  // 단건 결제에서만 넘기는 주문번호(입금자 확인용)
  orderNumber?: string;
  // 금액 아래 보조 문구(상품명, 상품 개수 등)
  note: string;
}

export default function PaymentAmountBox({
  amount,
  vatAmount = 0,
  orderNumber,
  note,
}: PaymentAmountBoxProps) {
  return (
    <div className="mb-5 rounded-xl bg-gf-orange-bg p-4">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-gf-orange">입금 금액</span>
        <span className="text-base font-bold text-gf-orange">{formatPrice(amount)}</span>
      </div>
      {vatAmount > 0 && (
        <p className="mt-1 text-right text-[11px] text-gf-orange2">
          공급가 {formatPrice(amount - vatAmount)} + 부가세 {formatPrice(vatAmount)} (VAT 포함)
        </p>
      )}
      {orderNumber && (
        <div className="mt-2 flex items-center justify-between text-[13px]">
          <span className="text-gf-orange">주문번호</span>
          <span className="font-mono font-bold tracking-widest text-gf-orange">{orderNumber}</span>
        </div>
      )}
      <p className="mt-2 text-[11px] text-gf-orange2">{note}</p>
    </div>
  );
}

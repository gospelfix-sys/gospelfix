import type { Metadata } from "next";
import TransferGuide from "@/components/orders/TransferGuide";

// 송금 정보는 URL fragment에만 있고 검색 노출 대상이 아니다
export const metadata: Metadata = {
  title: "송금 안내",
  robots: { index: false, follow: false },
};

export default function PayPage() {
  return <TransferGuide />;
}

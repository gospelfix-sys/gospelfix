import { RouteModalLoading } from "@/components/ui/RouteModalLoading";

// 블로그 모달은 다크 패널로 열리므로 로딩 패널도 같은 다크여야 한다. 슬롯 공용 loading.tsx는
// 상품 상세(라이트)와 같이 쓰여 테마를 모르니, 블로그 세그먼트에 전용 로딩을 둔다.
export default function BlogModalLoading() {
  return <RouteModalLoading theme="dark" />;
}

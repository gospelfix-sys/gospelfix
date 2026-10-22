"use client";

import { useEffect, useRef, useState } from "react";
import { Tab } from "@/components/ui/Tab";
import { cn } from "@/lib/utils";
import { MOCK_RESERVATIONS, RESERVATION_DEMO_STORAGE_KEY } from "@/lib/reservationDemo/mockData";
import type {
  MockReservation,
  ReservationChannel,
  ReservationStatus,
} from "@/types/reservationDemo.types";
import { ChatPanel } from "@/components/main/reservation-showcase/ChatPanel";
import { ReservationFormPanel } from "@/components/main/reservation-showcase/ReservationFormPanel";
import { ReservationFeedPanel } from "@/components/main/reservation-showcase/ReservationFeedPanel";
import { CustomerSearchPanel } from "@/components/main/reservation-showcase/CustomerSearchPanel";
import { NotificationPreview } from "@/components/main/reservation-showcase/NotificationPreview";

type LeftTab = "chat" | "form";
type RightTab = "feed" | "search";

interface ActiveNotification {
  id: string;
  customerName: string;
  text: string;
}

export function ReservationAiShowcase() {
  const [leftTab, setLeftTab] = useState<LeftTab>("chat");
  const [rightTab, setRightTab] = useState<RightTab>("feed");
  const [reservations, setReservations] = useState<MockReservation[]>(MOCK_RESERVATIONS);
  const [activeNotification, setActiveNotification] = useState<ActiveNotification | null>(null);
  const reservationIdRef = useRef(1);

  // 최초 렌더는 항상 시드 데이터(MOCK_RESERVATIONS)로 그려야 SSR 결과와 일치한다.
  // 로컬스토리지 값은 마운트 후 useEffect에서 읽어와 그 다음에만 덮어쓴다.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RESERVATION_DEMO_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MockReservation[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReservations(parsed);
          // 카운터가 항상 1부터 다시 시작하면, 복원된 예약이 이미 갖고 있던
          // "new-1", "new-2" 같은 id와 새로 발급되는 id가 충돌할 수 있다.
          const maxIssuedId = parsed.reduce((max, reservation) => {
            const match = /^new-(\d+)$/.exec(reservation.id);
            return match ? Math.max(max, Number(match[1])) : max;
          }, 0);
          reservationIdRef.current = maxIssuedId + 1;
        }
      }
    } catch {
      // 프라이빗 모드 등으로 localStorage 접근이 막혀도 시드 데이터로 데모는 계속 동작해야 한다
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // 저장된 값을 읽기도 전에 시드 데이터로 덮어쓰는 것을 방지
    try {
      window.localStorage.setItem(RESERVATION_DEMO_STORAGE_KEY, JSON.stringify(reservations));
    } catch {
      // 저장 실패는 데모 동작에 치명적이지 않으므로 무시
    }
  }, [reservations, hydrated]);

  function addReservation(
    data: { customerName: string; service: string; desiredTime: string },
    channel: ReservationChannel,
  ) {
    const newReservation: MockReservation = {
      id: `new-${reservationIdRef.current++}`,
      customerName: data.customerName,
      channel,
      service: data.service,
      requestedAt: "방금 접수",
      desiredTime: data.desiredTime,
      status: "pending",
    };
    setReservations((prev) => [newReservation, ...prev]);
  }

  function handleChatReservationConfirmed(data: {
    customerName: string;
    service: string;
    desiredTime: string;
  }) {
    addReservation(data, "chatbot");
  }

  // 취소되지 않은 예약 중 성함이 일치하는 것을 찾아 상태를 바꾼다 — 찾았는지 여부를
  // 반환해 챗봇이 "취소 처리됐어요"/"찾지 못했어요"를 구분해 답할 수 있게 한다.
  function handleChatReservationCancelled(customerName: string): boolean {
    const trimmed = customerName.trim();
    const target = reservations.find((r) => r.customerName === trimmed && r.status !== "cancelled");
    if (!target) return false;
    setReservations((prev) =>
      prev.map((r) => (r.id === target.id ? { ...r, status: "cancelled" } : r)),
    );
    return true;
  }

  // 취소 처리와 동일한 "성함으로 찾아 found 여부 반환" 패턴 — 찾으면 희망 일시를 새
  // 값으로 갱신하고 상태를 "changed"로 표시한다.
  function handleChatReservationChanged(customerName: string, newDesiredTime: string): boolean {
    const trimmed = customerName.trim();
    const target = reservations.find((r) => r.customerName === trimmed && r.status !== "cancelled");
    if (!target) return false;
    setReservations((prev) =>
      prev.map((r) =>
        r.id === target.id ? { ...r, desiredTime: newDesiredTime, status: "changed" } : r,
      ),
    );
    return true;
  }

  function handleFormSubmit(submission: {
    customerName: string;
    service: string;
    desiredTime: string;
  }) {
    addReservation(submission, "form");
  }

  function handleStatusChange(id: string, status: ReservationStatus) {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

    if (status === "confirmed") {
      const target = reservations.find((r) => r.id === id);
      if (target) {
        setActiveNotification({
          id: `notify-${id}-${Date.now()}`,
          customerName: target.customerName,
          text: `${target.desiredTime}에 뵙겠습니다!`,
        });
      }
    }
  }

  return (
    <section className="bg-gf-bg px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gf-orange/30 bg-gf-orange/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-gf-orange">
            <span className="h-[6px] w-[6px] shrink-0 animate-pulse rounded-full bg-gf-orange" />
            가스펄픽스 단독 기능
          </div>
          <h2 className="gf-section-title">
            흩어진 예약을, <span className="text-gf-orange">하나의 화면으로.</span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gf-gray2">
            카카오톡으로 오든, 홈페이지 폼으로 오든 모든 예약이 실시간으로 한 곳에 모입니다.
            아래에서 직접 눌러보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 좌: 입력 채널 — 카드 높이를 고정하고 flex-col로 감싸, 예약이 아무리 쌓여도
              카드가 늘어나지 않고 내부 스크롤로 처리되면서 입력창은 항상 맨 아래에 붙는다 */}
          <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-gf-border bg-white">
            <div role="tablist" className="flex shrink-0 border-b border-gf-border">
              <Tab
                active={leftTab === "chat"}
                onClick={() => setLeftTab("chat")}
                className={cn(
                  leftTab === "chat"
                    ? "border-gf-orange text-gf-orange"
                    : "border-transparent text-gf-gray2 hover:text-gf-black",
                )}
              >
                AI 챗봇
              </Tab>
              <Tab
                active={leftTab === "form"}
                onClick={() => setLeftTab("form")}
                className={cn(
                  leftTab === "form"
                    ? "border-gf-orange text-gf-orange"
                    : "border-transparent text-gf-gray2 hover:text-gf-black",
                )}
              >
                예약 문의 폼
              </Tab>
            </div>

            <div className={cn(leftTab === "chat" ? "flex min-h-0 flex-1 flex-col" : "hidden")}>
              <ChatPanel
                onReservationConfirmed={handleChatReservationConfirmed}
                onReservationCancelled={handleChatReservationCancelled}
                onReservationChanged={handleChatReservationChanged}
              />
            </div>
            <div className={cn(leftTab === "form" ? "min-h-0 flex-1 overflow-y-auto" : "hidden")}>
              <ReservationFormPanel onSubmit={handleFormSubmit} />
            </div>
          </div>

          {/* 우: 통합 대시보드 — 좌측과 동일한 고정 높이로 맞춘다 */}
          <div className="relative flex h-[520px] flex-col overflow-hidden rounded-2xl border border-gf-border bg-white">
            <div role="tablist" className="flex shrink-0 border-b border-gf-border">
              <Tab
                active={rightTab === "feed"}
                onClick={() => setRightTab("feed")}
                className={cn(
                  rightTab === "feed"
                    ? "border-gf-orange text-gf-orange"
                    : "border-transparent text-gf-gray2 hover:text-gf-black",
                )}
              >
                통합 예약 현황
              </Tab>
              <Tab
                active={rightTab === "search"}
                onClick={() => setRightTab("search")}
                className={cn(
                  rightTab === "search"
                    ? "border-gf-orange text-gf-orange"
                    : "border-transparent text-gf-gray2 hover:text-gf-black",
                )}
              >
                고객 검색
              </Tab>
            </div>

            <div className={cn(rightTab === "feed" ? "min-h-0 flex-1 overflow-y-auto" : "hidden")}>
              <ReservationFeedPanel
                reservations={reservations}
                onStatusChange={handleStatusChange}
              />
            </div>
            <div
              className={cn(rightTab === "search" ? "min-h-0 flex-1 overflow-y-auto" : "hidden")}
            >
              <CustomerSearchPanel reservations={reservations} />
            </div>

            {activeNotification && (
              <NotificationPreview
                key={activeNotification.id}
                customerName={activeNotification.customerName}
                text={activeNotification.text}
                onExpire={() => setActiveNotification(null)}
              />
            )}
          </div>
        </div>

        {/* 좌/우 패널이 각각 무엇을 시뮬레이션하는지 안내 — 실제 로그인 분리된 관리자
            페이지가 아니라 데모용으로 한 화면에 나란히 배치했다는 점을 명시 */}
        <p className="mt-6 text-center text-xs text-gf-gray2">
          왼쪽은 <strong className="font-bold text-gf-black">고객이 예약을 넣는 화면</strong>,
          오른쪽은 <strong className="font-bold text-gf-black">사장님이 확인하는 화면</strong>을
          체험해보는 데모입니다. 실제 서비스에서는 로그인한 사장님만 오른쪽 화면에 접근할 수 있어요.
          <br />
          챗봇에서 예약을 마치면 실제 이름·시간이 그대로 저장돼요 — 새로고침해도 유지됩니다.
        </p>
      </div>
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/input";
import {
  detectService,
  matchGeneralReply,
  type BookingStep,
} from "@/lib/reservationDemo/chatRules";
import type { ChatMessage } from "@/types/reservationDemo.types";

const BRAND_NAME = "GOSPELFIX";
const BRAND_TAGLINE = "예약 문의를 놓치지 않는 AI 시스템";

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "ai-0", role: "ai", text: `안녕하세요\n${BRAND_NAME} 입니다.` },
  { id: "ai-1", role: "ai", text: `${BRAND_NAME} AI 예약 시스템에 대해서 궁금한 걸 물어보세요.` },
];

// chatRules.ts의 CHAT_RULES 키워드에 그대로 매칭되는 문구만 사용 — 눌렀을 때 실제로
// 규칙 매칭된 답변이 나와야 데모가 "작동하는 것처럼" 보인다.
const QUICK_REPLIES = [
  "상담신청 하기",
  "예약하고 싶어요",
  "가맹점 문의",
  "창업비용",
  "예약 가능한 시간",
  "예약 변경하고 싶어요",
  "예약 취소하고 싶어요",
];

interface ReservationConfirmation {
  customerName: string;
  service: string;
  desiredTime: string;
}

interface ChatPanelProps {
  onReservationConfirmed: (data: ReservationConfirmation) => void;
  // 성함으로 기존 예약을 찾아 취소 처리하고, 찾았는지 여부를 반환한다 — 답변 문구가
  // "취소 처리됐어요" / "찾지 못했어요"로 갈리는 기준이 된다.
  onReservationCancelled: (customerName: string) => boolean;
  // 성함으로 기존 예약을 찾아 희망 일시를 갱신하고, 찾았는지 여부를 반환한다 —
  // onReservationCancelled와 동일한 "found 여부로 답변 분기" 패턴이다.
  onReservationChanged: (customerName: string, newDesiredTime: string) => boolean;
}

export function ChatPanel({
  onReservationConfirmed,
  onReservationCancelled,
  onReservationChanged,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>("idle");
  const messageIdRef = useRef(1);
  // 대화 도중 모은 슬롯 값 — bookingStep이 idle로 돌아오면 함께 리셋된다.
  const pendingBookingRef = useRef<{ service: string | null; desiredTime: string }>({
    service: null,
    desiredTime: "",
  });
  const pendingChangeRef = useRef<{ desiredTime: string }>({ desiredTime: "" });

  // 입력창 전송과 퀵리플라이 칩 클릭이 같은 전송 로직을 타도록 공통 함수로 뺐다.
  function sendText(text: string) {
    if (!text || isTyping) return;

    const userMessage: ChatMessage = { id: `msg-${messageIdRef.current++}`, role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      let reply: string;
      // 매출/순이익처럼 답변 뒤에 "참고용 정보" 디스클레이머 등 두 번째 말풍선이 필요한
      // 규칙에서만 채워진다 — 대부분의 응답은 한 개 말풍선으로 끝난다.
      let followUp: string | undefined;

      if (bookingStep === "awaiting_datetime") {
        pendingBookingRef.current.desiredTime = text;
        reply = "성함이 어떻게 되세요?";
        setBookingStep("awaiting_name");
      } else if (bookingStep === "awaiting_name") {
        const { service, desiredTime } = pendingBookingRef.current;
        onReservationConfirmed({
          customerName: text,
          service: service ?? "예약 문의",
          desiredTime,
        });
        reply = `확인했습니다! ${text}님, ${desiredTime}으로 예약 접수됐어요. 오른쪽 통합 현황에서 확인해보세요 →`;
        pendingBookingRef.current = { service: null, desiredTime: "" };
        setBookingStep("idle");
      } else if (bookingStep === "awaiting_cancel_name") {
        const found = onReservationCancelled(text);
        if (found) {
          reply = `확인했습니다! ${text}님의 예약이 취소 처리됐어요. 오른쪽 통합 현황에서 확인해보세요 →`;
          setBookingStep("idle");
        } else {
          // 못 찾았을 땐 idle로 돌아가지 않고 같은 단계에 머물러, 성함을 다시 입력받는다.
          reply = `'${text}'님 성함으로 등록된 예약을 찾지 못했어요. 예약하신 성함을 다시 알려주시겠어요?`;
        }
      } else if (bookingStep === "awaiting_change_datetime") {
        pendingChangeRef.current.desiredTime = text;
        reply = "성함이 어떻게 되세요?";
        setBookingStep("awaiting_change_name");
      } else if (bookingStep === "awaiting_change_name") {
        const { desiredTime } = pendingChangeRef.current;
        const found = onReservationChanged(text, desiredTime);
        if (found) {
          reply = `확인했습니다! ${text}님의 예약이 ${desiredTime}으로 변경됐어요. 오른쪽 통합 현황에서 확인해보세요 →`;
          pendingChangeRef.current = { desiredTime: "" };
          setBookingStep("idle");
        } else {
          // 취소 흐름과 동일하게, 못 찾았을 땐 같은 단계에 머물러 성함을 다시 받는다.
          reply = `'${text}'님 성함으로 등록된 예약을 찾지 못했어요. 예약하신 성함을 다시 알려주시겠어요?`;
        }
      } else {
        const matched = matchGeneralReply(text);
        reply = matched.reply;
        followUp = matched.followUp;
        if (matched.startsBookingFlow) {
          pendingBookingRef.current.service = detectService(text);
          setBookingStep("awaiting_datetime");
        } else if (matched.startsCancelFlow) {
          setBookingStep("awaiting_cancel_name");
        } else if (matched.startsChangeFlow) {
          setBookingStep("awaiting_change_datetime");
        }
      }

      const aiMessages: ChatMessage[] = [
        { id: `msg-${messageIdRef.current++}`, role: "ai", text: reply },
      ];
      if (followUp) {
        aiMessages.push({ id: `msg-${messageIdRef.current++}`, role: "ai", text: followUp });
      }
      setMessages((prev) => [...prev, ...aiMessages]);
      setIsTyping(false);
    }, 800);
  }

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    sendText(text);
  }

  // 인사말 2개 이후로 아직 아무 대화도 없을 때만 노출 — 대화가 시작되면 칩 대신
  // 문맥에 맞는 답변 흐름에 집중하게 한다.
  const showQuickReplies = messages.length === INITIAL_MESSAGES.length && !isTyping;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="log"
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4"
      >
        {/* 브랜드 인트로 — 접속 직후 중앙에 로고/브랜드명이 먼저 보이는 레이어 UI 참고 */}
        <div className="flex flex-col items-center gap-2 pb-3 pt-1 text-center">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-gf-border bg-gf-black">
            <Image src="/logo_gbk.webp" alt="" fill sizes="56px" className="object-cover" />
          </div>
          <p className="text-sm font-black text-gf-black">{BRAND_NAME}</p>
          <p className="text-xs text-gf-gray2">{BRAND_TAGLINE}</p>
        </div>

        {messages.map((message) =>
          message.role === "ai" ? (
            <div key={message.id} className="flex max-w-[85%] items-end gap-2 self-start">
              <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-gf-border bg-gf-black">
                <Image src="/logo_gbk.webp" alt="" fill sizes="24px" className="object-cover" />
              </div>
              <div className="whitespace-pre-line rounded-2xl rounded-bl-sm border border-gf-border bg-gf-bg px-3.5 py-2 text-sm leading-relaxed text-gf-black">
                {message.text}
              </div>
            </div>
          ) : (
            <div
              key={message.id}
              className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-gf-orange px-3.5 py-2 text-sm leading-relaxed text-white"
            >
              {message.text}
            </div>
          ),
        )}

        {isTyping && (
          <div className="flex items-center gap-1 self-start rounded-2xl rounded-bl-sm border border-gf-border bg-gf-bg px-3.5 py-2.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gf-gray2 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gf-gray2 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gf-gray2" />
          </div>
        )}

        {showQuickReplies && (
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_REPLIES.map((item) => (
              <Chip
                key={item}
                onClick={() => sendText(item)}
                className="shrink-0 border-gf-border bg-white px-3.5 py-2 text-xs font-semibold text-gf-black hover:border-gf-orange hover:text-gf-orange"
              >
                {item}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-gf-border p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // 한글 등 IME 조합 중 Enter는 조합 확정용이라, 이때 전송하면 아직
            // 조합 중이던 마지막 글자가 비워진 입력창에 다시 끼어들어 남는다.
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="예약 문의를 입력해보세요 (예: 예약하고 싶어요)"
          aria-label="AI 챗봇에게 메시지 보내기"
          className="h-10"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!draft.trim() || isTyping}
          aria-label="메시지 전송"
          className="h-10 w-10 shrink-0 rounded-full"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

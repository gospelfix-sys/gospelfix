"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/Chip";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import LegalDialogTrigger from "@/components/legal/LegalDialogTrigger";
import { submitQuoteChatAction } from "@/app/actions/submitQuoteChatAction";
import { cn } from "@/lib/utils";
import {
  CHAT_STEPS,
  EXCLUSIVE_FEATURE_LABELS,
  getNextStep,
  type ChatStepId,
} from "@/components/quote/chat/chatFlow";

const BRAND_NAME = "GOSPELFIX";
const BRAND_TAGLINE = "빠르고 정확한 홈페이지 제작";

// 휴대폰 번호만 받는 단순한 입력이라 Step04ContactInfo.tsx의 카카오 ID 분기는 가져오지
// 않고, 숫자만 추출해 010-1234-5678 형태로 포맷팅하는 부분만 재사용한다.
function formatPhoneNumber(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

interface ChatTurn {
  id: string;
  role: "ai" | "user";
  text: string;
}

interface ChatAnswers {
  purpose: string | null;
  format: string | null;
  pageCount: string | null;
  showcase: string | null;
}

const INITIAL_ANSWERS: ChatAnswers = {
  purpose: null,
  format: null,
  pageCount: null,
  showcase: null,
};

// 대화창 상단 중앙에 브랜드 로고·이름·태그라인을 보여주는 블록 (카카오 채널형 채팅 UI)
function ChatBrandHeader({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 pb-2 pt-6 text-center", className)}>
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-gf-border bg-gf-black">
        <Image
          src="/logo_gbk.webp"
          alt={`${BRAND_NAME} 로고`}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <DialogTitle className="text-lg font-extrabold text-gf-black">{BRAND_NAME}</DialogTitle>
      <p className="text-xs text-gf-gray2">{BRAND_TAGLINE}</p>
    </div>
  );
}

// AI가 답변을 "작성 중"임을 보여주는 점 세 개 말풍선
function TypingBubble() {
  return (
    <div className="flex max-w-[90%] items-end gap-2 self-start" role="status" aria-label="작성 중">
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gf-border bg-gf-black">
        <Image src="/logo_gbk.webp" alt="" fill sizes="32px" className="object-cover" />
      </div>
      <div className="flex items-center gap-1 rounded-3xl border border-gf-border bg-gf-bg px-4 py-4">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gf-gray2" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gf-gray2 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gf-gray2 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

// 입력창으로 보낸 메시지에 대한 안내 (버튼 선택 유도)
const BUTTON_GUIDE_MESSAGE =
  "직접 대화하는 기능은 아직 준비 중이에요 🙏\n아래 버튼을 눌러 선택해주시면 바로 안내해드릴게요!";

// 사용자 선택 후 AI 답변이 나타나기까지의 지연(ms)
const AI_TYPING_DELAY_MS = 900;

interface QuoteChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuoteChatModal({ open, onOpenChange }: QuoteChatModalProps) {
  const [started, setStarted] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([
    { id: "ai-purpose", role: "ai", text: CHAT_STEPS.purpose.question },
  ]);
  const [step, setStep] = useState<ChatStepId>("purpose");
  const [answers, setAnswers] = useState<ChatAnswers>(INITIAL_ANSWERS);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [nameValue, setNameValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [typing, setTyping] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const turnIdRef = useRef(0);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, typing]);

  // 언마운트 시 대기 중인 AI 답변 타이머 정리
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  function resetChat() {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setTyping(false);
    setChatInput("");
    setStarted(false);
    setTurns([{ id: "ai-purpose", role: "ai", text: CHAT_STEPS.purpose.question }]);
    setStep("purpose");
    setAnswers(INITIAL_ANSWERS);
    setSelectedFeatures([]);
    setNameValue("");
    setPhoneValue("");
    setAgreedPrivacy(false);
    setDetailsOpen(false);
    setSubmitting(false);
    turnIdRef.current = 0;
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetChat();
    onOpenChange(next);
  }

  function nextTurnId(prefix: string) {
    turnIdRef.current += 1;
    return `${prefix}-${turnIdRef.current}`;
  }

  function handleSelectOption(label: string) {
    if (typing) return;
    let updatedAnswers: ChatAnswers = answers;
    if (step === "purpose" || step === "format" || step === "pageCount" || step === "showcase") {
      updatedAnswers = { ...answers, [step]: label };
    }
    setAnswers(updatedAnswers);

    const nextStepId = getNextStep(step, updatedAnswers.format);
    setStep(nextStepId);

    setTurns((prev) => [...prev, { id: nextTurnId("user"), role: "user", text: label }]);

    if (nextStepId === "done" || nextStepId === "result") return;

    queueAiTurn(CHAT_STEPS[nextStepId].question);
  }

  // 바로 답하지 않고 "작성 중" 말풍선을 보여준 뒤 AI 말풍선을 추가한다.
  function queueAiTurn(text: string) {
    setTyping(true);
    const aiTurnId = nextTurnId("ai");
    typingTimerRef.current = setTimeout(() => {
      setTurns((prev) => [...prev, { id: aiTurnId, role: "ai", text }]);
      setTyping(false);
    }, AI_TYPING_DELAY_MS);
  }

  // 이 챗봇은 버튼 선택으로 진행하는 흐름이라 입력창은 보조 수단이다. 입력한 내용은 답변으로
  // 쓰지 않고, AI가 버튼 선택을 안내한다.
  function handleSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || typing) return;
    setChatInput("");
    setTurns((prev) => [...prev, { id: nextTurnId("user"), role: "user", text }]);
    queueAiTurn(BUTTON_GUIDE_MESSAGE);
  }

  function toggleFeature(label: string) {
    setSelectedFeatures((prev) => {
      if (EXCLUSIVE_FEATURE_LABELS.includes(label)) {
        return prev.includes(label) ? [] : [label];
      }
      const withoutExclusive = prev.filter((f) => !EXCLUSIVE_FEATURE_LABELS.includes(f));
      return withoutExclusive.includes(label)
        ? withoutExclusive.filter((f) => f !== label)
        : [...withoutExclusive, label];
    });
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhoneValue(formatPhoneNumber(e.target.value.replace(/\D/g, "")));
  }

  const phoneDigits = phoneValue.replace(/\D/g, "");
  const canSubmitResult =
    nameValue.trim().length > 0 && phoneDigits.length >= 10 && agreedPrivacy && !submitting;

  async function handleSubmitResult() {
    if (!canSubmitResult) return;

    setSubmitting(true);
    try {
      await submitQuoteChatAction({
        purpose: answers.purpose ?? "",
        format: answers.format ?? "",
        pageCount: answers.pageCount,
        showcase: answers.showcase ?? "",
        features: selectedFeatures,
        contactName: nameValue.trim(),
        contactValue: phoneValue,
      });
      setStep("done");
      toast.success("상담 신청이 접수됐어요.");
    } catch {
      toast.error("접수에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  const currentOptions =
    !typing &&
    (step === "purpose" || step === "format" || step === "pageCount" || step === "showcase")
      ? CHAT_STEPS[step].options
      : null;

  const summaryLines = [
    answers.purpose,
    answers.format,
    answers.pageCount,
    answers.showcase,
    selectedFeatures.length > 0 ? selectedFeatures.join(", ") : null,
  ].filter((line): line is string => Boolean(line));

  const chatActive = started && step !== "result" && step !== "done";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[min(680px,85vh)] flex-col gap-0 p-0 sm:max-w-md">
        {!chatActive && <ChatBrandHeader className="shrink-0 border-b border-gf-border pb-4" />}

        {!started ? (
          <div key="intro" className="flex min-h-0 flex-1 flex-col justify-between p-5">
            <p className="whitespace-pre-line text-lg font-bold leading-relaxed text-gf-black">
              {`안녕하세요 👋\n홈페이지 제작이 궁금하신가요?\n\n몇 가지만 선택하면 담당 매니저가 더 빠르고\n정확하게 상담해드릴 수 있어요.\n약 30초 정도면 충분해요!`}
            </p>
            <Button
              type="button"
              size="lg"
              onClick={() => setStarted(true)}
              className="h-14 w-full rounded-2xl text-base font-bold"
            >
              AI 견적 상담 시작하기
            </Button>
          </div>
        ) : step === "result" || step === "done" ? (
          // key로 화면 단위를 구분해야 채팅 → 결과 전환 시 DOM이 재사용되어 스크롤 위치가 남지 않는다.
          <div key="result" className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
            {step === "done" ? (
              <p className="whitespace-pre-line text-base font-semibold leading-relaxed text-gf-black">
                {"신청이 접수됐어요! 🙌\n입력하신 번호로 담당 매니저가 곧 연락드릴게요."}
              </p>
            ) : (
              <>
                <div>
                  <h3 className="text-xl font-extrabold text-gf-black">
                    예상 견적이 준비됐어요! 🎉
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gf-gray2">
                    {
                      "선택해주신 내용을 바탕으로 담당 매니저가 맞춤 견적을 안내해드릴게요.\n\n견적을 받아보실 이름과 휴대폰 번호를 입력해주세요."
                    }
                  </p>
                </div>

                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  placeholder="이름"
                  aria-label="이름"
                  className="h-11"
                />

                <Input
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  placeholder="010 - 0000 - 0000"
                  aria-label="휴대폰 번호"
                  className="h-11"
                />

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gf-black">
                    <Checkbox checked={agreedPrivacy} onCheckedChange={setAgreedPrivacy} />
                    [필수] 개인정보 수집 및 이용 동의
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDetailsOpen((prev) => !prev)}
                    className="h-auto w-full justify-start rounded-lg px-3 py-2 text-left text-xs font-normal text-gf-gray2"
                  >
                    {detailsOpen ? "▼" : "▶"} 수집·이용 내용 자세히 보기
                  </Button>
                  {detailsOpen && (
                    <div className="flex flex-col gap-2 rounded-lg bg-gf-bg p-3 text-xs leading-relaxed text-gf-gray2">
                      <p>
                        <span className="font-semibold text-gf-black">수집 목적</span>
                        <br />
                        홈페이지 제작 간편 견적 상담 안내
                      </p>
                      <p>
                        <span className="font-semibold text-gf-black">수집 항목</span>
                        <br />
                        이름, 휴대전화번호, 제작 목적, 홈페이지 형태, 페이지 수, 필요 기능
                      </p>
                      <p>
                        <span className="font-semibold text-gf-black">동의 거부</span>
                        <br />
                        동의하지 않으셔도 되지만, 거부 시 견적 상담 연락을 드릴 수 없어요.
                      </p>
                      <LegalDialogTrigger
                        type="privacy"
                        className="self-start text-gf-orange underline underline-offset-2"
                      >
                        전체 개인정보처리방침 보기
                      </LegalDialogTrigger>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-gf-bg p-4">
                  <p className="mb-2 text-xs font-semibold text-gf-gray2">내 홈페이지 예상 구성</p>
                  <div className="flex flex-col gap-1">
                    {summaryLines.map((line) => (
                      <p key={line} className="text-sm font-bold text-gf-orange">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                <p className="text-center text-xs text-gf-gray2">
                  ⓘ 상세 견적 안내를 위해 담당자가 연락드릴 수 있습니다.
                </p>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("features")}
                    disabled={submitting}
                    aria-label="이전 단계로 돌아가기"
                    className="h-14 shrink-0 gap-1 rounded-2xl px-5 text-base font-bold"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    이전
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmitResult}
                    disabled={!canSubmitResult}
                    className="h-14 min-w-0 flex-1 rounded-2xl text-base font-bold"
                  >
                    {submitting ? "접수 중..." : "내 예상 견적 문자로 받기"}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div
              key="chat"
              ref={scrollRef}
              role="log"
              aria-live="polite"
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5"
            >
              <ChatBrandHeader className="pb-4" />
              {turns.map((turn) =>
                turn.role === "ai" ? (
                  <div key={turn.id} className="flex max-w-[90%] items-end gap-2 self-start">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gf-border bg-gf-black">
                      <Image
                        src="/logo_gbk.webp"
                        alt=""
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    <div className="whitespace-pre-line rounded-3xl border border-gf-border bg-gf-bg px-4 py-3 text-[15px] leading-relaxed text-gf-black">
                      {turn.text}
                    </div>
                  </div>
                ) : (
                  <div
                    key={turn.id}
                    className="max-w-[85%] self-end break-words rounded-3xl bg-gf-orange px-4 py-3 text-[15px] leading-relaxed text-white"
                  >
                    {turn.text}
                  </div>
                ),
              )}

              {typing && <TypingBubble />}

              {currentOptions && (
                <div className="flex flex-wrap gap-2 pl-10">
                  {currentOptions.map((option) => (
                    <Chip
                      key={option.label}
                      onClick={() => handleSelectOption(option.label)}
                      className="shrink-0 rounded-full border-gf-border bg-white px-4 py-2.5 text-sm font-bold text-gf-black hover:border-gf-orange hover:text-gf-orange"
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              )}

              {step === "features" && !typing && (
                <div className="flex flex-col gap-3 pl-10">
                  <div className="flex flex-wrap gap-2">
                    {CHAT_STEPS.features.options.map((option) => {
                      const active = selectedFeatures.includes(option.label);
                      return (
                        <Chip
                          key={option.label}
                          active={active}
                          onClick={() => toggleFeature(option.label)}
                          className={cn(
                            "shrink-0 rounded-full border-gf-border bg-white px-4 py-2.5 text-sm font-bold text-gf-black hover:border-gf-orange hover:text-gf-orange",
                            active && "border-gf-orange bg-gf-orange-bg text-gf-orange",
                          )}
                        >
                          {option.label}
                        </Chip>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    onClick={() => setStep(getNextStep("features", answers.format))}
                    disabled={selectedFeatures.length === 0}
                    className="h-14 w-full rounded-2xl text-base font-bold"
                  >
                    예상 견적 확인하기
                  </Button>
                </div>
              )}
            </div>

            {/* 하단 고정 입력창 */}
            <form
              onSubmit={handleSendMessage}
              className="flex shrink-0 items-center gap-2 border-t border-gf-border bg-white p-3"
            >
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="아래 버튼을 선택해주세요"
                aria-label="메시지 입력"
                maxLength={100}
                disabled={typing}
                className="h-12 rounded-full px-4 text-[15px]"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!chatInput.trim() || typing}
                aria-label="메시지 보내기"
                className="h-12 w-12 shrink-0 rounded-full"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

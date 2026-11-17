"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { normalizeLicense } from "@/components/upload/uploadEditorUtils";
import {
  COMMERCIAL_LICENSE,
  isLicenseAllowed,
  LICENSE_OPTIONS,
  type LicenseAcknowledgement,
} from "@/types/product.types";
import { cn } from "@/lib/utils";

interface LicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceType: "free" | "paid";
  // 템플릿·코드 작품 여부 — true면 변경금지(CC BY-NC-ND)를 선택할 수 없다.
  isCodeWork: boolean;
  draftLicense: string;
  onDraftLicenseChange: (value: string) => void;
  onConfirm: (license: string, acknowledgement: LicenseAcknowledgement) => void;
}

// 안내 한 줄을 이루는 조각. { strong }은 판매자가 놓치면 안 되는 핵심 문구라 굵게 표시한다.
// JSX 대신 데이터로 두는 이유: 동의 문구 버전과 대조할 때 이어 붙인 텍스트가 곧 표시 문구가 되도록.
type GuideSegment = string | { strong: string };

interface Acknowledgement {
  text: string;
  // 판매자가 동의 전에 무엇을 확인해야 하는지 펼쳐 볼 수 있는 안내. 없으면 체크박스만 표시한다.
  guide?: GuideSegment[][];
}

const segmentText = (segment: GuideSegment) =>
  typeof segment === "string" ? segment : segment.strong;

// 제3자 소재의 권리 확인은 등록하는 판매자가 한다.
// 회사의 책임 범위나 처리 절차는 약관·운영 정책에서 정하므로 이 안내 문구에는 적지 않는다.
//
// 동의 기록에 함께 저장되는 안내 문구 버전. 판매자가 "어떤 문구에 동의했는지"를 버전으로
// 특정하므로, 아래 ACKNOWLEDGEMENTS(펼침 안내 포함)나 LICENSE_OPTIONS 설명을 바꾸면 반드시
// 변경일로 올린다. 과거 문구는 git 이력으로 버전과 대조한다.
export const LICENSE_ACKNOWLEDGEMENT_VERSION = "2026-11-17";

const ACKNOWLEDGEMENTS: Acknowledgement[] = [
  {
    text: "사용한 폰트·이미지·오픈소스의 재배포 권리를 확인했습니다.",
    guide: [
      [
        "직접 만들었거나, 판매 상품에 넣어 ",
        { strong: "다른 사람에게 배포해도 된다고 허락받은 소재만" },
        " 사용해 주세요.",
      ],
      [
        "폰트: '상업적 이용 가능'만으로는 부족할 수 있습니다. ",
        { strong: "판매 파일 안에 폰트 파일을 함께 넣어 배포해도 되는지" },
        " 폰트 라이선스에서 확인하세요. 허용되지 않으면 ",
        { strong: "폰트 파일은 빼고" },
        ", 폰트 이름과 받을 수 있는 곳만 안내해 주세요.",
      ],
      [
        "이미지·아이콘·일러스트·목업·사진: 출처와 라이선스를 확인하세요. 무료·스톡 소재는 '내 작업물에 사용'은 허용해도, ",
        { strong: "템플릿이나 원본 파일로 다시 판매·배포하는 것은 금지" },
        "하는 경우가 많습니다.",
      ],
      [
        "오픈소스: GPL 등 일부 라이선스는 다시 배포할 때 ",
        { strong: "소스 코드 공개나 같은 라이선스 적용을 요구" },
        "해 선택한 판매 라이선스와 맞지 않을 수 있습니다. 라이선스 조건과 ",
        { strong: "저작권 표시 의무" },
        "를 확인하세요.",
      ],
      [
        "다른 회사의 로고·상표나 알아볼 수 있는 인물 사진은 ",
        { strong: "해당 권리자의 허락이 필요" },
        "할 수 있습니다.",
      ],
      [
        "가스펄픽스는 판매자가 작품을 등록해 판매하는 마켓입니다. 등록한 소재가 다른 사람의 권리를 침해하면 그 책임은 ",
        { strong: "기본적으로 소재를 등록한 판매자에게" },
        " 있습니다.",
      ],
    ],
  },
  { text: "선택한 라이선스를 이해했습니다." },
];

export function LicenseDialog({
  open,
  onOpenChange,
  priceType,
  isCodeWork,
  draftLicense,
  onDraftLicenseChange,
  onConfirm,
}: LicenseDialogProps) {
  const isFree = priceType === "free";
  const [checked, setChecked] = useState<boolean[]>(() => ACKNOWLEDGEMENTS.map(() => false));

  // 열 때마다 동의를 초기화한다 — 라이선스는 철회가 불가능해 매번 다시 확인받는다.
  useEffect(() => {
    if (open) setChecked(ACKNOWLEDGEMENTS.map(() => false));
  }, [open]);

  const canConfirm = !!draftLicense && checked.every(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">라이선스 설정</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {LICENSE_OPTIONS.map((option) => {
            const selected = option.value === draftLicense;
            // 유료는 상용 라이선스만, 무료는 CC만 선택 가능하다. 무료여도 템플릿·코드에는 ND 불가.
            const wrongPriceType = !isLicenseAllowed(option.value, isFree);
            const blockedByCode = option.value === "cc-by-nc-nd" && isCodeWork;
            const disabled = wrongPriceType || blockedByCode;
            // 해당 가격 유형에서 쓸 수 없는 옵션은 숨기지 않고 사유를 보여 준다.
            const disabledReason = wrongPriceType
              ? option.value === COMMERCIAL_LICENSE
                ? "(무료 상품에는 적용 불가)"
                : "(유료 상품에는 적용 불가)"
              : blockedByCode
                ? "(템플릿·코드에는 선택 불가)"
                : null;
            return (
              <div
                key={option.value}
                role="radio"
                aria-checked={selected}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onClick={() => {
                  if (disabled) return;
                  onDraftLicenseChange(option.value);
                }}
                onKeyDown={(e) => {
                  if (disabled) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onDraftLicenseChange(option.value);
                  }
                }}
                className={cn(
                  "flex items-start justify-between gap-4 rounded-xl p-4",
                  selected ? "border-2 border-gf-orange" : "border border-gf-border",
                  disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
              >
                <div className="space-y-1">
                  <p className="font-bold text-gf-black">
                    {option.label}
                    {disabledReason && (
                      <span className="ml-2 text-xs font-normal text-gf-gray2">
                        {disabledReason}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gf-gray1">{option.description}</p>
                </div>
                {selected && (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gf-orange text-white">
                    <Check className="size-4" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          {ACKNOWLEDGEMENTS.map(({ text, guide }, index) => (
            <div key={text} className="space-y-1.5">
              <label className="flex cursor-pointer items-start gap-2 text-sm text-gf-black">
                <Checkbox
                  checked={checked[index]}
                  onCheckedChange={(value) =>
                    setChecked((prev) => prev.map((c, i) => (i === index ? value : c)))
                  }
                  className="mt-0.5"
                />
                <span>{text}</span>
              </label>
              {/* label 밖에 둔다 — 안에 두면 안내를 펼칠 때 체크박스까지 토글돼 읽지 않고 동의하게 된다. */}
              {guide && (
                <details className="group ml-6 rounded-lg bg-gf-bg px-3 py-2 text-xs text-gf-gray1">
                  <summary className="flex cursor-pointer list-none items-center gap-1 font-bold text-gf-black [&::-webkit-details-marker]:hidden">
                    확인할 항목 보기
                    <ChevronDown className="size-3.5 group-open:rotate-180" />
                  </summary>
                  <ul className="mt-2 list-disc space-y-1.5 pl-4 leading-relaxed">
                    {guide.map((segments) => (
                      <li key={segments.map(segmentText).join("")}>
                        {segments.map((segment, i) =>
                          typeof segment === "string" ? (
                            segment
                          ) : (
                            <strong key={i} className="font-bold text-gf-black">
                              {segment.strong}
                            </strong>
                          ),
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="bg-gf-white sm:justify-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-full bg-gf-bg px-6 font-bold text-gf-black hover:bg-gf-border"
          >
            취소
          </Button>
          <Button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              const license = normalizeLicense(draftLicense, isFree);
              onConfirm(license, {
                license,
                version: LICENSE_ACKNOWLEDGEMENT_VERSION,
                agreed_at: new Date().toISOString(),
              });
              onOpenChange(false);
            }}
            className="h-11 rounded-full px-6 font-bold"
          >
            선택
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

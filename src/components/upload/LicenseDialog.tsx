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
  isLicenseAllowed,
  LICENSE_OPTIONS,
  SERVICE_DELIVERY_LICENSE,
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
// 특정하므로, 아래 ACKNOWLEDGEMENTS·SERVICE_DELIVERY_ACKNOWLEDGEMENT(펼침 안내 포함)나
// LICENSE_OPTIONS 설명을 바꾸면 반드시 변경일로 올린다. 같은 날 다시 바꾸면 "-2", "-3"을 붙인다
// (cms.api는 40자 이하 문자열만 받는다). 과거 문구는 git 이력으로 버전과 대조한다.
export const LICENSE_ACKNOWLEDGEMENT_VERSION = "2026-11-17-4";

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

// 제작·납품 서비스를 고를 때만 추가로 받는 확인. 이 구분은 이용 조건을 상품 설명·구매 옵션에
// 위임하므로, 설명이 비어 있으면 조건이 모호해져 구매자에게 유리하게 해석되거나(약관규제법
// 제5조②, 일반 지식 기반) 청약철회 제한을 주장할 수 없게 된다. 용역은 제공이 시작되면 철회가
// 제한될 수 있지만(전자상거래법 제17조②5호), 그 사실을 미리 명확히 표시해야 효력이 있다.
// 판매자가 등록 시점에 조건을 적었는지 스스로 확인하게 한다 — 환불 문구 자체를 대신 써 주지 않는다.
// 결과물 권리는 "판매자 저작권 유지 + 구매자 비독점·영구 이용권"이 기본이라(2026-11-17 확정)
// 판매자가 본문 '이용 범위'를 이 기준과 어긋나게 적지 않도록 함께 확인받는다.
const SERVICE_DELIVERY_ACKNOWLEDGEMENT: Acknowledgement = {
  text: "제작·납품 조건과 결과물 이용 범위를 상품 설명이나 구매 옵션에 적었습니다.",
  guide: [
    [
      "파일·코드를 내려받게 하는 상품이라면 이 구분이 아니라 ",
      { strong: "상용 라이선스" },
      "를 선택해 주세요.",
    ],
    [
      "구매자가 보내야 할 자료, ",
      { strong: "납품 범위와 방법" },
      ", 작업 기간(언제부터 세는지), 수정 횟수를 적어 주세요.",
    ],
    [
      "결과물 저작권은 판매자에게 남고, 구매자는 ",
      {
        strong:
          "개인 용도는 물론 자기 사업 용도(영리 목적 포함)로도 기간 제한 없이 사용·수정할 수 있는 비독점 이용권",
      },
      "을 받습니다(재판매·재배포·재양도 불가). 상품 설명의 '이용 범위'는 이 기준과 어긋나지 않게 적어 주세요.",
    ],
    [
      "결과물을 쓸 권리와 별개로, ",
      { strong: "웹 주소 유지 기간 같은 운영 서비스 기간" },
      "과 원본 파일 제공 여부를 따로 적어 주세요.",
    ],
    [
      "저작권 양도는 기본이 아닙니다. 구매자가 저작권을 넘겨받길 원하면 ",
      { strong: "구매자와 별도로 서면 합의" },
      "해 주세요.",
    ],
    [
      "취소·환불 기준을 작업 시작 전과 후로 나눠 적어 주세요. 작업이 시작된 뒤 철회가 제한된다면 ",
      { strong: "그 사실을 미리 분명하게 알려야" },
      " 합니다. '환불 불가'처럼 단정하는 문구는 법에 어긋날 수 있습니다.",
    ],
    [
      "구매자가 보낸 사진·연락처 같은 자료는 ",
      { strong: "이 주문의 제작·납품에만" },
      " 써 주세요. 포트폴리오에 공개하려면 구매자의 동의를 먼저 받아야 합니다.",
    ],
  ],
};

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
  // 선택한 구분에 따라 확인 항목 수가 달라지므로 인덱스가 아니라 문구(text)로 체크 상태를 찾는다.
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const acknowledgements =
    draftLicense === SERVICE_DELIVERY_LICENSE
      ? [...ACKNOWLEDGEMENTS, SERVICE_DELIVERY_ACKNOWLEDGEMENT]
      : ACKNOWLEDGEMENTS;

  // 열 때마다 동의를 초기화한다 — 라이선스는 철회가 불가능해 매번 다시 확인받는다.
  useEffect(() => {
    if (open) setChecked({});
  }, [open]);

  const canConfirm = !!draftLicense && acknowledgements.every(({ text }) => checked[text]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">라이선스 설정</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {LICENSE_OPTIONS.map((option) => {
            const selected = option.value === draftLicense;
            // 유료는 상용 라이선스·제작·납품 서비스만, 무료는 CC만 선택 가능하다.
            // 무료여도 템플릿·코드에는 ND 불가.
            const wrongPriceType = !isLicenseAllowed(option.value, isFree);
            const blockedByCode = option.value === "cc-by-nc-nd" && isCodeWork;
            const disabled = wrongPriceType || blockedByCode;
            // 해당 가격 유형에서 쓸 수 없는 옵션은 숨기지 않고 사유를 보여 준다.
            const disabledReason = wrongPriceType
              ? isFree
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
                  {option.sellerNote && (
                    <p className="text-xs font-bold text-gf-orange">{option.sellerNote}</p>
                  )}
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
          {acknowledgements.map(({ text, guide }) => (
            <div key={text} className="space-y-1.5">
              <label className="flex cursor-pointer items-start gap-2 text-sm text-gf-black">
                <Checkbox
                  checked={!!checked[text]}
                  onCheckedChange={(value) => setChecked((prev) => ({ ...prev, [text]: value }))}
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

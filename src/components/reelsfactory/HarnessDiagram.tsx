import { TONE_CLASSES } from "@/components/reelsfactory/SectionShell";
import { cn } from "@/lib/utils";

const tone = TONE_CLASSES.ink;

// 하네스가 맡는 기능 (Claude Code 기본 제공)
const HARNESS_FUNCTIONS = [
  "에이전트 루프",
  "도구 실행",
  "컨텍스트 관리",
  "권한",
  "훅",
  "서브에이전트",
  "메모리",
];

// 내가 하네스 위에 직접 설계하는 층
const DESIGNED_LAYERS = [
  { label: "CLAUDE.md", description: "코드 컨벤션 · 데이터 흐름 규칙" },
  { label: "전문 에이전트", description: "코드 리뷰 · 컴포넌트 · 모션 · 라이선스" },
  { label: "검증 순서", description: "tsc → lint → build, 리뷰 승인 후 커밋" },
];

interface ConnectorProps {
  label: string;
}

function Connector({ label }: ConnectorProps) {
  return (
    <div className={cn("flex items-center gap-3 py-2 pl-6 text-xs", tone.muted)} aria-hidden>
      <span className={cn("h-6 w-px", tone.line)} />
      <span>{label}</span>
    </div>
  );
}

export default function HarnessDiagram() {
  return (
    <figure className={cn("flex flex-col rounded-md border p-5 sm:p-6", tone.rule)}>
      <figcaption className={cn("mb-5 text-sm", tone.muted)}>
        어시스턴트 ≈ 모델 + 하네스 + 인터페이스
      </figcaption>

      <div className={cn("rounded-sm border px-4 py-3 text-sm", tone.rule)}>
        <p className="font-medium">인터페이스</p>
        <p className={tone.muted}>터미널 · 에디터에서 요청하고 결과를 확인</p>
      </div>

      <Connector label="요청 / 결과" />

      <div className={cn("flex flex-col gap-4 rounded-sm border-2 border-rf-cream p-4")}>
        <div>
          <p className="font-semibold">하네스</p>
          <p className={cn("text-sm", tone.muted)}>모델의 텍스트를 실제 행동으로 바꾸는 층</p>
        </div>

        <ul className="flex flex-wrap gap-2">
          {HARNESS_FUNCTIONS.map((name) => (
            <li key={name} className={cn("rounded-full px-3 py-1 text-xs", tone.chip)}>
              {name}
            </li>
          ))}
        </ul>

        <div className={cn("flex flex-col gap-2 border-t pt-4", tone.rule)}>
          <p className="text-sm font-medium">내가 설계하는 층</p>
          <ul className="flex flex-col gap-2">
            {DESIGNED_LAYERS.map(({ label, description }) => (
              <li
                key={label}
                className="flex flex-col gap-0.5 rounded-sm bg-rf-cream px-3 py-2 text-rf-ink sm:flex-row sm:items-baseline sm:gap-3"
              >
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs text-rf-ink/70">{description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Connector label="텍스트 출력 / 도구 호출" />

      <div className={cn("rounded-sm border px-4 py-3 text-sm", tone.rule)}>
        <p className="font-medium">모델 (Claude)</p>
        <p className={tone.muted}>텍스트만 출력하고, 실제 행동은 하네스가 실행</p>
      </div>
    </figure>
  );
}

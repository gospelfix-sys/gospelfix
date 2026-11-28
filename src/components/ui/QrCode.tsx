import { cn } from "@/lib/utils";

interface QrCodeProps {
  matrix: boolean[][];
  className?: string;
  label?: string;
}

// 스캔 인식률을 위해 QR 규격의 여백(quiet zone, 4모듈)을 둔다.
const QUIET_ZONE = 4;

// QR 모듈 행렬을 SVG로 그린다. 어두운 모듈을 하나의 path로 묶어 DOM 크기를 줄인다.
export function QrCode({ matrix, className, label = "송금 QR 코드" }: QrCodeProps) {
  const size = matrix.length + QUIET_ZONE * 2;
  const path = matrix
    .flatMap((row, y) =>
      row.map((dark, x) => (dark ? `M${x + QUIET_ZONE} ${y + QUIET_ZONE}h1v1h-1z` : "")),
    )
    .join("");

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      className={cn("h-40 w-40 rounded-lg bg-white", className)}
    >
      <path d={path} fill="#000" />
    </svg>
  );
}

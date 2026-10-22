"use client";

interface QuoteQuantityInputProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  unit: string;
}

export function QuoteQuantityInput({
  value,
  min = 1,
  max = 99,
  onChange,
  unit,
}: QuoteQuantityInputProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-gray-100 disabled:opacity-30"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-semibold text-gray-800">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-gray-100 disabled:opacity-30"
      >
        +
      </button>
      <span className="text-xs text-gray-500">{unit}</span>
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EDITION_TYPES } from "@/components/upload/uploadEditorUtils";
import type { ArtDetails } from "@/types/product.types";

interface ArtDetailsFieldsProps {
  value: ArtDetails;
  onChange: <K extends keyof ArtDetails>(key: K, value: ArtDetails[K]) => void;
}

interface TextFieldDef {
  key: Exclude<keyof ArtDetails, "edition_type" | "frame_included">;
  label: string;
  placeholder: string;
}

const ARTWORK_FIELDS: TextFieldDef[] = [
  { key: "artwork_size", label: "작품 크기", placeholder: "예: 60 × 90 cm" },
  { key: "artwork_medium", label: "재료·기법", placeholder: "예: 캔버스에 아크릴" },
  { key: "artwork_year", label: "제작 연도", placeholder: "예: 2026" },
];

const EXHIBITION_FIELDS: TextFieldDef[] = [
  { key: "exhibition_title", label: "전시명", placeholder: "전시 제목을 입력해주세요." },
  { key: "exhibition_period", label: "전시 기간", placeholder: "예: 2026.11.01 ~ 2026.11.30" },
  { key: "exhibition_venue", label: "전시 장소", placeholder: "예: 서울 종로구 OO 갤러리" },
  { key: "exhibition_artists", label: "참여 작가", placeholder: "여러 명이면 쉼표로 구분" },
];

// "미술·전시" 탭 본문 — 작품 정보 / 전시 정보 / 에디션·판매 형태 3개 묶음
export function ArtDetailsFields({ value, onChange }: ArtDetailsFieldsProps) {
  function renderTextFields(fields: TextFieldDef[]) {
    return fields.map((field) => (
      <div key={field.key} className="space-y-2">
        <h4 className="text-sm font-bold text-gf-black">{field.label}</h4>
        <Input
          value={value[field.key]}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="h-10 rounded-xl bg-gf-white"
        />
      </div>
    ));
  }

  return (
    <div className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="mb-2 text-xs font-semibold text-gf-gray2">작품 정보</legend>
        {renderTextFields(ARTWORK_FIELDS)}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-xs font-semibold text-gf-gray2">전시 정보</legend>
        {renderTextFields(EXHIBITION_FIELDS)}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-xs font-semibold text-gf-gray2">에디션·판매 형태</legend>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gf-black">에디션 구분</h4>
          <Select
            value={value.edition_type}
            onValueChange={(next) => onChange("edition_type", next ?? "")}
          >
            <SelectTrigger className="h-10 w-full rounded-xl bg-gf-white">
              <SelectValue placeholder="에디션 구분 선택" />
            </SelectTrigger>
            <SelectContent>
              {EDITION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gf-black">에디션 수량</h4>
          <Input
            value={value.edition_size}
            onChange={(e) => onChange("edition_size", e.target.value)}
            placeholder="예: 한정 50부 (넘버링 포함)"
            className="h-10 rounded-xl bg-gf-white"
          />
        </div>

        <label className="flex items-center gap-2.5 rounded-xl border border-gf-border bg-gf-white px-4 py-3">
          <Checkbox
            checked={value.frame_included}
            onCheckedChange={(checked) => onChange("frame_included", checked === true)}
          />
          <span className="text-sm text-gf-black">액자 포함</span>
        </label>
      </fieldset>
    </div>
  );
}

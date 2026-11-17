"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tab } from "@/components/ui/Tab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArtDetailsFields } from "@/components/upload/ArtDetailsFields";
import { CodePreviewEditor } from "@/components/upload/CodePreviewEditor";
import { DownloadFileField } from "@/components/upload/DownloadFileField";
import { DESIGN_TYPES } from "@/components/upload/uploadEditorUtils";
import type { UploadWorkForm } from "@/hooks/useUploadWorkForm";

type CategoryTabKey = "web" | "art";

interface UploadCategoryTabsProps {
  form: UploadWorkForm;
}

interface TabDef {
  key: CategoryTabKey;
  label: string;
  hasValue: boolean;
}

// 분야별 상세 항목 탭 (웹 템플릿 / 미술·전시) — 코드 미리보기·다운로드 파일도 웹 템플릿 소속
// 탭을 전환해 필드가 언마운트되어도 값은 useUploadWorkForm 훅이 들고 있어 유지된다.
export function UploadCategoryTabs({ form }: UploadCategoryTabsProps) {
  const {
    priceType,
    productionSolution,
    setProductionSolution,
    designType,
    setDesignType,
    siteUrl,
    setSiteUrl,
    hasAiStarterKit,
    setHasAiStarterKit,
    newZipFile,
    setNewZipFile,
    filePath,
    setFilePath,
    codePreview,
    addCodePreviewItem,
    updateCodePreviewItem,
    removeCodePreviewItem,
    artDetails,
    setArtDetail,
  } = form;

  const [activeTab, setActiveTab] = useState<CategoryTabKey>("web");

  const isFree = priceType === "free";

  // 숨겨진 탭에 입력값이 있으면 점으로 알려준다
  const tabs: TabDef[] = [
    {
      key: "web",
      label: "웹 템플릿",
      hasValue:
        !!productionSolution ||
        !!designType ||
        !!siteUrl ||
        hasAiStarterKit ||
        codePreview.length > 0 ||
        (isFree && (!!newZipFile || !!filePath)),
    },
    {
      key: "art",
      label: "미술·전시",
      hasValue: Object.values(artDetails).some((v) => (typeof v === "string" ? !!v.trim() : v)),
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-gf-black">
        분야별 상세 <span className="font-normal text-gf-gray2">(선택)</span>
      </h2>

      <div role="tablist" aria-label="분야별 상세 항목" className="grid grid-cols-2 gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Tab
              key={tab.key}
              variant="segment"
              active={isActive}
              id={`upload-tab-${tab.key}`}
              aria-controls={`upload-tabpanel-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={
                isActive
                  ? "border-gf-orange bg-gf-orange-bg text-gf-orange"
                  : "border-gf-border bg-gf-white text-gf-black"
              }
            >
              {tab.label}
              {tab.hasValue && !isActive && (
                <span
                  className="size-1.5 rounded-full bg-gf-orange"
                  role="img"
                  aria-label="입력된 값 있음"
                />
              )}
            </Tab>
          );
        })}
      </div>

      {activeTab === "web" && (
        <div
          role="tabpanel"
          id="upload-tabpanel-web"
          aria-labelledby="upload-tab-web"
          className="space-y-4"
        >
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gf-black">제작솔루션</h3>
            <Input
              value={productionSolution}
              onChange={(e) => setProductionSolution(e.target.value)}
              placeholder="예: Supabase, Vercel"
              className="h-10 rounded-xl bg-gf-white"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gf-black">디자인구분</h3>
            <Select value={designType} onValueChange={(value) => setDesignType(value ?? "")}>
              <SelectTrigger className="h-10 w-full rounded-xl bg-gf-white">
                <SelectValue placeholder="디자인구분 선택" />
              </SelectTrigger>
              <SelectContent>
                {DESIGN_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gf-black">사이트URL</h3>
            <Input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="사이트 주소를 입력해주세요."
              className="h-10 rounded-xl bg-gf-white"
            />
          </div>

          <label className="flex items-center gap-2.5 rounded-xl border border-gf-border bg-gf-white px-4 py-3">
            <Checkbox
              checked={hasAiStarterKit}
              onCheckedChange={(checked) => setHasAiStarterKit(checked === true)}
            />
            <span className="text-sm text-gf-black">AI 스타터 킷 포함</span>
          </label>

          <CodePreviewEditor
            items={codePreview}
            onAdd={addCodePreviewItem}
            onUpdate={updateCodePreviewItem}
            onRemove={removeCodePreviewItem}
          />

          {isFree && (
            <DownloadFileField
              newZipFile={newZipFile}
              filePath={filePath}
              onZipPick={setNewZipFile}
              onZipClear={() => {
                setNewZipFile(null);
                setFilePath(null);
              }}
            />
          )}
        </div>
      )}

      {activeTab === "art" && (
        <div role="tabpanel" id="upload-tabpanel-art" aria-labelledby="upload-tab-art">
          <ArtDetailsFields value={artDetails} onChange={setArtDetail} />
        </div>
      )}
    </section>
  );
}

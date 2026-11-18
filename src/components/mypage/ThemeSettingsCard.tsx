"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSiteTheme } from "@/hooks/useSiteTheme";
import type { SiteThemeChoice } from "@/lib/theme";

const THEME_OPTIONS: { value: SiteThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "라이트", icon: Sun },
  { value: "dark", label: "다크", icon: Moon },
  { value: "system", label: "시스템", icon: Monitor },
];

// 화면 테마 선택. 사이트 전체에 적용되고 이 브라우저(쿠키)에 저장된다.
export function ThemeSettingsCard() {
  const { theme, setTheme } = useSiteTheme();
  // 선택은 임시로 들고 있다가 저장 버튼을 눌렀을 때만 적용한다.
  const [draft, setDraft] = useState<SiteThemeChoice>(theme);

  // 쿠키에서 저장된 값을 읽어오면(마운트 직후) 선택 표시도 맞춘다.
  useEffect(() => {
    setDraft(theme);
  }, [theme]);

  function handleSave() {
    setTheme(draft);
    toast.success("화면 테마를 저장했어요.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>화면 테마</CardTitle>
        <CardDescription>
          사이트 전체 화면의 색상을 고를 수 있어요. 시스템은 기기 설정을 따라가요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="radiogroup" aria-label="화면 테마" className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                role="radio"
                aria-checked={draft === value}
                variant={draft === value ? "default" : "outline"}
                onClick={() => setDraft(value)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
          <Button type="button" onClick={handleSave} disabled={draft === theme}>
            저장
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

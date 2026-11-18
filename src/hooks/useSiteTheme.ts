"use client";

import { useCallback, useEffect, useState } from "react";
import { applyTheme, readThemeChoice, type SiteThemeChoice } from "@/lib/theme";

// OS 테마 변경 추적은 루트 레이아웃의 ThemeSync가 맡는다.
// 첫 렌더는 서버와 같게 라이트로 두고, 마운트 후 쿠키에서 실제 선택값을 읽는다.
export function useSiteTheme() {
  const [theme, setThemeState] = useState<SiteThemeChoice>("light");

  useEffect(() => {
    setThemeState(readThemeChoice());
  }, []);

  const setTheme = useCallback((next: SiteThemeChoice) => {
    applyTheme(next);
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}

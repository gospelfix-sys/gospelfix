"use client";

import { useCallback, useEffect, useState } from "react";
import { applyTheme, readThemeChoice, resolveTheme, type SiteThemeChoice } from "@/lib/theme";

// 첫 렌더는 서버와 같게 라이트로 두고, 마운트 후 쿠키에서 실제 선택값을 읽는다.
export function useSiteTheme() {
  const [theme, setThemeState] = useState<SiteThemeChoice>("light");

  useEffect(() => {
    setThemeState(readThemeChoice());
  }, []);

  // 시스템을 고른 동안에는 OS 테마가 바뀔 때 화면도 같이 바꾼다.
  useEffect(() => {
    if (theme !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange() {
      document.documentElement.dataset.gfTheme = resolveTheme("system");
    }
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((next: SiteThemeChoice) => {
    applyTheme(next);
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}

"use client";

import { useEffect } from "react";
import { readThemeChoice, resolveTheme } from "@/lib/theme";

// "시스템"을 고른 동안 OS 테마가 바뀌면 화면도 따라가게 한다. 설정 페이지가 아니어도 동작해야 해서
// 루트 레이아웃에 상주시킨다.
export default function ThemeSync() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange() {
      if (readThemeChoice() !== "system") return;
      document.documentElement.dataset.gfTheme = resolveTheme("system");
    }
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return null;
}

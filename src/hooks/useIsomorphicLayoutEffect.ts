"use client";

import * as React from "react";

// SSR에서는 useLayoutEffect가 경고를 내므로 브라우저에서만 layout effect를 쓴다.
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

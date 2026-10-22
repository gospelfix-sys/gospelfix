"use server";

import { headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

export interface ChatQuoteAnswers {
  purpose: string;
  format: string;
  pageCount: string | null;
  showcase: string;
  features: string[];
  contactName: string;
  contactValue: string;
}

export async function submitQuoteChatAction(answers: ChatQuoteAnswers): Promise<string> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? null;
  const userAgent = hdrs.get("user-agent") ?? null;
  const referer = hdrs.get("referer") ?? null;

  const projectSummary = [
    `제작 목적: ${answers.purpose}`,
    `형태: ${answers.format}`,
    answers.pageCount ? `예상 페이지 수: ${answers.pageCount}` : null,
    `보여주고 싶은 것: ${answers.showcase}`,
    `필요 기능: ${answers.features.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const { id } = await serverFetch<{ id: string }>("/api/quotes", {
    method: "POST",
    body: JSON.stringify({
      selectedCategories: ["homepage"],
      selectedItems: [],
      schedule: null,
      stylePreferences: [],
      targetAge: null,
      contactName: answers.contactName,
      contactValue: answers.contactValue,
      contactEmail: null,
      businessNumber: null,
      projectSummary,
      referenceUrls: [],
      estimatedTotal: 0,
      shopIndustry: null,
      shopStatus: null,
      productionScope: null,
      requiredFeatures: [],
      needsSystemDev: false,
      utmParams: {},
      ipAddress: ip,
      userAgent,
      referer,
    }),
  });

  return id;
}

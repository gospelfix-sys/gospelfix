"use server";

import { headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

export interface ChatQuoteAnswers {
  target: string;
  site: string;
  response: string;
  branding: string;
  care: string;
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
    `대상: ${answers.target}`,
    `홈페이지: ${answers.site}`,
    `응대: ${answers.response}`,
    `브랜딩: ${answers.branding}`,
    `유지보수: ${answers.care}`,
    `필요 기능: ${answers.features.join(", ")}`,
  ].join("\n");

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

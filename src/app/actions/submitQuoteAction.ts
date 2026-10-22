"use server";

import { headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import type { QuoteWizardState } from "@/types/quote.types";

interface SubmitMeta {
  utmParams: Record<string, string>;
}

export async function submitQuoteAction(state: QuoteWizardState, meta: SubmitMeta): Promise<string> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    null;
  const userAgent = hdrs.get("user-agent") ?? null;
  const referer = hdrs.get("referer") ?? null;

  const { id } = await serverFetch<{ id: string }>("/api/quotes", {
    method: "POST",
    body: JSON.stringify({
      selectedCategories: state.selectedCategories,
      selectedItems: state.selectedItems,
      schedule: state.schedule,
      stylePreferences: state.stylePreferences,
      targetAge: state.targetAge,
      contactName: state.contactInfo.name,
      contactValue: state.contactInfo.contact,
      contactEmail: state.contactInfo.email || null,
      businessNumber: state.contactInfo.businessNumber || null,
      projectSummary: state.contactInfo.projectSummary || null,
      referenceUrls: state.contactInfo.referenceUrls.filter(Boolean),
      estimatedTotal: state.estimatedTotal,
      shopIndustry: state.shopIndustry,
      shopStatus: state.shopStatus,
      productionScope: state.productionScope,
      requiredFeatures: state.requiredFeatures,
      needsSystemDev: state.needsSystemDev,
      utmParams: meta.utmParams,
      ipAddress: ip,
      userAgent,
      referer,
    }),
  });

  return id;
}

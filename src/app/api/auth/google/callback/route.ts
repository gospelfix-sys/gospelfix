import { handleOAuthCallback } from "@/lib/cmsApi/oauth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleOAuthCallback(request, "google");
}

// 서버 전용 — CMS_API_KEY를 쓰므로 클라이언트 번들에서 import하지 않는다.
// multipart 업로드를 cms.api로 중계한다. FormData를 파싱한 뒤 다시 직렬화하면 운영에서
// cms.api가 "no boundary found in multipart body"로 실패했다(로컬은 정상). 그래서 브라우저가
// 보낸 본문 바이트와 boundary가 든 Content-Type을 그대로 넘겨 재직렬화 단계를 없앤다.
export async function proxyMultipart(
  request: Request,
  cmsPath: string,
  accessToken: string,
): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  const body = await request.arrayBuffer();

  return fetch(`${process.env.CMS_API_BASE_URL}${cmsPath}`, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      "X-API-Key": process.env.CMS_API_KEY ?? "",
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  });
}

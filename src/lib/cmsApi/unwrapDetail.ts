/**
 * cms.api 단건 조회 응답이 { data: T } 형태로 래핑되어 오는 경우와
 * 래핑 없이 T 객체 자체로 오는 경우를 모두 안전하게 처리한다.
 */
export function unwrapDetail<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in (body as Record<string, unknown>)) {
    return (body as { data: T }).data;
  }
  return body as T;
}

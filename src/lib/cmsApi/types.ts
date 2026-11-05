// cms.api 목록 API의 공통 페이지네이션 응답 형태
export interface CmsListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

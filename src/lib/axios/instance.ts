import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 이 앱은 same-origin API(/api/*)만 호출하므로 별도 토큰 첨부가 필요 없다
 * (세션은 httpOnly 쿠키로 자동 전송되고, cms.api 인증은 각 Route Handler가 서버 사이드에서 처리한다).
 * 401 응답이면 세션이 만료된 것이므로 로그인 페이지로 보낸다.
 * axios 요청 후 인터셉터
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
export const isAxiosError = axios.isAxiosError;

export const MOBILE_REGEX = /^01[0-9]{8,9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

// 국세청 표준 체크섬(가중치 1·3·7·1·3·7·1·3·5). cms.api의 검증과 같은 규칙이라 서버에서 400이 나기 전에 거른다.
export function isValidBusinessNumber(digits: string): boolean {
  if (!/^\d{10}$/.test(digits)) return false;
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  const nums = digits.split("").map(Number);
  const sum = weights.reduce((acc, weight, i) => acc + nums[i] * weight, 0);
  const total = sum + Math.floor((nums[8] * 5) / 10);
  return (10 - (total % 10)) % 10 === nums[9];
}

// 사업장 주소의 최소 형식 검사. 국세청 확인에는 주소가 없어 실재 여부는 못 보고, 한글·숫자(번지)·
// 행정구역/도로명 단위가 모두 있는 문자열만 통과시킨다. cms.api의 isValidBusinessAddress와 같은 규칙이다.
export function isValidBusinessAddress(value: string): boolean {
  const address = value.trim();
  return (
    address.length >= 8 &&
    /[가-힣]/.test(address) &&
    /\d/.test(address) &&
    /(시|도|군|구|읍|면|동|리|로|길)/.test(address)
  );
}

// YYYYMMDD가 실제 달력에 있는 과거(또는 오늘) 날짜인지 확인한다.
export function isValidOpenedAt(digits: string): boolean {
  if (!/^\d{8}$/.test(digits)) return false;
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  if (year < 1900) return false;
  const date = new Date(year, month - 1, day);
  const exists =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return exists && date.getTime() <= Date.now();
}

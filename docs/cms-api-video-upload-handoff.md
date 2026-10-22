# [폐기됨] cms.api 인수인계: 상품 mp4 동영상 업로드 지원

> **이 문서는 폐기되었다(2026-08-28).** 아래 내용은 "판매자가 mp4 파일을 직접 업로드"
> 하는 방식을 전제로 cms.api 담당자에게 백엔드 구현을 요청하기 위해 작성됐던 것이다.
> 실제로 cms.api에 업로드 엔드포인트(`POST /api/v1/my-products/videos`)를 구현하고
> `product-videos` Storage 버킷까지 만들었지만, 상용 배포 환경(Vercel Serverless
> Function)의 요청 바디 크기 한도(~4.5MB)와 실제 데모 영상 파일 크기(8MB 이상이 흔함)가
> 정면으로 충돌한다는 게 뒤늦게 드러나 접근 자체를 폐기했다. 이 문서는 그 경위를
> 남겨두기 위해 보존한다 — **아래 내용을 참고해서 구현하지 말 것.**

## 최종 결정: 유튜브/Vimeo 링크 임베드 방식으로 전환

판매자가 영상 원본을 유튜브 또는 Vimeo에 직접 올리고, 여기에는 그 **공유 링크**만
입력받는 방식으로 바꿨다. 자체 파일 업로드/저장이 아예 없어지므로 용량 제한 문제가
근본적으로 사라진다.

- **표지(cover)**: 유튜브 링크에서 비디오 ID를 뽑아 `https://img.youtube.com/vi/{id}/hqdefault.jpg`
  썸네일 이미지를 바로 만들어 `thumbnail_url`에 저장한다(Vimeo는 oEmbed API 호출로
  썸네일 URL을 받아온다). 즉 `thumbnail_url`은 항상 평범한 이미지 URL이라
  `ProductCard.tsx`는 `next/image`만 쓰면 되고 별도 분기가 필요 없다.
- **콘텐츠 블록**: 캔버스의 "동영상" 블록이 파일 선택 대신 링크 입력 필드로 바뀌었고,
  저장 시 `content_html`에 `<iframe>` 임베드가 삽입된다.
- **cms.api 작업 불필요**: 링크 파싱과 Vimeo oEmbed 호출이 모두 `gospelfix` 프론트엔드
  (브라우저)에서 직접 이뤄지므로, 이 기능을 위한 cms.api 쪽 신규 엔드포인트/버킷은
  전혀 필요 없다. 예전에 만들었던 `POST /api/v1/my-products/videos`와
  `uploadMyProductFile`의 `product-videos` 버킷 지원 코드는 되돌렸다.
- **남은 수동 정리**: Supabase 대시보드에 수동 생성했던 `product-videos` Storage
  버킷은 이제 아무 코드에서도 참조하지 않는다 — 지워도 무방하다(급하지 않음).

## 구현 위치

- `src/lib/videoLink.ts` — 유튜브/Vimeo URL 파싱 + 썸네일/임베드 URL 해석
  (`resolveVideoLink`).
- `src/components/growth/UploadWorkEditor.tsx` — 표지 "유튜브/Vimeo 링크" 모드,
  콘텐츠 블록 "영상 링크" 입력.
- `src/lib/sanitizeHtml.ts` — `iframe` 태그를 화이트리스트에 추가하되
  `allowedIframeHostnames`로 `www.youtube.com`/`player.vimeo.com`만 허용.
- `next.config.mjs` — `next/image`가 `img.youtube.com`/`i.vimeocdn.com` 썸네일을
  불러올 수 있도록 `images.remotePatterns`에 추가.

---

## (이하 폐기된 원문 — 참고용으로만 남김)

### 배경

`/growth/upload`(작품 업로드 화면)에서 판매자가 표지와 작업 파일 캔버스의 콘텐츠
블록 양쪽 모두에 mp4 동영상을 올릴 수 있어야 한다는 요청이 있었다. 처음에는 cms.api가
파일을 직접 받아 Supabase Storage에 저장하는 방식(이미지 업로드와 동일 계약)으로
설계했다.

### 왜 폐기했나

1. cms.api가 Vercel Serverless Function(Node.js 런타임)으로 배포되는데, 요청 바디
   크기에 플랫폼 레벨 한도(~4.5MB)가 있다. `브라우저 → gospelfix → cms.api → Storage`
   순으로 파일 전체를 두 겹의 서버리스 함수에 프록시하는 구조라 이 한도를 그대로
   물려받는다.
2. 이 문제를 회피하려고 업로드 상한을 4MB까지 낮췄으나, 실제 판매자가 준비하는 데모
   영상은 짧은 것도 8MB를 넘는 경우가 흔해(스크린 레코딩 mp4 기준) 4MB는 실사용이
   불가능한 수준이었다.
3. 근본적으로 고치려면 Supabase Storage 서명 업로드 URL(브라우저가 두 서버를 거치지
   않고 Storage에 직접 업로드)로 재설계해야 했는데, 이는 `gospelfix`가 Supabase에
   전혀 직접 접근하지 않는 BFF 아키텍처 원칙을 이 기능만 예외로 깨는 것이라 비용이
   컸다.
4. 반면 "영상 원본은 유튜브/Vimeo에 올리고 링크만 입력받는" 방식은 자체 저장이
   아예 없어 위 문제를 전부 우회하면서 구현도 더 단순하다 — 그래서 이 방식으로
   최종 결정했다.

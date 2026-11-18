import sanitizeHtml from "sanitize-html";

// CMS 리치 텍스트 에디터가 생성하는 서식 태그를 허용하는 화이트리스트.
// jsdom 기반 isomorphic-dompurify 대신 순수 JS 파서(htmlparser2)를 쓰는 sanitize-html로 교체함
// (Vercel 프로덕션에서 jsdom의 ESM 전용 의존성이 require()로 로드되지 못해 발생한 크래시 회피).
const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "span",
  "div",
  "a",
  "img",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "code",
  "pre",
  "iframe",
];

const ALLOWED_ATTRIBUTES = {
  a: ["href", "target", "rel", "title"],
  img: ["src", "alt", "title", "width", "height"],
  iframe: ["src", "allow", "allowfullscreen", "loading", "title"],
  span: ["style"],
  p: ["style"],
  div: ["style"],
  // 에디터 TextAlign이 heading에도 text-align을 inline style로 저장하므로 허용해야 정렬이 유지된다.
  h1: ["style"],
  h2: ["style"],
  h3: ["style"],
  h4: ["style"],
  h5: ["style"],
  h6: ["style"],
  "*": ["class"],
};

// 유튜브/Vimeo 임베드만 허용한다(상품 소개 영상 — 자체 파일 업로드 대신 채택한 방식.
// project docs/cms-api-video-upload-handoff.md 참고). 다른 호스트의 iframe은 통째로 제거된다.
const ALLOWED_IFRAME_HOSTNAMES = ["www.youtube.com", "player.vimeo.com"];

// 리치 텍스트 에디터는 내용을 전부 지워도 "<p></p>"처럼 태그만 남은 문자열을 반환하는
// 경우가 있다. 이런 값은 truthy라 단순 null 체크로 걸러지지 않으므로, 텍스트가 비어 있고
// 이미지/구분선처럼 시각적으로 의미 있는 태그도 없을 때만 "비어 있다"고 판단한다.
export function isContentHtmlEmpty(html: string): boolean {
  const textOnly = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  if (textOnly.length > 0) return false;
  return !/<img[\s>]|<hr[\s/>]/i.test(html);
}

export interface GallerySlide {
  src: string;
  device: "desktop" | "mobile";
}

export type ContentSegment =
  | { type: "html"; html: string }
  | { type: "gallery"; images: GallerySlide[] };

// 업로드 에디터가 묶음 이미지를 <div class="image-gallery"><img …/>…</div>로 저장한다
// (uploadEditorUtils의 serializeGallery와 형식을 맞출 것). ProseHtml은 innerHTML이라 슬라이더를
// 넣을 수 없어, 정제가 끝난 HTML을 일반 HTML 조각과 갤러리 조각으로 나눠 렌더링한다.
// 반드시 sanitizeContentHtml 결과에만 쓴다 — 갤러리의 src는 정제된 값이어야 한다.
export function splitContentSegments(sanitizedHtml: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const galleryPattern = /<div class="image-gallery">([\s\S]*?)<\/div>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = galleryPattern.exec(sanitizedHtml))) {
    const before = sanitizedHtml.slice(lastIndex, match.index);
    if (before.trim()) segments.push({ type: "html", html: before });
    // 정제기가 속성값의 &를 &amp;로 바꿔 두므로 React src에 넣기 전에 되돌린다.
    // 모바일용 사진은 class="device-mobile"이 붙어 있다(uploadEditorUtils의 GALLERY_MOBILE_CLASS).
    const images = Array.from(match[1].matchAll(/<img\b[^>]*>/g), (tag): GallerySlide | null => {
      const src = /\ssrc="([^"]*)"/.exec(tag[0])?.[1];
      if (!src) return null;
      const isMobile = /\sclass="[^"]*\bdevice-mobile\b[^"]*"/.test(tag[0]);
      return { src: src.replace(/&amp;/g, "&"), device: isMobile ? "mobile" : "desktop" };
    }).filter((slide): slide is GallerySlide => slide !== null);
    if (images.length > 0) segments.push({ type: "gallery", images });
    lastIndex = galleryPattern.lastIndex;
  }
  const rest = sanitizedHtml.slice(lastIndex);
  if (rest.trim()) segments.push({ type: "html", html: rest });
  return segments;
}

export function sanitizeContentHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\([\d\s,%.]+\)$/],
        "text-align": [/^left$|^right$|^center$|^justify$/],
        "font-weight": [/^\d+$|^bold$|^normal$/],
        // 판매자·관리자 입력이 모두 거치므로, 레이아웃 파괴와 화면 덮기를 막기 위해
        // px는 8~96(에디터 글자 크기 선택지 범위), rem/em은 0~10 범위로 제한한다.
        "font-size": [/^(?:[89]|[1-8]\d|9[0-6])(\.\d+)?px$/, /^(?:\d|10)(\.\d+)?(rem|em)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: ALLOWED_IFRAME_HOSTNAMES,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  });
}

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

export function sanitizeContentHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\([\d\s,%.]+\)$/],
        "text-align": [/^left$|^right$|^center$|^justify$/],
        "font-weight": [/^\d+$|^bold$|^normal$/],
        // 관리자 전용 CMS 콘텐츠라 보안 위험은 아니지만, 에디터 오조작으로 레이아웃이 깨지는 것을
        // 막기 위해 px는 8~72, rem/em은 0~10 범위로 제한한다.
        "font-size": [/^(?:[89]|[1-6]\d|7[0-2])(\.\d+)?px$/, /^(?:\d|10)(\.\d+)?(rem|em)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: ALLOWED_IFRAME_HOSTNAMES,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  });
}

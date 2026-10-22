export type VideoLinkPlatform = "youtube" | "vimeo";

export interface ResolvedVideoLink {
  platform: VideoLinkPlatform;
  embedUrl: string;
  thumbnailUrl: string;
}

function parseYoutubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    return url.pathname.slice(1).split("/")[0] || null;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const match = url.pathname.match(/^\/(embed|shorts)\/([^/]+)/);
    if (match) return match[2];
  }
  return null;
}

function parseVimeoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (!host.endsWith("vimeo.com")) return null;
  const match = url.pathname.match(/(\d+)/);
  return match ? match[1] : null;
}

// 유튜브/Vimeo 링크만 지원한다 — 자체 서버로 mp4 파일을 업로드/프록시하는 방식은 Vercel
// Serverless Function 요청 바디 크기 한도(~4.5MB)에 실사용 파일이 쉽게 걸려 포기했다
// (docs/cms-api-video-upload-handoff.md 참고). 유튜브는 URL 패턴만으로 썸네일을 바로
// 만들 수 있지만, Vimeo는 oEmbed API 호출이 한 번 필요하다(공개 엔드포인트, 인증 불필요).
export async function resolveVideoLink(rawUrl: string): Promise<ResolvedVideoLink | null> {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const youtubeId = parseYoutubeId(url);
  if (youtubeId) {
    return {
      platform: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }

  const vimeoId = parseVimeoId(url);
  if (vimeoId) {
    try {
      const res = await fetch(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url.toString())}`,
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { thumbnail_url?: string };
      if (!data.thumbnail_url) return null;
      return {
        platform: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
        thumbnailUrl: data.thumbnail_url,
      };
    } catch {
      return null;
    }
  }

  return null;
}

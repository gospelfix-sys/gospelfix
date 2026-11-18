// 에디터에 넣은 이미지는 저장 전까지 로컬 blob URL로만 보여 준다. blob URL은 그 브라우저 탭에서만
// 유효하므로 HTML에 그대로 저장하면 게시 후 깨진다. 그래서 blob URL ↔ File을 기억해 두었다가
// 저장 시점에 업로드하고 실제 URL로 바꿔치기한다.
const pendingImages = new Map<string, File>();

const BLOB_URL_PATTERN = /blob:[^"'\s<>]+/g;

export function registerEditorImage(file: File): string {
  const url = URL.createObjectURL(file);
  pendingImages.set(url, file);
  return url;
}

// 업로드에 성공한 blob → 실제 URL. 여러 장·여러 블록을 올리다 중간에 실패해도 재저장 때 이미 올린
// 이미지는 다시 올리지 않고 재사용한다(성공분을 바로 지우면 재시도 시 "찾을 수 없음"으로 막힌다).
const uploadedUrls = new Map<string, string>();

// html 안의 blob 이미지를 모두 업로드해 실제 URL로 바꾼다. 같은 blob이 여러 번 쓰였어도 한 번만
// 올린다. 정리는 제출이 전부 성공한 뒤 clearUploadedEditorImages()에서 한다.
export async function uploadEditorImages(
  html: string,
  upload: (file: File) => Promise<string>,
): Promise<string> {
  const blobUrls = Array.from(new Set(html.match(BLOB_URL_PATTERN) ?? []));
  let result = html;
  for (const blobUrl of blobUrls) {
    let uploadedUrl = uploadedUrls.get(blobUrl);
    if (!uploadedUrl) {
      const file = pendingImages.get(blobUrl);
      if (!file) {
        // 다른 탭/세션에서 만들어진 blob이라 복구할 수 없다 — 깨진 이미지를 조용히 게시하지 않는다.
        throw new Error("본문에 삽입한 이미지를 찾을 수 없습니다. 이미지를 다시 삽입해주세요.");
      }
      uploadedUrl = await upload(file);
      uploadedUrls.set(blobUrl, uploadedUrl);
    }
    result = result.split(blobUrl).join(uploadedUrl);
  }
  return result;
}

// 제출이 모두 성공한 뒤 업로드를 마친 blob의 File·미리보기 URL을 해제해 메모리 누수를 막는다.
export function clearUploadedEditorImages(): void {
  for (const blobUrl of Array.from(uploadedUrls.keys())) {
    pendingImages.delete(blobUrl);
    URL.revokeObjectURL(blobUrl);
  }
  uploadedUrls.clear();
}

export function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('/')[0] || null;
    }
    if (u.searchParams.get('v')) {
      return u.searchParams.get('v');
    }
    const parts = u.pathname.split('/').filter(Boolean);
    const embedIdx = parts.indexOf('embed');
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    const shortsIdx = parts.indexOf('shorts');
    if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
    return null;
  } catch {
    return null;
  }
}

export function getYoutubeThumbnail(
  url: string,
  quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' | 'sddefault' = 'maxresdefault'
): string | null {
  const id = extractYoutubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
}

export function inferKegiatanCoverUrl(
  materi: Array<{ tipe: 'PDF' | 'VIDEO' | 'LINK'; filePath: string }>
): string | null {
  const youtubeLink = materi.find((m) => m.tipe === 'LINK');
  if (youtubeLink?.filePath) {
    const thumb = getYoutubeThumbnail(youtubeLink.filePath);
    if (thumb) return thumb;
  }
  return null;
}

export function resolveCoverImageUrl(url?: string | null): string | null {
  if (!url) return null;
  return getYoutubeThumbnail(url) ?? url;
}

export function resolveKegiatanCover(
  coverUrl: string | null | undefined,
  materi: Array<{ tipe: 'PDF' | 'VIDEO' | 'LINK'; filePath: string }>
): string | null {
  return resolveCoverImageUrl(coverUrl) ?? inferKegiatanCoverUrl(materi);
}

/**
 * @file fileTypes.ts
 * @description Centralized whitelist and MIME-type resolver for Vercy Storage.
 */

export const SUPPORTED_EXTENSIONS_MAP: Record<string, string> = {
  // Images
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  avif: 'image/avif',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  tif: 'image/tiff',

  // Documents & Data
  pdf: 'application/pdf',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
  md: 'text/markdown',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  flac: 'audio/flac',

  // Video
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',

  // Archives & Compressed
  zip: 'application/zip',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  '7z': 'application/x-7z-compressed',
  rar: 'application/vnd.rar',

  // Web Fonts
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
};

export const SUPPORTED_EXTENSIONS = new Set(Object.keys(SUPPORTED_EXTENSIONS_MAP));

/**
 * Checks if a file extension is in the supported whitelist.
 * @param ext - Extension with or without leading dot (e.g. 'png' or '.png')
 */
export function isExtensionSupported(ext: string): boolean {
  const cleanExt = ext.toLowerCase().replace(/^\./, '').trim();
  return SUPPORTED_EXTENSIONS.has(cleanExt);
}

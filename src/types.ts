export type StorageAccess = 'public' | 'private';

export interface PutOptions {
  /**
   * Access level for the file.
   * - 'public' (default): Accessible directly over the internet via https://storage.vercy.fun.
   * - 'private': Requires an HMAC-signed presigned download URL to view or download.
   */
  access?: StorageAccess;

  /**
   * Optional 1-level folder name (e.g. 'avatars', 'documents').
   * Must contain ONLY letters and numbers (strictly no slashes or special characters).
   */
  folder?: string;

  /**
   * Custom API endpoint override (e.g. 'https://vercy.fun/api/v1/storage' or local proxy).
   */
  endpoint?: string;

  /**
   * @deprecated Unique collision-free IDs are generated automatically.
   */
  addRandomSuffix?: boolean;

  /**
   * Explicit MIME content type (e.g. 'image/png', 'application/pdf').
   * If omitted, Vercy Storage attempts to infer it from the pathname extension.
   */
  contentType?: string;

  /**
   * Storage API Key. If omitted, reads from process.env.VERCY_STORAGE_API_KEY.
   */
  token?: string;
}

export interface PutStorageResult {
  /**
   * The public canonical URL of the file.
   */
  url: string;

  /**
   * The direct download URL of the file.
   */
  downloadUrl: string;

  /**
   * The relative pathname stored on Vercy (e.g. 'avatars/fil...png').
   */
  pathname: string;

  /**
   * The original human-readable filename passed during upload (e.g. 'avatar.png').
   */
  originalFilename?: string;

  /**
   * MIME content type of the file.
   */
  contentType: string;

  /**
   * File size in bytes.
   */
  size: number;

  /**
   * Access level assigned to the file.
   */
  access: StorageAccess;
}

export interface ListOptions {
  /**
   * Filter files starting with a specific prefix (e.g. 'avatars/').
   */
  prefix?: string;

  /**
   * Maximum number of files to return (1-100). Default: 20.
   */
  limit?: number;

  /**
   * Pagination cursor from a previous list() response.
   */
  cursor?: string;

  /**
   * Custom API endpoint override.
   */
  endpoint?: string;

  /**
   * Storage API Key override.
   */
  token?: string;
}

export interface StorageFile {
  id: string;
  pathname: string;
  originalFilename?: string;
  url: string;
  downloadUrl: string;
  size: number;
  contentType: string;
  access: StorageAccess;
  uploadedAt: string;
}

export interface ListStorageResult {
  files: StorageFile[];
  hasMore: boolean;
  cursor: string | null;
}

export interface DelOptions {
  /**
   * Custom API endpoint override.
   */
  endpoint?: string;

  /**
   * Storage API Key override.
   */
  token?: string;
}

export interface DelResult {
  success: boolean;
  deletedCount: number;
}

export interface DownloadUrlOptions {
  /**
   * Lifetime of the temporary signed URL in seconds.
   * Default: 900 (15 minutes). Minimum: 60, Maximum: 604800 (7 days).
   */
  expiresIn?: number;

  /**
   * Custom API endpoint override.
   */
  endpoint?: string;

  /**
   * Storage API Key override.
   */
  token?: string;
}

export interface DownloadUrlResult {
  downloadUrl: string;
  pathname: string;
  expiresAt: string;
  expiresIn: number;
}

export interface FolderOptions {
  /**
   * Custom API endpoint override.
   */
  endpoint?: string;

  /**
   * Storage API Key override.
   */
  token?: string;
}

export interface CreateFolderResult {
  success: boolean;
  folder: string;
  path: string;
}

export interface ListFoldersResult {
  folders: string[];
}

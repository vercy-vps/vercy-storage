import {
  PutOptions,
  PutStorageResult,
  ListOptions,
  ListStorageResult,
  DelOptions,
  DelResult,
  DownloadUrlOptions,
  DownloadUrlResult,
  StorageFile,
  FolderOptions,
  CreateFolderResult,
  ListFoldersResult,
} from './types.js';
import {
  VercyStorageError,
  QuotaExceededError,
  UnauthorizedError,
  NotFoundError,
} from './errors.js';
import { resolveToken } from './utils/token.js';
import { isExtensionSupported } from './fileTypes.js';

/**
 * Resolves the active Storage API endpoint dynamically.
 */
export function getApiEndpoint(): string {
  if (typeof process !== 'undefined' && process.env?.VERCY_STORAGE_ENDPOINT) {
    return process.env.VERCY_STORAGE_ENDPOINT;
  }
  return 'https://vercy.fun/api/v1/storage';
}

/**
 * Validates that a folder name contains ONLY letters and numbers (at most 1 level).
 */
export function isValidFolderName(folder: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(folder);
}

/**
 * Uploads a file, buffer, or stream to Vercy Storage.
 *
 * @param pathname - Destination path or file name (e.g. 'avatar.png' or 'avatars/avatar.png')
 * @param body - File contents (Buffer, Blob, File, ReadableStream, or string)
 * @param options - Upload options (folder, endpoint, access, addRandomSuffix, contentType, token)
 */
export async function put(
  pathname: string,
  body: any,
  options: PutOptions = {}
): Promise<PutStorageResult> {
  const token = resolveToken(options.token);
  const endpoint = options.endpoint || getApiEndpoint();

  // 1. Client-side extension whitelist pre-check (saves bandwidth)
  const rawExt = pathname.includes('.') ? pathname.split('.').pop()?.toLowerCase() : '';
  if (rawExt && !isExtensionSupported(rawExt)) {
    throw new VercyStorageError(
      `Unsupported file type ".${rawExt}". Only whitelisted formats (images, videos, audio, documents, archives, and fonts) are permitted.`,
      400
    );
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'x-pathname': pathname,
    'x-access': options.access || 'public',
    'x-add-random-suffix': options.addRandomSuffix === false ? 'false' : 'true',
  };

  // 2. Validate optional folder if explicitly specified
  if (options.folder) {
    const trimmed = options.folder.trim();
    if (!isValidFolderName(trimmed)) {
      throw new VercyStorageError(
        `Invalid folder name "${options.folder}". Folder names must contain only letters and numbers, with at most 1 level of nesting.`
      );
    }
    headers['x-folder'] = trimmed;
  }

  if (options.contentType) {
    headers['content-type'] = options.contentType;
  }

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers,
    body,
  });

  if (!response.ok) {
    let errorMsg = `Storage upload failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {}

    if (response.status === 413) {
      throw new QuotaExceededError(errorMsg);
    }
    if (response.status === 401) {
      throw new UnauthorizedError(errorMsg);
    }
    throw new VercyStorageError(errorMsg, response.status);
  }

  return (await response.json()) as PutStorageResult;
}

/**
 * Creates a single-level folder in Vercy Storage.
 *
 * @param folder - Folder name (must contain only letters and numbers, e.g. 'avatars' or 'docs')
 * @param options - Options containing optional token override and custom endpoint
 */
export async function createFolder(
  folder: string,
  options: FolderOptions = {}
): Promise<CreateFolderResult> {
  const trimmed = folder.trim();
  if (!isValidFolderName(trimmed)) {
    throw new VercyStorageError(
      `Invalid folder name "${folder}". Folder names must contain only letters and numbers, with at most 1 level of nesting.`
    );
  }

  const token = resolveToken(options.token);
  const baseEndpoint = options.endpoint || getApiEndpoint();
  const endpoint = `${baseEndpoint}/folders`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ folder: trimmed }),
  });

  if (!response.ok) {
    let errorMsg = `Failed to create folder with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {}

    if (response.status === 401) {
      throw new UnauthorizedError(errorMsg);
    }
    throw new VercyStorageError(errorMsg, response.status);
  }

  return (await response.json()) as CreateFolderResult;
}

/**
 * Lists all existing 1-level folders for the project.
 */
export async function listFolders(options: FolderOptions = {}): Promise<ListFoldersResult> {
  const token = resolveToken(options.token);
  const baseEndpoint = options.endpoint || getApiEndpoint();
  const endpoint = `${baseEndpoint}/folders`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMsg = `Failed to list folders with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {}

    if (response.status === 401) {
      throw new UnauthorizedError(errorMsg);
    }
    throw new VercyStorageError(errorMsg, response.status);
  }

  return (await response.json()) as ListFoldersResult;
}

/**
 * Deletes one or multiple files from Vercy Storage.
 *
 * @param urlOrPathnames - Single URL/pathname or array of URLs/pathnames
 * @param options - Options containing optional token override and endpoint
 */
export async function del(
  urlOrPathnames: string | string[],
  options: DelOptions = {}
): Promise<DelResult> {
  const token = resolveToken(options.token);
  const endpoint = options.endpoint || getApiEndpoint();

  const items = Array.isArray(urlOrPathnames) ? urlOrPathnames : [urlOrPathnames];

  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ urls: items, pathnames: items }),
  });

  if (!response.ok) {
    let errorMsg = `Storage deletion failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {}

    if (response.status === 401) {
      throw new UnauthorizedError(errorMsg);
    }
    throw new VercyStorageError(errorMsg, response.status);
  }

  return (await response.json()) as DelResult;
}

/**
 * Lists files in Vercy Storage with prefix filtering and pagination.
 *
 * @param options - List options (prefix, limit, cursor, endpoint, token)
 */
export async function list(options: ListOptions = {}): Promise<ListStorageResult> {
  const token = resolveToken(options.token);
  const baseEndpoint = options.endpoint || getApiEndpoint();
  const endpoint = new URL(baseEndpoint, typeof window !== 'undefined' ? window.location.origin : undefined);

  if (options.prefix) endpoint.searchParams.set('prefix', options.prefix);
  if (options.limit) endpoint.searchParams.set('limit', String(options.limit));
  if (options.cursor) endpoint.searchParams.set('cursor', options.cursor);

  const response = await fetch(endpoint.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMsg = `Storage list failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {}

    if (response.status === 401) {
      throw new UnauthorizedError(errorMsg);
    }
    throw new VercyStorageError(errorMsg, response.status);
  }

  return (await response.json()) as ListStorageResult;
}

/**
 * Fetches metadata for a single file in Vercy Storage.
 *
 * @param urlOrPathname - File URL or relative pathname
 * @param options - DelOptions / token override
 */
export async function head(
  urlOrPathname: string,
  options: DelOptions = {}
): Promise<StorageFile | null> {
  // Extract clean pathname if full URL was provided
  let cleanPath = urlOrPathname;
  try {
    const parsed = new URL(urlOrPathname);
    cleanPath = parsed.pathname.replace(/^\/+/, '');
  } catch {}

  const result = await list({
    prefix: cleanPath,
    limit: 1,
    endpoint: options.endpoint,
    token: options.token,
  });

  const match = result.files.find((f) => f.pathname === cleanPath);
  if (!match) {
    throw new NotFoundError(`File "${cleanPath}" was not found in storage.`);
  }

  return match;
}

/**
 * Generates a temporary HMAC-signed download URL for a private storage file.
 *
 * @param pathname - Pathname of the private file
 * @param options - Expiration options (expiresIn in seconds) and token override
 */
export async function getDownloadUrl(
  pathname: string,
  options: DownloadUrlOptions = {}
): Promise<DownloadUrlResult> {
  const token = resolveToken(options.token);
  const baseEndpoint = options.endpoint || getApiEndpoint();
  const downloadUrlEndpoint = `${baseEndpoint}/download-url`;

  const response = await fetch(downloadUrlEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pathname,
      expiresIn: options.expiresIn || 900,
    }),
  });

  if (!response.ok) {
    let errorMsg = `Failed to generate download URL with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {}

    if (response.status === 404) {
      throw new NotFoundError(errorMsg);
    }
    if (response.status === 401) {
      throw new UnauthorizedError(errorMsg);
    }
    throw new VercyStorageError(errorMsg, response.status);
  }

  return (await response.json()) as DownloadUrlResult;
}

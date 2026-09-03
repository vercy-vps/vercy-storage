import { UnauthorizedError } from '../errors.js';

/**
 * Resolves the active Vercy Storage API key from parameter or environment.
 */
export function resolveToken(overrideToken?: string): string {
  if (overrideToken && overrideToken.trim()) {
    return overrideToken.trim();
  }

  const envToken =
    typeof process !== 'undefined' && process.env ? process.env.VERCY_STORAGE_API_KEY : undefined;

  if (envToken && envToken.trim()) {
    return envToken.trim();
  }

  throw new UnauthorizedError(
    'No Vercy Storage API key found. Pass { token } option or set process.env.VERCY_STORAGE_API_KEY.'
  );
}

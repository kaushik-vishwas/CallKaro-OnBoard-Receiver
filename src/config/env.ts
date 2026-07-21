/**
 * Resolves API base URL automatically:
 * - Local `npm run dev` → Vite proxy `/ck-api` (no .env needed)
 * - Production build / Vercel → VITE_API_BASE_URL or live backend
 */
const PRODUCTION_API_BASE_URL = 'https://callkaro.delicod.com/api';

export function getApiBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (import.meta.env.DEV) return '/ck-api';

  return PRODUCTION_API_BASE_URL;
}

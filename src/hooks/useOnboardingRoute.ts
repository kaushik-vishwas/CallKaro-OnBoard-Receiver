import {useMemo} from 'react';
import {useParams, useSearchParams} from 'react-router-dom';

function slugifyName(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '') || 'receiver'
  );
}

function withToken(path: string, token: string) {
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}token=${encodeURIComponent(token)}`;
}

export function useOnboardingRoute() {
  const {token: pathToken, slug: pathSlug} = useParams();
  const [searchParams] = useSearchParams();

  const token = (pathToken || searchParams.get('token') || '').trim();
  const slug = (pathSlug || searchParams.get('slug') || '').trim();

  const urlLabel = useMemo(() => {
    if (slug) return `callkaro.com/useregistration/${slug}`;
    return 'callkaro.com/onboard';
  }, [slug]);

  const formPath = useMemo(() => {
    if (slug) return withToken(`/useregistration/${slug}`, token);
    return `/onboard/${token}`;
  }, [slug, token]);

  const videoPath = useMemo(() => {
    if (slug) return withToken(`/useregistration/${slug}/video`, token);
    return `/onboard/${token}/video`;
  }, [slug, token]);

  const statusPath = useMemo(() => {
    if (slug) return withToken(`/useregistration/${slug}/status`, token);
    return `/onboard/${token}/status`;
  }, [slug, token]);

  /** @deprecated use statusPath */
  const submittedPath = statusPath;

  return {
    token,
    slug,
    urlLabel,
    formPath,
    videoPath,
    statusPath,
    submittedPath,
    slugifyName,
  };
}

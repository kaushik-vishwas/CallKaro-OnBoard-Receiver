import {useEffect, useRef, useState} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {
  fetchOnboarding,
  saveOnboarding,
  submitOnboarding,
  uploadPhoto,
  uploadVideo,
  type OnboardingReceiver,
} from '../../api/onboarding';
import {ApiError} from '../../api/client';
import {useOnboardingRoute} from '../../hooks/useOnboardingRoute';
import {OnboardingLayout} from '../../components/layout/OnboardingLayout/OnboardingLayout';
import {VideoRecorder} from '../../components/onboarding/VideoRecorder/VideoRecorder';
import {Button} from '../../components/ui/Button/Button';
import {captureVideoFaceFrame} from '../../utils/captureVideoFaceFrame';
import styles from './VideoPage.module.css';

export function VideoPage() {
  const {token, formPath, statusPath} = useOnboardingRoute();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [receiver, setReceiver] = useState<OnboardingReceiver | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [faceImageUrl, setFaceImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  /** Keep blob URL alive; don't revoke in Strict Mode effect churn. */
  const localBlobUrlRef = useRef<string>('');

  function revokeLocalBlob() {
    if (localBlobUrlRef.current) {
      URL.revokeObjectURL(localBlobUrlRef.current);
      localBlobUrlRef.current = '';
    }
  }

  function setLocalPreview(blob: Blob) {
    revokeLocalBlob();
    const url = URL.createObjectURL(blob);
    localBlobUrlRef.current = url;
    setPreviewUrl(url);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchOnboarding(token);
        if (cancelled) return;
        const r = data.receiver;
        setReceiver(r);
        if (r.kyc?.videoUrl) {
          setVideoUrl(r.kyc.videoUrl);
          // Prefer keeping local blob if we already have one; else show remote.
          if (!localBlobUrlRef.current) {
            setPreviewUrl(r.kyc.videoUrl);
          }
        }
        if (r.kyc?.faceImageUrl) {
          setFaceImageUrl(r.kyc.faceImageUrl);
        } else if (r.kyc?.videoThumb) {
          setFaceImageUrl(r.kyc.videoThumb);
        }
      } catch {
        if (!cancelled) setReceiver(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (token) void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    return () => {
      revokeLocalBlob();
    };
  }, []);

  async function onRecorded(blob: Blob) {
    setError('');
    setUploading(true);
    try {
      setLocalPreview(blob);
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';

      let faceUrl = '';
      try {
        const frame = await captureVideoFaceFrame(blob);
        const faceFile = new File([frame], 'kyc-face.jpg', {
          type: 'image/jpeg',
        });
        const faceUpload = await uploadPhoto(faceFile);
        faceUrl = faceUpload.url;
        setFaceImageUrl(faceUrl);
      } catch {
        faceUrl = receiver?.photos?.[0] || '';
        setFaceImageUrl(faceUrl);
      }

      const result = await uploadVideo(blob, `verification.${ext}`);
      setVideoUrl(result.url);
      // Keep local blob preview (S3 signed URL often won't play in <video>).
      await saveOnboarding(token, {
        kyc: {
          videoUrl: result.url,
          videoThumb: faceUrl || receiver?.photos?.[0] || '',
          faceImageUrl: faceUrl || undefined,
        },
      });
    } catch (err) {
      setVideoUrl('');
      setFaceImageUrl('');
      revokeLocalBlob();
      setPreviewUrl('');
      setError(err instanceof Error ? err.message : 'Failed to upload video.');
    } finally {
      setUploading(false);
    }
  }

  function onClear() {
    revokeLocalBlob();
    setPreviewUrl('');
    setVideoUrl('');
    setFaceImageUrl('');
    setError('');
  }

  async function onSubmit() {
    if (!videoUrl) {
      setError('Record or upload a verification video first.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitOnboarding(token, {
        kyc: {
          videoUrl,
          videoThumb: faceImageUrl || receiver?.photos?.[0] || '',
          faceImageUrl: faceImageUrl || undefined,
        },
      });
      navigate(statusPath, {replace: true});
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not submit for verification.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) return <Navigate to="/invalid-link" replace />;

  if (loading) {
    return (
      <OnboardingLayout>
        <p className={styles.loading}>Loading…</p>
      </OnboardingLayout>
    );
  }

  if (!receiver) return <Navigate to="/invalid-link" replace />;

  if (
    receiver.status === 'pending_review' ||
    receiver.status === 'active' ||
    receiver.status === 'rejected' ||
    receiver.status === 'inactive'
  ) {
    return <Navigate to={statusPath} replace />;
  }

  const footer = (
    <>
      {error ? <p className={styles.error}>{error}</p> : null}
      <Button
        variant="primary"
        fullWidth
        disabled={submitting || uploading || !videoUrl}
        onClick={() => void onSubmit()}
      >
        {submitting ? 'Submitting…' : 'Submit for Verification'}
      </Button>
      <button
        type="button"
        className={styles.backLink}
        onClick={() => navigate(formPath)}
      >
        Back to profile
      </button>
    </>
  );

  return (
    <OnboardingLayout footer={footer}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Complete Your Profile</p>
        <h1 className={styles.title}>Record your Video</h1>
        <p className={styles.subtitle}>
          Help us verify your identity with a video verification.
        </p>
      </header>

      <VideoRecorder
        previewUrl={previewUrl}
        onRecorded={blob => void onRecorded(blob)}
        onClear={onClear}
        uploading={uploading}
        error={uploading ? 'Uploading video…' : undefined}
      />
    </OnboardingLayout>
  );
}

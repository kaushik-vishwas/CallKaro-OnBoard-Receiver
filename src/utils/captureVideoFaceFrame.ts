/**
 * Grab a JPEG still from a recorded/uploaded video blob for Rekognition.
 */
export async function captureVideoFaceFrame(blob: Blob): Promise<Blob> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const video = document.createElement('video');
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    await new Promise<void>((resolve, reject) => {
      const onError = () => reject(new Error('Could not read verification video.'));
      video.addEventListener('loadeddata', () => resolve(), {once: true});
      video.addEventListener('error', onError, {once: true});
    });

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const seekTo =
      duration > 1 ? Math.min(1, duration * 0.35) : Math.max(0, duration * 0.5);

    if (seekTo > 0) {
      await new Promise<void>(resolve => {
        const onSeeked = () => resolve();
        video.addEventListener('seeked', onSeeked, {once: true});
        video.currentTime = seekTo;
        // Some browsers never fire seeked for short clips
        setTimeout(resolve, 800);
      });
    }

    const width = video.videoWidth || 720;
    const height = video.videoHeight || 1280;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not capture face frame.');
    }
    ctx.drawImage(video, 0, 0, width, height);

    const frame = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', 0.92),
    );
    if (!frame) {
      throw new Error('Could not capture face frame.');
    }
    return frame;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

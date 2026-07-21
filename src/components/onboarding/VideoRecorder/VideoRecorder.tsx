import {useEffect, useRef, useState} from 'react';
import {Loader2, RotateCcw, Upload} from 'lucide-react';
import styles from './VideoRecorder.module.css';

type VideoRecorderProps = {
  previewUrl: string;
  onRecorded: (blob: Blob) => void;
  onClear: () => void;
  uploading?: boolean;
  error?: string;
};

export function VideoRecorder({
  previewUrl,
  onRecorded,
  onClear,
  uploading,
  error,
}: VideoRecorderProps) {
  const liveRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [cameraReady, setCameraReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      if (previewUrl) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {facingMode: 'user'},
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        streamRef.current = stream;
        if (liveRef.current) {
          liveRef.current.srcObject = stream;
          await liveRef.current.play().catch(() => undefined);
        }
        setCameraReady(true);
        setCameraError('');
      } catch {
        setCameraError(
          'Camera access denied. You can upload a video file instead.',
        );
        setCameraReady(false);
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    };
  }, [previewUrl]);

  function stopTracks() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;

    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : '';

    const recorder = mimeType
      ? new MediaRecorder(stream, {mimeType})
      : new MediaRecorder(stream);

    recorderRef.current = recorder;
    recorder.ondataavailable = event => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || 'video/webm',
      });
      stopTracks();
      setCameraReady(false);
      onRecorded(blob);
    };
    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  function onFileSelected(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    stopTracks();
    setCameraReady(false);
    onRecorded(file);
    if (fileRef.current) fileRef.current.value = '';
  }

  function retake() {
    onClear();
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        {previewUrl ? (
          <video
            className={styles.video}
            src={previewUrl}
            controls
            playsInline
          />
        ) : (
          <video
            ref={liveRef}
            className={styles.video}
            muted
            playsInline
            autoPlay
          />
        )}

        {!previewUrl ? (
          <button
            type="button"
            className={`${styles.recordBtn} ${recording ? styles.recording : ''}`}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
            disabled={!cameraReady || uploading}
            onClick={() => (recording ? stopRecording() : startRecording())}
          />
        ) : null}
      </div>

      <div className={styles.actions}>
        {previewUrl ? (
          <button
            type="button"
            className={styles.secondary}
            onClick={retake}
            disabled={uploading}
          >
            <RotateCcw size={16} />
            Retake
          </button>
        ) : (
          <button
            type="button"
            className={styles.secondary}
            onClick={() => fileRef.current?.click()}
            disabled={uploading || recording}
          >
            {uploading ? <Loader2 size={16} className={styles.spin} /> : <Upload size={16} />}
            Upload video
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className={styles.hidden}
        onChange={event => onFileSelected(event.target.files)}
      />

      {cameraError && !previewUrl ? (
        <p className={styles.hint}>{cameraError}</p>
      ) : null}
      {recording ? <p className={styles.hint}>Recording… tap the button to stop</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}

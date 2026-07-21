import {useRef, useState} from 'react';
import {Camera, ImagePlus, Loader2, Upload, X} from 'lucide-react';
import {uploadPhotos as uploadPhotosApi} from '../../../api/onboarding';
import styles from './PhotoUpload.module.css';

type PhotoUploadProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
  error?: string;
};

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 5;

export function PhotoUpload({photos, onChange, error}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  function openPicker(capture?: boolean) {
    const input = inputRef.current;
    if (!input) return;
    if (capture) {
      input.setAttribute('capture', 'environment');
    } else {
      input.removeAttribute('capture');
    }
    input.click();
  }

  async function onFilesSelected(fileList: FileList | null) {
    if (!fileList?.length) return;
    const remaining = MAX_PHOTOS - photos.length;
    const files = Array.from(fileList).slice(0, remaining);
    if (!files.length) return;

    setUploading(true);
    setUploadError('');
    try {
      const results = await uploadPhotosApi(files);
      const urls = results.map(r => r.url);
      onChange([...photos, ...urls].slice(0, MAX_PHOTOS));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload photos.',
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  const displayError = error || uploadError;

  return (
    <div className={styles.wrap}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.hidden}
        onChange={event => void onFilesSelected(event.target.files)}
      />

      {photos.length > 0 ? (
        <div className={styles.thumbRow}>
          {photos.map((photo, index) => (
            <div key={`photo-${index}`} className={styles.thumbWrap}>
              <img src={photo} alt={`Profile ${index + 1}`} className={styles.thumb} />
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remove photo ${index + 1}`}
                onClick={() => removePhoto(index)}
              >
                <X size={11} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <button
          type="button"
          className={styles.uploadBox}
          onClick={() => openPicker()}
          disabled={uploading}
        >
          <span className={styles.uploadIcon}>
            {uploading ? <Loader2 size={24} className={styles.spin} /> : <Upload size={24} />}
          </span>
          <span className={styles.uploadLabel}>
            {uploading ? 'Uploading…' : 'Upload'}
          </span>
        </button>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => openPicker(true)}
          disabled={photos.length >= MAX_PHOTOS || uploading}
        >
          <Camera size={17} />
          Camera
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => openPicker()}
          disabled={photos.length >= MAX_PHOTOS || uploading}
        >
          <ImagePlus size={17} />
          Gallery
        </button>
      </div>

      {photos.length > 0 && photos.length < MAX_PHOTOS && !uploading ? (
        <button type="button" className={styles.addMore} onClick={() => openPicker()}>
          + Add more photos ({photos.length}/{MAX_PHOTOS})
        </button>
      ) : null}

      {uploading && photos.length > 0 ? (
        <p className={styles.hint}>Uploading…</p>
      ) : null}

      {displayError ? <p className={styles.error}>{displayError}</p> : null}
      {!displayError && !uploading && photos.length > 0 && photos.length < MIN_PHOTOS ? (
        <p className={styles.hint}>Add at least {MIN_PHOTOS} photos</p>
      ) : null}
    </div>
  );
}

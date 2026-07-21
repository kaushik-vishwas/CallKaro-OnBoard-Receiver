import {useRef, useState} from 'react';
import {Check, CreditCard, FileText, Landmark, Loader2, Upload} from 'lucide-react';
import {uploadDocument as uploadDocApi} from '../../../api/onboarding';
import {KYC_DOC_TYPES, type KycDocId} from '../../../data/constants';
import styles from './KycUploadList.module.css';

export type KycDocState = {
  id: KycDocId;
  title: string;
  thumbnail: string;
  sizeLabel: string;
  url: string;
};

type KycUploadListProps = {
  documents: KycDocState[];
  onChange: (documents: KycDocState[]) => void;
  error?: string;
};

const DOC_ICONS = {
  aadhaar: FileText,
  pan: CreditCard,
  passbook: Landmark,
} as const;

function formatSize(bytes: number) {
  const kb = Math.max(1, Math.round(bytes / 1024));
  return `${kb} kb`;
}

export function KycUploadList({documents, onChange, error}: KycUploadListProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingIdRef = useRef<KycDocId | null>(null);
  const [uploadingId, setUploadingId] = useState<KycDocId | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function openUpload(id: KycDocId) {
    pendingIdRef.current = id;
    inputRef.current?.click();
  }

  async function onFileSelected(fileList: FileList | null) {
    const id = pendingIdRef.current;
    if (!id || !fileList?.[0]) return;
    const file = fileList[0];

    setUploadingId(id);
    setUploadError('');
    try {
      const result = await uploadDocApi(file, id);
      const meta = KYC_DOC_TYPES.find(doc => doc.id === id)!;
      const nextDoc: KycDocState = {
        id,
        title: meta.title,
        thumbnail: result.url,
        sizeLabel: formatSize(result.size),
        url: result.url,
      };

      const others = documents.filter(doc => doc.id !== id);
      onChange([...others, nextDoc]);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload document.',
      );
    } finally {
      setUploadingId(null);
      pendingIdRef.current = null;
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const displayError = error || uploadError;

  return (
    <div className={styles.wrap}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className={styles.hidden}
        onChange={event => void onFileSelected(event.target.files)}
      />

      <ul className={styles.list}>
        {KYC_DOC_TYPES.map(type => {
          const uploaded = documents.find(doc => doc.id === type.id);
          const isUploading = uploadingId === type.id;
          const Icon = DOC_ICONS[type.id];
          return (
            <li key={type.id} className={styles.item}>
              <span className={styles.docIcon} aria-hidden>
                <Icon size={18} />
              </span>
              <div className={styles.meta}>
                <p className={styles.title}>{type.title}</p>
                <p className={styles.subtitle}>{type.subtitle}</p>
                {uploaded ? (
                  <button
                    type="button"
                    className={styles.viewLink}
                    onClick={() => setPreviewUrl(uploaded.url)}
                  >
                    View
                  </button>
                ) : null}
              </div>
              {isUploading ? (
                <span className={styles.uploading}>
                  <Loader2 size={18} className={styles.spin} />
                </span>
              ) : uploaded ? (
                <span className={styles.doneBadge} aria-label="Uploaded">
                  <Check size={18} strokeWidth={3} />
                </span>
              ) : (
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => openUpload(type.id)}
                >
                  <Upload size={15} />
                  Upload
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {displayError ? <p className={styles.error}>{displayError}</p> : null}

      {previewUrl ? (
        <div
          className={styles.previewOverlay}
          role="presentation"
          onClick={() => setPreviewUrl(null)}
        >
          <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
            <img src={previewUrl} alt="Document preview" className={styles.previewImg} />
            <button
              type="button"
              className={styles.closePreview}
              onClick={() => setPreviewUrl(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

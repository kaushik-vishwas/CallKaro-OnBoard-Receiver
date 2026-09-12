import {useEffect, useMemo, useState} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {
  fetchOnboarding,
  saveOnboarding,
  type OnboardingReceiver,
} from '../../api/onboarding';
import {ApiError} from '../../api/client';
import {
  BIO_MAX_LENGTH,
  KYC_DOC_TYPES,
  LANGUAGE_OPTIONS,
} from '../../data/constants';
import {useOnboardingRoute} from '../../hooks/useOnboardingRoute';
import {OnboardingLayout} from '../../components/layout/OnboardingLayout/OnboardingLayout';
import {
  LockedFields,
  ManagedByAgentBadge,
} from '../../components/onboarding/LockedFields/LockedFields';
import {PhotoUpload} from '../../components/onboarding/PhotoUpload/PhotoUpload';
import {LanguageChips} from '../../components/onboarding/LanguageChips/LanguageChips';
import {
  KycUploadList,
  type KycDocState,
} from '../../components/onboarding/KycUploadList/KycUploadList';
import {BankSecurityBanner} from '../../components/onboarding/BankSecurityBanner/BankSecurityBanner';
import {FormSection} from '../../components/ui/FormSection/FormSection';
import {Field, TextAreaField} from '../../components/ui/Field/Field';
import {Button} from '../../components/ui/Button/Button';
import styles from './OnboardingPage.module.css';

type FormErrors = Partial<
  Record<'photos' | 'bio' | 'languages' | 'bank' | 'kyc' | 'form', string>
>;

function docsFromReceiver(receiver: OnboardingReceiver): KycDocState[] {
  return (receiver.kyc?.documents || []).map(doc => ({
    id: doc.id as KycDocState['id'],
    title: doc.title,
    thumbnail: doc.thumbnail,
    sizeLabel: doc.sizeLabel,
    url: doc.url,
  }));
}

export function OnboardingPage() {
  const {token, videoPath, statusPath, slug} = useOnboardingRoute();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [receiver, setReceiver] = useState<OnboardingReceiver | null>(null);
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [bank, setBank] = useState({
    holderName: '',
    accountNumber: '',
    ifsc: '',
    upiId: '',
  });
  const [documents, setDocuments] = useState<KycDocState[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchOnboarding(token);
        if (cancelled) return;
        const r = data.receiver;
        setReceiver(r);
        setBio(r.bio || '');
        setLanguages(r.languages || []);
        setPhotos(r.photos || []);
        setBank({
          holderName: r.bank?.holderName || r.name,
          accountNumber: r.bank?.accountNumber || '',
          ifsc: r.bank?.ifsc || '',
          upiId: r.bank?.upiId || '',
        });
        setDocuments(docsFromReceiver(r));
      } catch (err) {
        if (!cancelled) {
          setNotFound(err instanceof ApiError && err.statusCode === 404);
        }
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
    if (!receiver || !token || slug) return;
    const canonicalSlug =
      receiver.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '') || 'receiver';
    navigate(
      `/useregistration/${canonicalSlug}?token=${encodeURIComponent(token)}`,
      {replace: true},
    );
  }, [receiver, token, slug, navigate]);

  const canSubmit = useMemo(() => {
    return (
      photos.length >= 3 &&
      bio.trim().length >= 20 &&
      languages.length > 0 &&
      bank.holderName.trim() &&
      bank.accountNumber.trim() &&
      bank.ifsc.trim() &&
      documents.length >= KYC_DOC_TYPES.length
    );
  }, [photos, bio, languages, bank, documents]);

  function validate(): boolean {
    const next: FormErrors = {};
    if (photos.length < 3) next.photos = 'Upload at least 3 profile photos.';
    if (!bio.trim() || bio.trim().length < 20) {
      next.bio = 'Write a short bio (at least 20 characters).';
    }
    if (!languages.length) next.languages = 'Select at least one language.';
    if (languages.length > 3) {
      next.languages = 'You can select a maximum of 3 languages.';
    }
    if (!bank.holderName.trim()) next.bank = 'Account holder name is required.';
    if (!bank.accountNumber.trim() || !bank.ifsc.trim()) {
      next.bank = 'Bank account number and IFSC are required.';
    }
    if (documents.length < KYC_DOC_TYPES.length) {
      next.kyc = 'Upload all required KYC documents.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onNextStep() {
    if (!receiver || !validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      await saveOnboarding(token, {
        bio: bio.trim(),
        languages,
        photos,
        bank: {
          holderName: bank.holderName.trim(),
          accountNumber: bank.accountNumber.trim(),
          ifsc: bank.ifsc.trim().toUpperCase(),
          upiId: bank.upiId.trim(),
        },
        kyc: {
          documents: documents.map(doc => ({
            id: doc.id,
            title: doc.title,
            sizeLabel: doc.sizeLabel,
            thumbnail: doc.thumbnail,
            url: doc.url,
          })),
        },
      });
      navigate(videoPath);
    } catch (err) {
      setErrors({
        form:
          err instanceof ApiError
            ? err.message
            : 'Could not save profile. Try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const footer = (
    <>
      {errors.form ? <p className={styles.error}>{errors.form}</p> : null}
      <Button
        variant="primary"
        fullWidth
        disabled={submitting || !canSubmit}
        onClick={() => void onNextStep()}
      >
        {submitting ? 'Saving…' : 'Next Step'}
      </Button>
    </>
  );

  if (!token) {
    return <Navigate to="/invalid-link" replace />;
  }

  if (loading) {
    return (
      <OnboardingLayout>
        <p className={styles.loading}>Loading your profile…</p>
      </OnboardingLayout>
    );
  }

  if (notFound || !receiver) {
    return <Navigate to="/invalid-link" replace />;
  }

  if (
    receiver.status === 'pending_review' ||
    receiver.status === 'active' ||
    receiver.status === 'rejected' ||
    receiver.status === 'inactive'
  ) {
    return <Navigate to={statusPath} replace />;
  }

  return (
    <OnboardingLayout footer={footer}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Complete Your Profile</h1>
        <p className={styles.subtitle}>
          Help us set up your receiver profile to start earning
        </p>
      </header>

      <FormSection
        title="Basic Details"
        headerExtra={<ManagedByAgentBadge />}
      >
        <LockedFields
          name={receiver.name}
          age={receiver.age}
          gender={receiver.gender}
        />
      </FormSection>

      <FormSection
        title="Profile Photos / Videos"
        subtitle="Upload 3-5 clear photos of yourself"
        required
      >
        <PhotoUpload photos={photos} onChange={setPhotos} error={errors.photos} />
      </FormSection>

      <FormSection title="About You">
        <TextAreaField
          subtitle="Tell users what makes you special"
          value={bio}
          onChange={setBio}
          placeholder="Hi! I'm a friendly listener who loves connecting with people..."
          maxLength={BIO_MAX_LENGTH}
          hint="Add personality to your profile"
          error={errors.bio}
        />
      </FormSection>

      <FormSection
        title="Languages"
        subtitle="Select up to 3 languages you can speak"
        required
      >
        <LanguageChips
          options={LANGUAGE_OPTIONS}
          value={languages}
          onChange={setLanguages}
          max={3}
          error={errors.languages}
        />
      </FormSection>

      <FormSection
        title="Bank Details"
        subtitle="For receiving payments"
        required
      >
        <BankSecurityBanner />
        <div className={styles.bankGrid}>
          <Field
            label="Account Holder Name"
            placeholder="As per bank records"
            value={bank.holderName}
            onChange={event =>
              setBank(prev => ({...prev, holderName: event.target.value}))
            }
          />
          <Field
            label="Bank Account Number"
            placeholder="Enter account number"
            value={bank.accountNumber}
            onChange={event =>
              setBank(prev => ({...prev, accountNumber: event.target.value}))
            }
          />
          <Field
            label="IFSC Code"
            placeholder="e.g., SBIN0001234"
            value={bank.ifsc}
            onChange={event =>
              setBank(prev => ({...prev, ifsc: event.target.value}))
            }
          />
          <Field
            label="UPI ID (Optional)"
            placeholder="yourname@upi"
            value={bank.upiId}
            onChange={event =>
              setBank(prev => ({...prev, upiId: event.target.value}))
            }
          />
        </div>
        {errors.bank ? <p className={styles.error}>{errors.bank}</p> : null}
      </FormSection>

      <FormSection title="KYC Documents" required>
        <KycUploadList
          documents={documents}
          onChange={setDocuments}
          error={errors.kyc}
        />
      </FormSection>
    </OnboardingLayout>
  );
}

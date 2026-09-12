import {useCallback, useEffect, useState} from 'react';
import {Link, Navigate, useNavigate} from 'react-router-dom';
import {AlertCircle, Check, PartyPopper, RefreshCw, Timer, X} from 'lucide-react';
import {
  fetchOnboarding,
  retryOnboarding,
  type OnboardingReceiver,
} from '../../api/onboarding';
import {ApiError} from '../../api/client';
import {useOnboardingRoute} from '../../hooks/useOnboardingRoute';
import {OnboardingLayout} from '../../components/layout/OnboardingLayout/OnboardingLayout';
import {Button} from '../../components/ui/Button/Button';
import styles from './StatusPage.module.css';

export function StatusPage() {
  const {token, formPath, videoPath} = useOnboardingRoute();
  const navigate = useNavigate();
  const [receiver, setReceiver] = useState<OnboardingReceiver | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await fetchOnboarding(token);
      setReceiver(data.receiver);
    } catch (err) {
      setReceiver(null);
      setError(
        err instanceof ApiError ? err.message : 'Could not load status.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) void load();
  }, [token, load]);

  async function onTryAgain() {
    setRetrying(true);
    setError('');
    try {
      await retryOnboarding(token);
      navigate(formPath, {replace: true});
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not reopen profile.',
      );
    } finally {
      setRetrying(false);
    }
  }

  if (!token) return <Navigate to="/invalid-link" replace />;

  if (loading) {
    return (
      <OnboardingLayout>
        <p className={styles.loading}>Checking status…</p>
      </OnboardingLayout>
    );
  }

  if (!receiver) {
    return <Navigate to="/invalid-link" replace />;
  }

  if (
    receiver.status === 'pending_onboarding' ||
    receiver.status === 'draft'
  ) {
    if (receiver.kyc?.videoUrl) {
      return <Navigate to={videoPath} replace />;
    }
    return <Navigate to={formPath} replace />;
  }

  if (receiver.status === 'rejected' || receiver.status === 'inactive') {
    const isTerminated = receiver.status === 'inactive';
    return (
      <OnboardingLayout>
        <div className={styles.rejectWrap}>
          <span className={styles.rejectIcon} aria-hidden>
            <X size={36} strokeWidth={3} />
          </span>
          <h1 className={styles.rejectTitle}>
            {isTerminated ? 'Oops! Profile Terminated' : 'Oops! Profile Rejected'}
          </h1>
          <p className={styles.rejectDue}>due to</p>
          <p className={styles.rejectReason}>
            <AlertCircle size={16} />
            {receiver.rejectionReason ||
              (isTerminated
                ? 'Profile terminated by your agent.'
                : 'Please update your details and try again.')}
          </p>
          {error ? <p className={styles.error}>{error}</p> : null}
          <Button
            variant="outline"
            fullWidth
            className={styles.rejectBtn}
            disabled={retrying}
            onClick={() => void onTryAgain()}
          >
            {retrying ? 'Opening…' : 'Try Again'}
          </Button>
        </div>
      </OnboardingLayout>
    );
  }

  if (receiver.status === 'active') {
    return (
      <OnboardingLayout>
        <div className={styles.approveWrap}>
          <span className={styles.party} aria-hidden>
            <PartyPopper size={56} strokeWidth={1.75} />
          </span>
          <h1 className={styles.approveTitle}>Yess! Profile Approved</h1>
          <p className={styles.approveSubtitle}>
            Contact your agent to get the receiver app and start earning.
          </p>
          <div className={styles.agentNote}>
            <p className={styles.agentNoteTitle}>How to get the app</p>
            <p className={styles.agentNoteBody}>
              The receiver APK is not available on the Play Store. Message your
              agent and ask them to share the official receiver APK install file
              with you.
            </p>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  // pending_review
  return (
    <OnboardingLayout>
      <div className={styles.pendingHero}>
        <span className={styles.clock} aria-hidden>
          <Timer size={56} strokeWidth={1.75} />
        </span>
        <h1 className={styles.pendingTitle}>Submitted for Verification</h1>
      </div>

      <div className={styles.card}>
        <StatusRow label="Agent Created Profile" done />
        <StatusRow label="Receiver has filled the Profile" done />
        <StatusRow label="Waiting for Agent's Approval" done={false} />
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.refreshWrap}>
        <Button
          variant="primary"
          disabled={refreshing}
          leftIcon={
            <RefreshCw size={16} className={refreshing ? styles.spin : undefined} />
          }
          onClick={() => void load(true)}
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      <p className={styles.hint}>
        Your agent will review your profile soon.{' '}
        <Link to={formPath} className={styles.link}>
          View profile
        </Link>
      </p>
    </OnboardingLayout>
  );
}

function StatusRow({label, done}: {label: string; done: boolean}) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      {done ? (
        <span className={styles.check} aria-label="Done">
          <Check size={16} strokeWidth={3} />
        </span>
      ) : (
        <span className={styles.dot} aria-label="Pending" />
      )}
    </div>
  );
}

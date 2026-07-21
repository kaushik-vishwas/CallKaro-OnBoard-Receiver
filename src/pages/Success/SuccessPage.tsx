import {Link} from 'react-router-dom';
import {CircleCheck} from 'lucide-react';
import {OnboardingLayout} from '../../components/layout/OnboardingLayout/OnboardingLayout';
import {useOnboardingRoute} from '../../hooks/useOnboardingRoute';
import styles from './SuccessPage.module.css';

export function SuccessPage() {
  const {token, slug} = useOnboardingRoute();

  const backHref = slug
    ? `/useregistration/${slug}?token=${encodeURIComponent(token)}`
    : `/onboard/${token}`;

  return (
    <OnboardingLayout>
      <div className={styles.wrap}>
        <span className={styles.icon} aria-hidden>
          <CircleCheck size={42} strokeWidth={2.25} />
        </span>
        <h1 className={styles.title}>Profile Submitted!</h1>
        <p className={styles.subtitle}>
          Your profile has been sent to your agent for review. You will be
          notified once it is approved.
        </p>
        {token ? (
          <Link to={backHref} className={styles.link}>
            View submission
          </Link>
        ) : null}
      </div>
    </OnboardingLayout>
  );
}

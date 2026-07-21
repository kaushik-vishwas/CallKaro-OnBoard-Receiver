import {OnboardingLayout} from '../../components/layout/OnboardingLayout/OnboardingLayout';
import styles from './InvalidLinkPage.module.css';

export function InvalidLinkPage() {
  return (
    <OnboardingLayout>
      <div className={styles.wrap}>
        <h1 className={styles.title}>Invalid onboarding link</h1>
        <p className={styles.subtitle}>
          This link may have expired or is incorrect. Ask your agent to send a
          new onboarding link.
        </p>
      </div>
    </OnboardingLayout>
  );
}

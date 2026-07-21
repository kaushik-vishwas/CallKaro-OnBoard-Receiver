import type {ReactNode} from 'react';
import styles from './OnboardingLayout.module.css';

type OnboardingLayoutProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export function OnboardingLayout({children, footer}: OnboardingLayoutProps) {
  return (
    <div className={styles.page}>
      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.logoMark}>C</span>
            <span className={styles.logoText}>Callkaro</span>
          </div>
        </div>
      </header>

      <div className={styles.mainWrap}>
        <main className={styles.content}>{children}</main>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>
  );
}

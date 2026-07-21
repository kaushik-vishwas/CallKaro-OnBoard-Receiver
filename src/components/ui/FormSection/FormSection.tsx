import type {ReactNode} from 'react';
import styles from './FormSection.module.css';

type FormSectionProps = {
  title: string;
  subtitle?: string;
  required?: boolean;
  headerExtra?: ReactNode;
  children: ReactNode;
};

export function FormSection({
  title,
  subtitle,
  required,
  headerExtra,
  children,
}: FormSectionProps) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <h2 className={styles.title}>
            {title}
            {required ? <span className={styles.required}>*</span> : null}
          </h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {headerExtra ? <div className={styles.headerExtra}>{headerExtra}</div> : null}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

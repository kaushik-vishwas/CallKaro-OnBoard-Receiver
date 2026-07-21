import type {ReactNode} from 'react';
import styles from './SectionCard.module.css';

type SectionCardProps = {
  title: string;
  subtitle?: string;
  required?: boolean;
  children: ReactNode;
};

export function SectionCard({title, subtitle, required, children}: SectionCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          {title}
          {required ? <span className={styles.required}>*</span> : null}
        </h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

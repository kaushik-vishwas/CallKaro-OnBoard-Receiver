import {ShieldCheck} from 'lucide-react';
import styles from './BankSecurityBanner.module.css';

export function BankSecurityBanner() {
  return (
    <div className={styles.banner}>
      <ShieldCheck size={18} className={styles.icon} />
      <p>Your banking information is encrypted and secure</p>
    </div>
  );
}

import {Lock} from 'lucide-react';
import {Field} from '../../ui/Field/Field';
import styles from './LockedFields.module.css';

type LockedFieldsProps = {
  name: string;
  age: number;
  gender: string;
};

export function ManagedByAgentBadge() {
  return (
    <span className={styles.badge}>
      <Lock size={12} />
      Managed by Agent
    </span>
  );
}

export function LockedFields({name, age, gender}: LockedFieldsProps) {
  const lock = <Lock size={14} />;

  return (
    <div className={styles.wrap}>
      <Field
        label="Full Name"
        value={name}
        readOnly
        locked
        rightAdornment={lock}
      />
      <div className={styles.row}>
        <Field
          label="Age"
          value={String(age)}
          readOnly
          locked
          rightAdornment={lock}
        />
        <Field
          label="Gender"
          value={gender}
          readOnly
          locked
          rightAdornment={lock}
        />
      </div>
    </div>
  );
}

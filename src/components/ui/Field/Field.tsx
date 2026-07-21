import type {InputHTMLAttributes, ReactNode} from 'react';
import styles from './Field.module.css';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  rightAdornment?: ReactNode;
  locked?: boolean;
};

export function Field({
  label,
  error,
  rightAdornment,
  locked = false,
  className = '',
  ...props
}: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.inputWrap}>
        <input
          className={[
            styles.input,
            locked ? styles.locked : '',
            error ? styles.inputError : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {rightAdornment ? (
          <span className={styles.adornment}>{rightAdornment}</span>
        ) : null}
      </div>
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}

type TextAreaFieldProps = {
  label?: string;
  subtitle?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  hint?: string;
  rows?: number;
};

export function TextAreaField({
  label,
  subtitle,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  hint,
  rows = 5,
}: TextAreaFieldProps) {
  return (
    <label className={styles.field}>
      {label ? <span className={styles.label}>{label}</span> : null}
      {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
      <div className={styles.textareaWrap}>
        <textarea
          className={[styles.textarea, error ? styles.inputError : '']
            .filter(Boolean)
            .join(' ')}
          value={value}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          onChange={event => onChange(event.target.value)}
        />
        {maxLength ? (
          <span className={styles.counter}>
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
      {hint ? <span className={styles.fieldHint}>{hint}</span> : null}
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}

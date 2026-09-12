import styles from './LanguageChips.module.css';

type LanguageChipsProps = {
  options: readonly string[];
  value: string[];
  onChange: (languages: string[]) => void;
  error?: string;
  /** Max languages a receiver can select (default 3). */
  max?: number;
};

export function LanguageChips({
  options,
  value,
  onChange,
  error,
  max = 3,
}: LanguageChipsProps) {
  function toggle(language: string) {
    if (value.includes(language)) {
      onChange(value.filter(item => item !== language));
      return;
    }
    if (value.length >= max) {
      return;
    }
    onChange([...value, language]);
  }

  const atLimit = value.length >= max;

  return (
    <div className={styles.wrap}>
      <p className={styles.hint}>
        Select up to {max} languages ({value.length}/{max})
      </p>
      <div className={styles.chips}>
        {options.map(language => {
          const active = value.includes(language);
          const disabled = !active && atLimit;
          return (
            <button
              key={language}
              type="button"
              className={[
                styles.chip,
                active ? styles.active : '',
                disabled ? styles.disabled : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={disabled}
              onClick={() => toggle(language)}
            >
              {language}
            </button>
          );
        })}
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}

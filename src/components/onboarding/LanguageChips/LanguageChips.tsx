import styles from './LanguageChips.module.css';

type LanguageChipsProps = {
  options: readonly string[];
  value: string[];
  onChange: (languages: string[]) => void;
  error?: string;
};

export function LanguageChips({options, value, onChange, error}: LanguageChipsProps) {
  function toggle(language: string) {
    if (value.includes(language)) {
      onChange(value.filter(item => item !== language));
      return;
    }
    onChange([...value, language]);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.chips}>
        {options.map(language => {
          const active = value.includes(language);
          return (
            <button
              key={language}
              type="button"
              className={[styles.chip, active ? styles.active : ''].join(' ')}
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

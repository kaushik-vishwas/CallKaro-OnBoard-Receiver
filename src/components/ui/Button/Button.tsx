import type {ButtonHTMLAttributes, ReactNode} from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'outline';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
};

export function Button({
  variant = 'primary',
  fullWidth = false,
  leftIcon,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        styles.button,
        styles[variant],
        fullWidth ? styles.fullWidth : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {leftIcon ? <span className={styles.icon}>{leftIcon}</span> : null}
      <span>{children}</span>
    </button>
  );
}

import React, { forwardRef, useState, type MouseEvent } from 'react';
import styles from './Button.module.scss';
import cn from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style variant of the button.
   */
  variant?: 'fill' | 'outlined' | 'content';
  /**
   * The color scheme of the button.
   */
  color?: 'primary' | 'neutral' | 'danger' | 'warning';
  /**
   * The size of the button.
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * The content to be displayed inside the button.
   */
  children: React.ReactNode;
}

interface Ripple {
  id: number;
  top: number;
  left: number;
  size: number;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'fill',
      color = 'neutral',
      size = 'md',
      className,
      children,
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const buttonClasses = cn(
      styles.button,
      styles[`variant-${variant}`],
      styles[`color-${color}`],
      styles[`size-${size}`],
      className
    );

    const handleRippleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
      }

      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();

      const size = Math.max(button.clientWidth, button.clientHeight) * 2;

      const top = e.clientY - rect.top;
      const left = e.clientX - rect.left;
      const id = Date.now();

      const newRipple: Ripple = { id, top, left, size };

      setRipples((prevRipples) => [...prevRipples, newRipple]);
    };

    const handleAnimationEnd = (id: number) => {
      setRipples((prevRipples) => prevRipples.filter((r) => r.id !== id));
    };

    return (
      <button
        ref={ref}
        className={buttonClasses}
        type={type}
        onClick={handleRippleClick}
        {...props}
      >
        {children}
        <div className={styles.rippleContainer}>
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className={styles.ripple}
              onAnimationEnd={() => handleAnimationEnd(ripple.id)}
              style={{
                top: ripple.top,
                left: ripple.left,
                width: ripple.size,
                height: ripple.size,
              }}
            />
          ))}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };

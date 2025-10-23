import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';
import styles from './Button.module.scss';

describe('Button', () => {
  it('should render the button with its children', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('should apply default variant, color, and size classes when not specified', () => {
    render(<Button>Default Button</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass(styles['variant-fill']);
    expect(buttonElement).toHaveClass(styles['color-neutral']);
    expect(buttonElement).toHaveClass(styles['size-md']);
  });

  it('should apply specified color and size classes with default variant', () => {
    render(
      <Button color="primary" size="lg">
        Primary LG
      </Button>
    );
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass(styles['variant-fill']);
    expect(buttonElement).toHaveClass(styles['color-primary']);
    expect(buttonElement).toHaveClass(styles['size-lg']);
  });

  it('should apply specified variant, color, and size classes', () => {
    render(
      <Button variant="outlined" color="danger" size="sm">
        Outlined Danger SM
      </Button>
    );
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass(styles['variant-outlined']);
    expect(buttonElement).toHaveClass(styles['color-danger']);
    expect(buttonElement).toHaveClass(styles['size-sm']);
  });

  it('should apply content variant and warning color', () => {
    render(
      <Button variant="content" color="warning">
        Content Warning
      </Button>
    );
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass(styles['variant-content']);
    expect(buttonElement).toHaveClass(styles['color-warning']);
  });

  it('should call the onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    const buttonElement = screen.getByRole('button', { name: /clickable/i });
    await user.click(buttonElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled and not call onClick when the disabled prop is true', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled Button
      </Button>
    );

    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeDisabled();

    await user.click(buttonElement).catch(() => {
    });

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have type="button" by default', () => {
    render(<Button>Default Type</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveAttribute('type', 'button');
  });

  it('should override the type attribute when specified', () => {
    render(<Button type="submit">Submit</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveAttribute('type', 'submit');
  });

  it('should forward the ref to the underlying button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe('Ref Button');
  });

  it('should apply any additional className passed', () => {
    const customClass = 'my-custom-class';
    render(<Button className={customClass}>Custom Class</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass(customClass);
    expect(buttonElement).toHaveClass(styles.button);
  });
});

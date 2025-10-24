import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from './DropdownMenu';

/**
 * Defines the props for the smoke test component.
 */
interface SmokeTestMenuProps {
  /**
   * The label for the trigger button.
   */
  triggerLabel: string;
}

/**
 * A minimal component for smoke testing the DropdownMenu.
 * It only checks if the trigger renders correctly in JSDOM.
 * @param {SmokeTestMenuProps} props - The props for the smoke test.
 */
const SmokeTestMenu: React.FC<SmokeTestMenuProps> = ({ triggerLabel }) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>{triggerLabel}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <div>Contenido</div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

describe('DropdownMenu (Unit)', () => {
  it('should render the trigger', () => {
    render(<SmokeTestMenu triggerLabel="Open Menu" />);
    expect(
      screen.getByRole('button', { name: /open menu/i })
    ).toBeInTheDocument();
  });

  it('should not render the content initially (JSDOM)', () => {
    render(<SmokeTestMenu triggerLabel="Open Menu" />);
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });
});

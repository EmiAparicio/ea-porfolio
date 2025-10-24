import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import styled, { css, keyframes } from 'styled-components';

const slideUpAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideRightAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideDownAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideLeftAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const contentStyles = css`
  font-family: 'Nunito', sans-serif;
  min-width: 220px;
  background-color: var(--bg-popover, var(--bg-surface));
  border-radius: 6px;
  padding: 5px;
  box-shadow: var(--shadow-popover, 0px 10px 38px -10px rgba(22, 23, 24, 0.35));
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;

  &[data-state='open'] {
    &[data-side='top'] {
      animation-name: ${slideDownAndFade};
    }
    &[data-side='right'] {
      animation-name: ${slideLeftAndFade};
    }
    &[data-side='bottom'] {
      animation-name: ${slideUpAndFade};
    }
    &[data-side='left'] {
      animation-name: ${slideRightAndFade};
    }
  }
`;

export const StyledContent = styled(RadixDropdownMenu.Content)`
  ${contentStyles}
`;

export const StyledSubContent = styled(RadixDropdownMenu.SubContent)`
  ${contentStyles}
`;

export const StyledArrow = styled(RadixDropdownMenu.Arrow)`
  fill: var(--bg-popover, var(--bg-surface));
`;

export const StyledTrigger = styled(RadixDropdownMenu.Trigger)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background-color: var(--bg-hover);
    border-color: var(--border-strong, var(--border-strong));
  }

  &[data-state='open'] {
    background-color: var(--bg-hover);
    border-color: var(--border-strong, var(--border-strong));
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }

  &[data-disabled] {
    color: var(--text-disabled);
    background-color: var(--bg-disabled);
    border-color: var(--border-disabled);
    cursor: not-allowed;
  }
`;

const itemStyles = css`
  font-size: 13px;
  line-height: 1;
  color: var(--text-primary);
  border-radius: 3px;
  display: flex;
  align-items: center;
  height: 25px;
  padding: 0 5px 0 25px;
  position: relative;
  user-select: none;
  outline: none;

  &[data-disabled] {
    color: var(--text-disabled);
    pointer-events: none;
  }

  &[data-highlighted] {
    background-color: var(--color-accent);
    color: var(--color-accent-text);
  }
`;

export const StyledRightSlot = styled.div`
  margin-left: auto;
  padding-left: 20px;
  color: var(--text-secondary);

  [data-highlighted] > & {
    color: var(--color-accent-text);
  }

  [data-disabled] > & {
    color: var(--text-disabled);
  }
`;

export const StyledItem = styled(RadixDropdownMenu.Item)<{ $danger?: boolean }>`
  ${itemStyles}

  ${(props) =>
    props.$danger &&
    css`
      color: var(--semantic-danger-default);

      &[data-highlighted] {
        background-color: var(--semantic-danger-default);
        color: var(--semantic-text-on-color);

        & ${StyledRightSlot} {
          color: var(--semantic-text-on-color);
        }
      }
    `}
`;

export const StyledCheckboxItem = styled(RadixDropdownMenu.CheckboxItem)`
  ${itemStyles}
`;

export const StyledRadioItem = styled(RadixDropdownMenu.RadioItem)`
  ${itemStyles}
`;

export const StyledSubTrigger = styled(RadixDropdownMenu.SubTrigger)`
  ${itemStyles}

  &[data-state='open'] {
    background-color: var(--color-accent);
    color: var(--color-accent-text);
  }
`;

export const StyledLabel = styled(RadixDropdownMenu.Label)`
  padding-left: 25px;
  font-size: 12px;
  line-height: 2.5;
  color: var(--text-secondary);
`;

export const StyledSeparator = styled(RadixDropdownMenu.Separator)`
  height: 1px;
  background-color: var(--border-default);
  margin: 5px;
`;

export const StyledItemIndicator = styled(RadixDropdownMenu.ItemIndicator)`
  position: absolute;
  left: 0;
  width: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

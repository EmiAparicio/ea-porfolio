import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  CheckIcon,
  ChevronRightIcon,
  DotFilledIcon,
} from '@radix-ui/react-icons';
import React, { type ComponentRef } from 'react';
import { Button, type ButtonProps } from '../Button';
import * as S from './DropdownMenu.styles';

/**
 * The root component for the dropdown menu.
 */
const DropdownMenu = RadixDropdownMenu.Root;

/**
 * Props for the DropdownMenuTrigger, extending Radix's trigger props and the custom Button props.
 */
type DropdownMenuTriggerProps = ButtonProps &
  RadixDropdownMenu.DropdownMenuTriggerProps;

/**
 * A button that toggles the dropdown menu's open state.
 * It uses the custom Button component by default and accepts all ButtonProps.
 */
const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(
  (
    {
      children,
      variant = 'fill',
      color = 'neutral',
      size = 'md',
      className,
      onClick,
      asChild,
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <RadixDropdownMenu.Trigger asChild disabled={disabled}>
        <Button
          ref={ref}
          variant={variant}
          color={color}
          size={size}
          className={className}
          onClick={onClick}
          disabled={disabled}
          {...rest}
        >
          {children}
        </Button>
      </RadixDropdownMenu.Trigger>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

/**
 * Portals the dropdown content to the end of the document body.
 */
const DropdownMenuPortal = RadixDropdownMenu.Portal;

/**
 * The root component for a submenu.
 */
const DropdownMenuSub = RadixDropdownMenu.Sub;

/**
 * A container for DropdownMenuRadioItem components.
 */
const DropdownMenuRadioGroup = RadixDropdownMenu.RadioGroup;

type DropdownMenuContentProps = React.ComponentPropsWithoutRef<
  typeof S.StyledContent
>;

/**
 * Container for all dropdown items.
 * Recommended to be wrapped in DropdownMenuPortal for better z-index management.
 */
const DropdownMenuContent = React.forwardRef<
  ComponentRef<typeof S.StyledContent>,
  DropdownMenuContentProps
>(({ children, ...props }, ref) => (
  <S.StyledContent {...props} ref={ref}>
    {children}
  </S.StyledContent>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

type DropdownMenuItemProps = React.ComponentPropsWithoutRef<
  typeof S.StyledItem
> & {
  /**
   * If true, styles the item as a destructive action.
   */
  danger?: boolean;
};

/**
 * A standard, clickable dropdown item.
 */
const DropdownMenuItem = React.forwardRef<
  ComponentRef<typeof S.StyledItem>,
  DropdownMenuItemProps
>(({ children, danger, ...props }, ref) => {
  return (
    <S.StyledItem {...props} $danger={danger} ref={ref}>
      {children}
    </S.StyledItem>
  );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

type DropdownMenuCheckboxItemProps = React.ComponentPropsWithoutRef<
  typeof S.StyledCheckboxItem
>;

/**
 * A dropdown item that can be checked or unchecked.
 */
const DropdownMenuCheckboxItem = React.forwardRef<
  ComponentRef<typeof S.StyledCheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ children, ...props }, ref) => (
  <S.StyledCheckboxItem {...props} ref={ref}>
    {children}
    <S.StyledItemIndicator>
      <CheckIcon />
    </S.StyledItemIndicator>
  </S.StyledCheckboxItem>
));
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

type DropdownMenuRadioItemProps = React.ComponentPropsWithoutRef<
  typeof S.StyledRadioItem
>;

/**
 * A dropdown item that is part of a DropdownMenuRadioGroup.
 */
const DropdownMenuRadioItem = React.forwardRef<
  ComponentRef<typeof S.StyledRadioItem>,
  DropdownMenuRadioItemProps
>(({ children, ...props }, ref) => (
  <S.StyledRadioItem {...props} ref={ref}>
    {children}
    <S.StyledItemIndicator>
      <DotFilledIcon />
    </S.StyledItemIndicator>
  </S.StyledRadioItem>
));
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

type DropdownMenuSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof S.StyledSubTrigger
>;

/**
 * An item that opens a submenu when hovered or clicked.
 */
const DropdownMenuSubTrigger = React.forwardRef<
  ComponentRef<typeof S.StyledSubTrigger>,
  DropdownMenuSubTriggerProps
>(({ children, ...props }, ref) => (
  <S.StyledSubTrigger {...props} ref={ref}>
    {children}
    <S.StyledRightSlot>
      <ChevronRightIcon />
    </S.StyledRightSlot>
  </S.StyledSubTrigger>
));
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

type DropdownMenuSubContentProps = React.ComponentPropsWithoutRef<
  typeof S.StyledSubContent
>;

/**
 * Container for submenu items.
 */
const DropdownMenuSubContent = React.forwardRef<
  ComponentRef<typeof S.StyledSubContent>,
  DropdownMenuSubContentProps
>(({ children, ...props }, ref) => (
  <S.StyledSubContent {...props} ref={ref}>
    {children}
  </S.StyledSubContent>
));
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

type DropdownMenuLabelProps = React.ComponentPropsWithoutRef<
  typeof S.StyledLabel
>;

/**
 * A non-interactive label or title within the dropdown.
 */
const DropdownMenuLabel = React.forwardRef<
  ComponentRef<typeof S.StyledLabel>,
  DropdownMenuLabelProps
>((props, ref) => <S.StyledLabel {...props} ref={ref} />);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

type DropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<
  typeof S.StyledSeparator
>;

/**
 * A horizontal line to separate groups of items.
 */
const DropdownMenuSeparator = React.forwardRef<
  ComponentRef<typeof S.StyledSeparator>,
  DropdownMenuSeparatorProps
>((props, ref) => <S.StyledSeparator {...props} ref={ref} />);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

type DropdownMenuShortcutProps = React.ComponentPropsWithoutRef<
  typeof S.StyledRightSlot
>;

/**
 * A container for text, typically a keyboard shortcut, aligned to the right.
 */
const DropdownMenuShortcut = React.forwardRef<
  ComponentRef<typeof S.StyledRightSlot>,
  DropdownMenuShortcutProps
>(({ children, ...props }, ref) => {
  return (
    <S.StyledRightSlot {...props} ref={ref}>
      {children}
    </S.StyledRightSlot>
  );
});
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

/**
 * An optional arrow to visually connect the trigger and content.
 * Should be placed inside DropdownMenuContent.
 */
const DropdownMenuArrow = S.StyledArrow;

export {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};

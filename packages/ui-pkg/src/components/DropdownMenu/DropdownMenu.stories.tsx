import i18n from '@i18n';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import {
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
} from './DropdownMenu';

type DropdownStoryProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuContent
> &
  React.ComponentPropsWithoutRef<typeof DropdownMenu> & {
    /**
     * Controls the theme of the Storybook canvas for demonstration purposes.
     */
    storyTheme?: 'light' | 'dark';
    /**
     * Injected by ThemeDecorator to ensure portal renders within the theme boundary.
     */
    portalContainer?: HTMLElement;
    /**
     * When `false`, prevents the content from overflowing the viewport boundaries.
     * Set to `false` to disable automatic repositioning.
     */
    avoidCollisions?: boolean;
  };

const ThemeDecorator: Decorator<DropdownStoryProps> = (Story, context) => {
  const { storyTheme = 'light' } = context.args as {
    storyTheme?: 'light' | 'dark';
  };
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setContainer}
      data-theme={storyTheme}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems:
          context.args.side === 'top'
            ? 'flex-end'
            : context.args.side === 'bottom' ||
                ((context.args.side === 'left' ||
                  context.args.side === 'right') &&
                  context.args.align === 'start')
              ? 'flex-start'
              : (context.args.side === 'left' ||
                    context.args.side === 'right') &&
                  context.args.align === 'end'
                ? 'flex-end'
                : 'center',
        width: '100%',
        minHeight: '400px',
        borderRadius: '6px',
        background: 'var(--bg-surface)',
        position: 'relative',
        transition: 'background-color 0.3s ease',
        boxSizing: 'border-box',
        padding: '2rem',
      }}
    >
      {container && (
        <Story
          {...context}
          args={{ ...context.args, portalContainer: container }}
        />
      )}
    </div>
  );
};

const KitchenSinkMenu = (props: DropdownStoryProps & { open?: boolean }) => {
  const {
    side,
    sideOffset,
    align,
    alignOffset,
    modal,
    open: defaultOpen,
    portalContainer,
    avoidCollisions,
  } = props;
  const [hmrEnabled, setHmrEnabled] = useState(true);
  const [framework, setFramework] = useState('react');

  return (
    <DropdownMenu modal={modal} open={defaultOpen}>
      <DropdownMenuTrigger color="primary">
        {i18n.t('dropdownMenu.stories.demo.trigger')}
      </DropdownMenuTrigger>
      <DropdownMenuPortal container={portalContainer}>
        <DropdownMenuContent
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          avoidCollisions={avoidCollisions}
        >
          <DropdownMenuLabel>
            {i18n.t('dropdownMenu.stories.demo.group1.label')}
          </DropdownMenuLabel>
          <DropdownMenuItem>
            {i18n.t('dropdownMenu.stories.demo.group1.item1.label')}
            <DropdownMenuShortcut>
              {i18n.t('dropdownMenu.stories.demo.group1.item1.shortcut')}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            {i18n.t('dropdownMenu.stories.demo.group1.item2.label')}
            <DropdownMenuShortcut>
              {i18n.t('dropdownMenu.stories.demo.group1.item2.shortcut')}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem danger>
            {i18n.t('dropdownMenu.stories.demo.group1.item3.label')}
            <DropdownMenuShortcut>
              {i18n.t('dropdownMenu.stories.demo.group1.item3.shortcut')}
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuCheckboxItem
            checked={hmrEnabled}
            onCheckedChange={setHmrEnabled}
          >
            {i18n.t('dropdownMenu.stories.demo.group2.checkboxLabel')}
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuRadioGroup
            value={framework}
            onValueChange={setFramework}
          >
            <DropdownMenuLabel>
              {i18n.t('dropdownMenu.stories.demo.group3.label')}
            </DropdownMenuLabel>
            <DropdownMenuRadioItem value="react">
              {i18n.t('dropdownMenu.stories.demo.group3.radio1')}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="vue">
              {i18n.t('dropdownMenu.stories.demo.group3.radio2')}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="svelte">
              {i18n.t('dropdownMenu.stories.demo.group3.radio3')}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {i18n.t('dropdownMenu.stories.demo.group4.subTrigger')}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal container={portalContainer}>
              <DropdownMenuSubContent avoidCollisions={avoidCollisions}>
                <DropdownMenuItem>
                  {i18n.t('dropdownMenu.stories.demo.group4.subItem1')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {i18n.t('dropdownMenu.stories.demo.group4.subItem2')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  {i18n.t('dropdownMenu.stories.demo.group4.subItem3')}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuArrow />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};

const meta: Meta<DropdownStoryProps> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  decorators: [ThemeDecorator],
  parameters: {
    docs: {
      description: {
        component: `${i18n.t('dropdownMenu.componentDescription')}

${i18n.t('dropdownMenu.radixNote')}`,
      },
      story: {
        height: '450px',
      },
    },
  },
  argTypes: {
    storyTheme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
      description: i18n.t('storyTheme.description'),
      table: { category: 'Story Config', type: { summary: undefined } },
    },
    side: {
      control: 'select',
      description: i18n.t('dropdownMenu.argTypes.side.description'),
      options: ['top', 'right', 'bottom', 'left'],
      table: {
        category: 'Positioning',
        type: { summary: "'top' | 'right' | 'bottom' | 'left'" },
        defaultValue: { summary: 'bottom' },
      },
    },
    sideOffset: {
      control: 'number',
      description: i18n.t('dropdownMenu.argTypes.sideOffset.description'),
      table: { category: 'Positioning', defaultValue: { summary: '5' } },
    },
    align: {
      control: 'select',
      description: i18n.t('dropdownMenu.argTypes.align.description'),
      options: ['start', 'center', 'end'],
      table: {
        category: 'Positioning',
        type: { summary: "'start' | 'center' | 'end'" },
        defaultValue: { summary: 'center' },
      },
    },
    alignOffset: {
      control: 'number',
      description: i18n.t('dropdownMenu.argTypes.alignOffset.description'),
      table: {
        category: 'Positioning',
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    avoidCollisions: {
      control: 'boolean',
      description:
        'When `true`, prevents the content from colliding with the edges of the viewport. Set to `false` to disable automatic repositioning.',
      table: { category: 'Positioning', defaultValue: { summary: 'false' } },
    },
    modal: {
      control: 'boolean',
      description: i18n.t('dropdownMenu.argTypes.modal.description'),
      table: {
        category: 'Behavior',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
  args: {
    storyTheme: 'light',
    side: 'bottom',
    align: 'center',
    sideOffset: 5,
    modal: false,
    avoidCollisions: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  name: i18n.t('dropdownMenu.stories.primary.name'),
  render: (args) => <KitchenSinkMenu {...args} />,
};

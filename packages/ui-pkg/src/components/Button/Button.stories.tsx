import i18n from '@i18n';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Button, type ButtonProps } from './Button';

type ButtonStoryProps = ButtonProps & {
  storyTheme?: 'light' | 'dark';
};

const ThemeDecorator: Decorator<ButtonStoryProps> = (Story, context) => {
  const { storyTheme = 'light' } = context.args as {
    storyTheme?: 'light' | 'dark';
  };
  return (
    <div
      data-theme={storyTheme}
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        borderRadius: '6px',
        background: 'var(--bg-surface)',
        paddingTop: '2rem',
        paddingBottom: '2rem',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Story />
    </div>
  );
};

const BothThemesWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: '1rem' }}>
    <div
      data-theme="light"
      style={{
        flex: 1,
        padding: '1rem',
        background: 'var(--bg-app)',
        borderRadius: '6px',
      }}
    >
      {children}
    </div>
    <div
      data-theme="dark"
      style={{
        flex: 1,
        padding: '1rem',
        background: 'var(--bg-app)',
        borderRadius: '6px',
      }}
    >
      {children}
    </div>
  </div>
);

const meta: Meta<ButtonStoryProps> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  decorators: [ThemeDecorator],
  parameters: { docs: { description: i18n.t('button.componentDescription') } },
  argTypes: {
    storyTheme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
      description: i18n.t('storyTheme.description'),
      table: { category: 'Story Config', type: { summary: undefined } },
    },
    variant: {
      control: 'select',
      description: i18n.t('button.argTypes.variant.description'),
      options: ['fill', 'outlined', 'content'],
      table: {
        category: 'Appearance',
        type: { summary: "'fill' | 'outlined' | 'content'" },
      },
    },
    color: {
      control: 'select',
      description: i18n.t('button.argTypes.color.description'),
      options: ['primary', 'neutral', 'danger', 'warning'],
      table: {
        category: 'Appearance',
        type: { summary: "'primary' | 'neutral' | 'danger' | 'warning'" },
      },
    },
    size: {
      control: 'inline-radio',
      description: i18n.t('button.argTypes.size.description'),
      options: ['sm', 'md', 'lg'],
      table: {
        category: 'Appearance',
        type: { summary: "'sm' | 'md' | 'lg'" },
      },
    },
    children: {
      control: 'text',
      description: i18n.t('button.argTypes.children.description'),
      table: { category: 'Content' },
    },
    disabled: {
      control: 'boolean',
      description: i18n.t('button.argTypes.disabled.description'),
      table: { category: 'State', type: { summary: 'boolean' } },
    },
    type: {
      control: false,
      description: i18n.t('button.argTypes.type.description'),
      table: { category: 'Accessibility' },
    },
    onClick: {
      control: false,
      action: 'clicked',
      description: i18n.t('button.argTypes.onClick.description'),
      table: { category: 'Events', type: { summary: undefined } },
    },
    className: {
      control: false,
      description: i18n.t('button.argTypes.className.description'),
      table: { category: 'Styling', type: { summary: undefined } },
    },
    style: {
      control: false,
      description: i18n.t('button.argTypes.style.description'),
      table: { category: 'Styling', type: { summary: undefined } },
    },
  },
  args: {
    storyTheme: 'light',
    children: i18n.t('button.stories.primary.children'),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  name: i18n.t('button.stories.primary.name'),
  args: {
    variant: 'fill',
    color: 'primary',
    storyTheme: 'light',
  },
  render: (args) => (
    <Button {...args}>
      {args.children || i18n.t('button.stories.primary.children')}
    </Button>
  ),
};

export const AllVariantsInBothThemes: Story = {
  name: i18n.t('button.stories.allVariantsInBothThemes.name'),
  decorators: [],
  parameters: { controls: { hideNoControlsWarning: true } },
  render: (args) => {
    const { children: _children, ...restArgs } = args;
    return (
      <BothThemesWrapper>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Button {...restArgs} color="primary" variant="fill">
            {i18n.t('button.stories.allVariants.fill')}
          </Button>
          <Button {...restArgs} color="primary" variant="outlined">
            {i18n.t('button.stories.allVariants.outlined')}
          </Button>
          <Button {...restArgs} color="primary" variant="content">
            {i18n.t('button.stories.allVariants.content')}
          </Button>
        </div>
      </BothThemesWrapper>
    );
  },
};

export const AllColorsInBothThemes: Story = {
  name: i18n.t('button.stories.allColorsInBothThemes.name'),
  decorators: [],
  parameters: { controls: { hideNoControlsWarning: true } },
  render: (args) => {
    const { children: _children, ...restArgs } = args;
    return (
      <BothThemesWrapper>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Button {...restArgs} variant="fill" color="primary">
            {i18n.t('button.stories.allColors.primary')}
          </Button>
          <Button {...restArgs} variant="fill" color="neutral">
            {i18n.t('button.stories.allColors.neutral')}
          </Button>
          <Button {...restArgs} variant="fill" color="danger">
            {i18n.t('button.stories.allColors.danger')}
          </Button>
          <Button {...restArgs} variant="fill" color="warning">
            {i18n.t('button.stories.allColors.warning')}
          </Button>
        </div>
      </BothThemesWrapper>
    );
  },
};

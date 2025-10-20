import type { Decorator, Preview } from '@storybook/react-vite';
import React, { useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../src/i18n';
import '../src/styles/theme.css';

type AppMessage = {
  type: 'theme-change' | 'lang-change';
  payload: string;
};

const StoryWrapper = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const themeHandler = (themeName: string) => {
      document.body.setAttribute('data-theme', themeName);
    };

    const handleMessage = (event: MessageEvent<AppMessage>) => {
      if (event.data && event.data.type) {
        if (event.data.type === 'theme-change') {
          themeHandler(event.data.payload);
        }
        if (event.data.type === 'lang-change') {
          i18n.changeLanguage(event.data.payload);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [i18n]);

  return <>{children}</>;
};

const withAppProviders: Decorator = (Story) => {
  return (
    <I18nextProvider i18n={i18n}>
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    </I18nextProvider>
  );
};

const preview: Preview = {
  decorators: [withAppProviders],
  parameters: {},
};

export default preview;

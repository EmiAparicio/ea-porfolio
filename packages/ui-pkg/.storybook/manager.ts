import { STORYBOOK_READY_EVENT, THEME_CHANGE_EVENT } from 'shared-constants';

import { addons } from 'storybook/manager-api';
import { themes } from 'storybook/theming';

addons.setConfig({
  toolbar: {
    theme: { hidden: true },
  },
});

const channel = addons.getChannel();

setTimeout(() => {
  window.parent.postMessage({ type: STORYBOOK_READY_EVENT }, '*');
}, 50);

window.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  if (type === THEME_CHANGE_EVENT) {
    const storybookTheme = payload === 'light' ? themes.light : themes.dark;
    addons.setConfig({
      theme: storybookTheme,
    });
  }
});

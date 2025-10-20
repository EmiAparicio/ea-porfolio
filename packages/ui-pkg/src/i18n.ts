import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome_message: 'Welcome to the Component Library',
      button_docs: 'This is a versatile button component.',
    },
  },
  es: {
    translation: {
      welcome_message: 'Bienvenido a la Librería de Componentes',
      button_docs: 'Este es un componente de botón versátil.',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

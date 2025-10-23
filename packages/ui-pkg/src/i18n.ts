import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANG_STORAGE_KEY } from 'shared-constants';

const resources = {
  en: {
    translation: {
      button: {
        componentDescription:
          'The main button component, used to trigger actions. It accepts variants for different purposes and sizes for visual hierarchy.',
        argTypes: {
          storyTheme: {
            description: 'Switches the theme context for the component.',
          },
          variant: {
            description: 'The visual style of the button.',
          },
          color: {
            description: 'The color scheme of the button.',
          },
          size: {
            description: 'The size of the button.',
          },
          disabled: {
            description: 'If `true`, the button will be disabled.',
          },
          children: {
            description: 'The content to be displayed inside the button.',
          },
          onClick: {
            description: 'Optional click handler.',
          },
          type: {
            description: 'The native HTML `type` attribute of the button.',
          },
          className: {
            description: 'Optional CSS class name to apply to the button.',
          },
          style: {
            description: 'Optional inline styles to apply to the button.',
          },
        },
        stories: {
          primary: {
            name: 'Primary',
            children: 'Primary Button',
          },
          allVariants: {
            name: 'All Variants',
            fill: 'Fill',
            outlined: 'Outlined',
            content: 'Content',
          },
          allColors: {
            name: 'All Colors',
            primary: 'Primary',
            neutral: 'Neutral',
            danger: 'Danger',
            warning: 'Warning',
          },
          allVariantsInBothThemes: {
            name: 'All Variants (Light/Dark)',
          },
          allColorsInBothThemes: {
            name: 'All Colors (Light/Dark)',
          },
          sizes: {
            name: 'All Sizes',
            small: 'Small',
            medium: 'Medium',
            large: 'Large',
          },
          disabled: {
            name: 'Disabled State',
          },
        },
      },
    },
  },
  es: {
    translation: {
      button: {
        componentDescription:
          'El componente principal de botón, usado para disparar acciones. Acepta variantes para diferentes propósitos y tamaños para jerarquía visual.',
        argTypes: {
          storyTheme: {
            description: 'Cambia el contexto del tema para el componente.',
          },
          variant: {
            description: 'El estilo visual del botón.',
          },
          color: {
            description: 'El esquema de color del botón.',
          },
          size: {
            description: 'El tamaño del botón.',
          },
          disabled: {
            description: 'Si es `true`, el botón estará deshabilitado.',
          },
          children: {
            description: 'El contenido a ser mostrado dentro del botón.',
          },
          onClick: {
            description: 'Manejador de clic opcional.',
          },
          type: {
            description: 'El atributo HTML nativo `type` del botón.',
          },
          className: {
            description: 'Clase CSS opcional para aplicar al botón.',
          },
          style: {
            description: 'Estilos en línea opcionales para aplicar al botón.',
          },
        },
        stories: {
          primary: {
            name: 'Primario',
            children: 'Botón Primario',
          },
          allVariants: {
            name: 'Todas las Variantes',
            fill: 'Relleno (Fill)',
            outlined: 'Contorno (Outlined)',
            content: 'Contenido (Content)',
          },
          allColors: {
            name: 'Todos los Colores',
            primary: 'Primario',
            neutral: 'Neutral',
            danger: 'Peligro',
            warning: 'Advertencia',
          },
          allVariantsInBothThemes: {
            name: 'Variantes (Claro/Oscuro)',
          },
          allColorsInBothThemes: {
            name: 'Colores (Claro/Oscuro)',
          },
          sizes: {
            name: 'Todos los Tamaños',
            small: 'Pequeño',
            medium: 'Mediano',
            large: 'Grande',
          },
          disabled: {
            name: 'Estado Deshabilitado',
          },
        },
      },
    },
  },
};

const getInitialLanguage = () => {
  try {
    const langFromStorage = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (
      langFromStorage &&
      (langFromStorage === 'en' || langFromStorage === 'es')
    ) {
      return langFromStorage;
    }
  } catch (_e) {}
  return 'en';
};

const initialLang = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANG_STORAGE_KEY } from 'shared-constants';

const resources = {
  en: {
    translation: {
      storyTheme: {
        description: 'Switches the theme context for the component.',
      },
      button: {
        componentDescription:
          'The main button component, used to trigger actions. It accepts variants for different purposes and sizes for visual hierarchy.',
        argTypes: {
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
      dropdownMenu: {
        componentDescription:
          'A context menu that opens on-demand when a user interacts with a trigger element. It displays a list of actions or options.',
        radixNote:
          'Note: This component is a wrapper around Radix UI Dropdown Menu. All props from the underlying Radix components (e.g., `Content`, `Item`, `SubContent`) are available and will be passed down.',
        argTypes: {
          side: {
            description:
              'The preferred side of the trigger to render the content against.',
          },
          sideOffset: {
            description:
              'The distance (in pixels) from the trigger to the content.',
          },
          align: {
            description:
              'The preferred alignment of the content against the trigger.',
          },
          alignOffset: {
            description: 'An offset (in pixels) from the preferred alignment.',
          },
          modal: {
            description:
              "When true, prevents interaction with elements outside the menu while it's open.",
          },
        },
        stories: {
          primary: {
            name: 'Primary Demo',
          },
          demo: {
            trigger: 'Open Dev Menu',
            group1: {
              label: 'Developer Settings',
              item1: {
                label: 'Git Profile',
                shortcut: '⇧+G',
              },
              item2: {
                label: 'Editor Settings',
                shortcut: '⌘+,',
              },
              item3: {
                label: 'Delete Project',
                shortcut: '⇧+⌘+D',
              },
            },
            group2: {
              checkboxLabel: 'Enable HMR',
            },
            group3: {
              label: 'Select Framework',
              radio1: 'React',
              radio2: 'Vue',
              radio3: 'Svelte',
            },
            group4: {
              subTrigger: 'Refactor',
              subItem1: 'Rename Component',
              subItem2: 'Extract to Hook',
              subItem3: 'Wrap with Memo',
            },
          },
        },
      },
      advancedAnalyticsChart: {
        meta: {
          description:
            'A composite chart (Bar + Line) with dual Y-axes, using D3 for advanced formatting and calculations. Ideal for complex analytics dashboards.',
        },
        argTypes: {
          data: {
            description:
              'The data array is now set automatically in the "render" function based on xAxisKey.',
          },
          xAxisKey: {
            description:
              'The key in data to use for the X-axis. This will also swap the dataset.',
          },
          barDataKey: {
            description: 'The key in data to use for the Bar chart data.',
          },
          lineDataKey: {
            description: 'The key in data to use for the Line chart data.',
          },
          barName: {
            description: 'A human-readable label for the Bar chart data.',
          },
          lineName: {
            description: 'A human-readable label for the Line chart data.',
          },
          yAxisLeftLabel: {
            description: 'Descriptive label for the left Y-axis (Line).',
          },
          yAxisRightLabel: {
            description: 'Descriptive label for the right Y-axis (Bar).',
          },
          enableDataBrush: {
            description:
              'If true, enables a data brush slider at the bottom to navigate large datasets while keeping Y-axes static.',
          },
          xAxisFormatType: {
            description:
              'Specifies if the X-axis data is time-based or categorical.',
          },
          yAxisLeftFormat: {
            description: 'A d3-format string for the left Y-axis ticks.',
          },
          yAxisRightFormat: {
            description: 'A d3-format string for the right Y-axis ticks.',
          },
          tooltipDateFormat: {
            description:
              'A d3-time-format string for the tooltip label (if time).',
          },
          tooltipValueFormat: {
            description: 'A d3-format string for the tooltip values.',
          },
          xAxisTickFormat: {
            description: 'A d3-format string for the X-axis ticks (if time).',
          },
        },
        args: {
          barName: 'Units Sold',
          lineName: 'Revenue',
          yAxisLeftLabel: 'Revenue (USD)',
          yAxisRightLabel: 'Units',
        },
        stories: {
          primary: {
            name: 'Controllable Chart',
          },
        },
      },
    },
  },
  es: {
    translation: {
      storyTheme: {
        description: 'Cambia el contexto del tema para el componente.',
      },
      button: {
        componentDescription:
          'El componente principal de botón, usado para disparar acciones. Acepta variantes para diferentes propósitos y tamaños para jerarquía visual.',
        argTypes: {
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
      dropdownMenu: {
        componentDescription:
          'Un menú contextual que se abre bajo demanda cuando un usuario interactúa con un elemento disparador. Muestra una lista de acciones u opciones.',
        radixNote:
          'Nota: Este componente es un contenedor sobre Radix UI Dropdown Menu. Todas las props de los componentes subyacentes de Radix (ej. `Content`, `Item`, `SubContent`) están disponibles y se pasarán automáticamente.',
        argTypes: {
          side: {
            description:
              'El lado preferido del disparador contra el cual renderizar el contenido.',
          },
          sideOffset: {
            description:
              'La distancia (en píxeles) desde el disparador hasta el contenido.',
          },
          align: {
            description:
              'La alineación preferida del contenido contra el disparador.',
          },
          alignOffset: {
            description:
              'Un desplazamiento (en píxeles) desde la alineación preferida.',
          },
          modal: {
            description:
              'Si es verdadero, previene la interacción con elementos fuera del menú mientras está abierto.',
          },
        },
        stories: {
          primary: {
            name: 'Demo Principal',
          },
          demo: {
            trigger: 'Abrir Menú Dev',
            group1: {
              label: 'Ajustes de Desarrollador',
              item1: {
                label: 'Perfil de Git',
                shortcut: '⇧+G',
              },
              item2: {
                label: 'Ajustes del Editor',
                shortcut: '⌘+,',
              },
              item3: {
                label: 'Eliminar Proyecto',
                shortcut: '⇧+⌘+D',
              },
            },
            group2: {
              checkboxLabel: 'Habilitar HMR',
            },
            group3: {
              label: 'Seleccionar Framework',
              radio1: 'React',
              radio2: 'Vue',
              radio3: 'Svelte',
            },
            group4: {
              subTrigger: 'Refactorizar',
              subItem1: 'Renombrar Componente',
              subItem2: 'Extraer a Hook',
              subItem3: 'Envolver con Memo',
            },
          },
        },
      },
      advancedAnalyticsChart: {
        meta: {
          description:
            'Un gráfico compuesto (Barra + Línea) con ejes Y duales, que utiliza D3 para formateo y cálculos avanzados. Ideal para dashboards de analítica complejos.',
        },
        argTypes: {
          data: {
            description:
              'El array de datos se establece automáticamente en la función "render" según el xAxisKey.',
          },
          xAxisKey: {
            description:
              'La clave en los datos a usar para el eje X. Esto también cambiará el conjunto de datos.',
          },
          barDataKey: {
            description:
              'La clave en los datos a usar para los datos del gráfico de Barras.',
          },
          lineDataKey: {
            description:
              'La clave en los datos a usar para los datos del gráfico de Línea.',
          },
          barName: {
            description:
              'Una etiqueta legible para los datos del gráfico de Barras.',
          },
          lineName: {
            description:
              'Una etiqueta legible para los datos del gráfico de Línea.',
          },
          yAxisLeftLabel: {
            description:
              'Etiqueta descriptiva para el eje Y izquierdo (Línea).',
          },
          yAxisRightLabel: {
            description: 'Etiqueta descriptiva para el eje Y derecho (Barra).',
          },
          enableDataBrush: {
            description:
              'Si es verdadero, activa un deslizador (brush) en la parte inferior para navegar grandes conjuntos de datos manteniendo los ejes Y estáticos.',
          },
          xAxisFormatType: {
            description:
              'Especifica si los datos del eje X se basan en el tiempo o en categorías.',
          },
          yAxisLeftFormat: {
            description:
              'Un string de formato d3 para las marcas del eje Y izquierdo.',
          },
          yAxisRightFormat: {
            description:
              'Un string de formato d3 para las marcas del eje Y derecho.',
          },
          tooltipDateFormat: {
            description:
              'Un string de formato d3-time para la etiqueta del tooltip (si es de tiempo).',
          },
          tooltipValueFormat: {
            description:
              'Un string de formato d3 para los valores del tooltip.',
          },
          xAxisTickFormat: {
            description:
              'Un string de formato d3 para las marcas del eje X (si es de tiempo).',
          },
        },
        args: {
          barName: 'Unidades Vendidas',
          lineName: 'Ingresos',
          yAxisLeftLabel: 'Ingresos (USD)',
          yAxisRightLabel: 'Unidades',
        },
        stories: {
          primary: {
            name: 'Gráfico Controlable',
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

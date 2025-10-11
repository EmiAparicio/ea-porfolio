import { LocaleBase } from '@i18n/utils/constants';
import { normalizeBase } from '@i18n/utils/normalize';
import { isThenable } from '@portfolio/utils/promise';
import { MaybePromiseParams } from '../page';

export default async function WebdevPage(props: MaybePromiseParams) {
  const p = isThenable<{ lang: string }>(props.params)
    ? await props.params
    : props.params;
  const lang = normalizeBase(p.lang) as LocaleBase;

  return (
    <section id="server-content-webdev" className="relative">
      {lang === 'es' ? (
        <div className="sr-only">
          <h1>Desarrollador Frontend - React y Typescript.</h1>
          <article>
            <p>
              Frontend developer con experiencia en React y TypeScript, con foco
              en UX/UI y en crear aplicaciones modernas, fluidas y gamificadas.
              Mi recorrido como desarrollador combina aplicaciones en
              investigación académica y desarrollo profesional, con un enfoque
              fuerte en usabilidad, escalabilidad y diseño visual.
            </p>
            <p>
              Experiencia
              <br />
              Formalmente me desempeñé como Frontend Developer en CityHeroes
              durante 2 años:
              <br />
              <ul>
                <li>
                  Frameworks y librerías: principalmente React y TypeScript,
                  menos de Next.js y React Native
                </li>
                <li>
                  Estilos y UI: TailwindCSS, MUI, Radix, Shadcn, Figma,
                  Storybook
                </li>
                <li>Estado y data: Jotai, React Query, RxDB, PowerSync</li>
                <li>Animación y validación: Framer Motion, Zod</li>
                <li>Internacionalización y tooling: i18n, Vite</li>
                <li>Mapas y datos espaciales: Mapbox</li>
              </ul>
              Además, colaboré en la creación de un paquete de componentes
              publicado en npm.
              <br />
              Desde 2022 he desarrollado proyectos personales y académicos con
              foco en UX/UI, experimentando con diferentes tecnologías
              relacionadas con React apalancado con el uso de IA, en la
              construcción de interfaces fluidas y escalables.
              <br />
              Durante mi doctorado en bioingeniería (6 años) trabajé como
              programador científico, utilizando lenguajes y herramientas como:
              <br />
              <ul>
                <li>Lenguajes: Python, C++, Batch/Bash</li>
                <li>
                  Software científico: LAMMPS, NetLogo, MATLAB, LaTeX,
                  FoamExplorer (desarrollo propio)
                </li>
              </ul>
            </p>
            <p>
              Invasion Tours
              <br />
              Este proyecto individual fue una aplicación web académica que
              ofrecía información sobre todos los países del mundo. Permitía
              buscar países, ver detalles como capitales, continentes y otros
              datos relevantes, y explorarlos a través de un mapa.
              <br />
              Las tecnologías principales utilizadas para su desarrollo fueron:
              <ul>
                <li>React para la construcción de la interfaz de usuario.</li>
                <li>Redux para la gestión del estado de la aplicación.</li>
                <li>
                  Node.js con Express para la creación del servidor backend.
                </li>
                <li>
                  Sequelize junto a PostgreSQL para la gestión y almacenamiento
                  de la base de datos.
                </li>
                <li>CSS para la implementación de estilos visuales.</li>
              </ul>
              <br />
              Además, se agregó una funcionalidad especial que incluye un
              minijuego de búsqueda de pistas en la web, que activaba diferentes
              temas visuales con una temática de aliens e invasiones,
              proporcionando una experiencia interactiva y divertida para el
              usuario.
            </p>
            <p>
              StarCards
              <br />
              Este proyecto fue una aplicación web de un juego de cartas
              inspirado en StarCraft que incluía funcionalidades de comercio
              electrónico, desarrollado como proyecto grupal final.
              <br />
              Las tecnologías principales que se utilizaron fueron:
              <ul>
                <li>HTML, CSS y JavaScript para el desarrollo frontend.</li>
                <li>
                  React y Redux para la construcción de la interfaz y gestión
                  del estado.
                </li>
                <li>
                  Node.js y Express para el desarrollo del servidor backend.
                </li>
                <li>
                  Sequelize para la gestión de la base de datos PostgreSQL.
                </li>
                <li>
                  JWT, Nodemailer y Passport para autenticación y manejo de
                  usuarios.
                </li>
                <li>
                  Socket.io y Firebase para funcionalidades en tiempo real y
                  conexión.
                </li>
              </ul>
              <br />
              Entre las funcionalidades destacaron el registro de usuarios
              (incluyendo inicio con Google), la verificación de correo, la
              exploración de la tienda con productos y carrito, la integración
              con MercadoPago para pagos, perfiles de usuario con inventario y
              chats privados, moderación por administradores, y una sala de
              juego con ranking, historial y chat público, que soportaba
              partidas en tiempo real.
            </p>
          </article>
        </div>
      ) : (
        <div className="sr-only">
          <h1>Frontend Developer - React & Typescript.</h1>
          <article>
            <p>
              Frontend developer with experience in React and TypeScript,
              focused on UX/UI and building modern, fluid, and gamified
              applications. My journey as a developer combines applications in
              academic research and professional development, with a strong
              emphasis on usability, scalability, and visual design.
            </p>
            <p>
              Experience
              <br />
              I worked formally as a Frontend Developer at CityHeroes for 2
              years:
              <br />
              <ul>
                <li>
                  Frameworks & libraries: mainly React & TypeScript, less of
                  Next.js & React Native
                </li>
                <li>
                  Styling & UI: TailwindCSS, MUI, Radix, Shadcn, Figma,
                  Storybook
                </li>
                <li>State & data: Jotai, React Query, RxDB, PowerSync</li>
                <li>Animation & validation: Framer Motion, Zod</li>
                <li>Internationalization & tooling: i18n, Vite</li>
                <li>Maps & spatial data: Mapbox</li>
              </ul>
              I also contributed to the creation of a component package
              published on npm.
              <br />
              Since 2022, I have been developing personal and academic projects
              with a strong focus on UX/UI, experimenting with various
              React-related technologies leveraging AI, to build fluid and
              scalable interfaces.
              <br />
              During my PhD research in bioengineering (6 years), I worked as a
              scientific programmer, using the following languages and tools:
              <br />
              <ul>
                <li>Languages: Python, C++, Batch/Bash</li>
                <li>
                  Scientific software: LAMMPS, NetLogo, MATLAB, LaTeX,
                  FoamExplorer (own development)
                </li>
              </ul>
            </p>
            <p>
              Invasion Tours
              <br />
              This individual project was an academic web application that
              provided information about all the countries around the world. It
              allowed users to search for countries, view details such as
              capitals, continents, and other relevant data, and explore them
              using a map.
              <br />
              The main technologies used for its development were:
              <ul>
                <li>React for building the user interface.</li>
                <li>Redux for application state management.</li>
                <li>Node.js with Express for backend server development.</li>
                <li>
                  Sequelize together with PostgreSQL for database management and
                  storage.
                </li>
                <li>CSS for styling and visual presentation.</li>
              </ul>
              <br />
              Additionally, a special feature was added—a mini-game involving
              clue searches on the web that triggers different visual themes
              with an aliens and invasion theme, offering an engaging and fun
              interactive experience for users.
            </p>
            <p>
              StarCards
              <br />
              This project was a web application about a card game inspired by
              StarCraft with e-commerce features, developed as a final group
              project.
              <br />
              The main technologies used were:
              <ul>
                <li>HTML, CSS, and JavaScript for frontend development.</li>
                <li>
                  React and Redux for building the user interface and state
                  management.
                </li>
                <li>Node.js and Express for backend server development.</li>
                <li>Sequelize for managing the PostgreSQL database.</li>
                <li>
                  JWT, Nodemailer, and Passport for authentication and user
                  management.
                </li>
                <li>
                  Socket.io and Firebase for real-time features and
                  connectivity.
                </li>
              </ul>
              <br />
              Key features included user registration (including Google
              sign-in), email verification, store browsing with products and
              cart, MercadoPago integration for payments, user profiles with
              inventory and private chats, admin moderation, and a playroom with
              ranking, game history, and public chat supporting real-time
              gameplay.
            </p>
          </article>
        </div>
      )}
    </section>
  );
}

import { LocaleBase } from '@i18n/utils/constants';
import { normalizeBase } from '@i18n/utils/normalize';
import { isThenable } from '@portfolio/utils/promise';
import { ParamsType } from '../page';

export default async function GamingPage(props: ParamsType) {
  const p = isThenable<{ lang: string }>(props.params)
    ? await props.params
    : props.params;
  const lang = normalizeBase(p.lang) as LocaleBase;

  return (
    <section id="server-content-gaming" className="relative">
      {lang === 'es' ? (
        <div className="sr-only">
          <h1>Fundador indie, diseñador de juegos y videojuegos.</h1>
          <article>
            <p>
              Diseñador de juegos Indie enfocado en la creación de mecánicas con
              componentes de economía y sistemas dinámicos auto-balanceados. Mi
              objetivo es construir experiencias estratégicas, rejugables y con
              mercados entre jugadores como parte esencial del diseño; a través
              de mi empresa: Oblivion Mechanics.
            </p>
            <p>
              Oblivion Mechanics es una empresa Indie, fundada a comienzos del
              2022, enfocada principalmente en el diseño de videojuegos donde el
              balance de las mecánicas, la estrategia y la libertad de los
              jugadores sean prioridad. Nuestro mayor objetivo es hacer crecer
              la industria de los videojuegos independientes desde las variantes
              multijugador con fuerte énfasis en economías de mercado entre
              jugadores.
            </p>
            <p>
              Univearth es un proyecto de videojuego móvil Indie, multijugador,
              de cartas coleccionables, con mecánicas que combinan exploración,
              recolección de recursos, armado de mazos y batallas en tiempo
              real. Cada jugador personificará un comandante del bando terrestre
              o alien.
              <br />
              Se hace uso de Inteligencia Artificial para acelerar procesos de
              diseño visual, con retoques y correcciones manuales hechas por
              artistas. También se apunta a conseguir financiamiento a través de
              preventas en la blockchain, demostrando a su vez que es una
              herramienta que puede aprovecharse sin crear estafas piramidales.
              <br />
              Mi rol en el proyecto ha sido el de: fundador, gerente de
              proyecto, diseñador del juego tanto en sus mecánicas como en sus
              aspectos visuales y conceptuales, ingeniero de prompts de IA, y
              desarrollador web.
            </p>
          </article>
        </div>
      ) : (
        <div className="sr-only">
          <h1>Indie founder, game and videogame designer.</h1>
          <article>
            <p>
              Indie game designer focused on creating mechanics with economy
              components and self-balancing dynamic systems. My goal is to build
              strategic, replayable experiences with player-driven markets as an
              essential part of the design; through my company: Oblivion
              Mechanics.
            </p>
            <p>
              Oblivion Mechanics is an indie studio, founded in early 2022,
              primarily focused on video game design where balanced mechanics,
              strategy, and player freedom are the priority. Our main goal is to
              help grow the independent games industry through multiplayer
              experiences with a strong emphasis on player‑driven market
              economies.
            </p>
            <p>
              Univearth is an indie mobile, multiplayer trading card video game{' '}
              project with mechanics that combine exploration, resource
              gathering, deckbuilding, and real-time battles. Each player will
              embody a commander from the human or alien faction.
              <br />
              Artificial Intelligence is used to accelerate visual design
              processes, with manual touch-ups and corrections by artists. The
              project also aims to secure funding through blockchain presales,
              demonstrating that it is a tool that can be leveraged without
              creating pyramid schemes.
              <br />
              My role in the project has been: founder, project manager, game
              designer (for both mechanics and visual/conceptual aspects), AI
              prompt engineer, and web developer.
            </p>
          </article>
        </div>
      )}
    </section>
  );
}

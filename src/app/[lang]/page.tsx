import { LocaleBase } from '@i18n/utils/constants';
import { normalizeBase } from '@i18n/utils/normalize';
import { isThenable } from '@portfolio/utils/promise';

export type MaybePromiseParams =
  | { params: { lang: string } }
  | { params: Promise<{ lang: string }> };

export default async function LangHome(props: MaybePromiseParams) {
  const p = isThenable<{ lang: string }>(props.params)
    ? await props.params
    : props.params;
  const lang = normalizeBase(p.lang) as LocaleBase;

  return (
    <section id="server-content-landing" className="relative">
      {lang === 'es' ? (
        <div className="sr-only">
          <h1>
            Bioingeniero, profesor, desarrollador frontend, diseñador de juegos.
          </h1>
          <article>
            Soy bioingeniero y profesor, desarrollador frontend y amante de los
            gatos, con una pasión de toda la vida por la tecnología y la
            programación. Completé mi investigación doctoral en ingeniería antes
            de enfocar mi camino hacia la tecnología creativa. También soy un
            absolutista del metal sinfónico y diseñador de videojuegos indie.
            Actualmente me dedico al desarrollo web, a la enseñanza de
            matemática y física, y a mi emprendimiento de videojuegos Oblivion
            Mechanics. Contacto por: Email, LinkedIn, GitHub.
          </article>
        </div>
      ) : (
        <div className="sr-only">
          <h1>Bioengineer, professor, frontend developer, game designer.</h1>
          <article>
            I am a bioengineer and professor, frontend developer, and cat lover
            with a lifelong passion for technology and programming. I completed
            my doctoral research in engineering before shifting my focus toward
            creative tech. I am also a symphonic metal absolutist and indie
            videogame designer. Nowadays, I divide my time between web
            development, teaching math and physics, and building my videogame
            venture Oblivion Mechanics. Contact by: Email, LinkedIn, GitHub.
          </article>
        </div>
      )}
    </section>
  );
}

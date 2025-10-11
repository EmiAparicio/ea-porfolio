import { LocaleBase } from '@i18n/utils/constants';
import { normalizeBase } from '@i18n/utils/normalize';
import { isThenable } from '@portfolio/utils/promise';
import { MaybePromiseParams } from '../page';

export default async function EngPage(props: MaybePromiseParams) {
  const p = isThenable<{ lang: string }>(props.params)
    ? await props.params
    : props.params;
  const lang = normalizeBase(p.lang) as LocaleBase;

  return (
    <section id="server-content-eng" className="relative">
      {lang === 'es' ? (
        <div className="sr-only">
          <h1>
            Bioingeniero, profesor, investigador, programador científico.
          </h1>
          <article>
            <p>
              Bioingeniero de la Universidad de Mendoza, con experiencia docente
              e investigadora. Mi trayectoria incluye una beca doctoral CONICET,
              publicaciones internacionales en simulaciones atomísticas y años
              como profesor.
              <br />
              Título de grado
              <br />
              Abanderado Nacional 2014, medalla de oro, y uno de los mejores
              promedios entre los egresados de ingeniería de Argentina (Premio
              de la Academia Nacional de Ingeniería). Realicé prácticas
              profesionales en el laboratorio del INBIOMED y desarrollé trabajo
              de tesis sobre simulaciones computacionales de biomateriales.
              <br />
              Beca doctoral CONICET
              <br />
              Desarrollo de trabajo de investigación en simulaciones
              atomísticas: 8 publicaciones científicas. Herramientas y lenguajes
              utilizados:
              <br />
              <ul>
                <li>Simulación y visualización: LAMMPS, OVITO, Gnuplot</li>
                <li>Lenguajes y scripting: C++, MATLAB, Python, Bash</li>
                <li>Documentación científica: LaTeX</li>
                <li>Modelado multiagente: NetLogo</li>
              </ul>
              <br />
              Docencia
              <br />
              <ul>
                <li>
                  3 años: Biomateriales (4.º año de la carrera de
                  Bioingeniería).
                </li>
                <li>3 años: Física (nivel preuniversitario).</li>
                <li>Actual: Cálculo II (2.º año de Ingeniería).</li>
                <li>
                  Clases particulares de matemática y física (todos los
                  niveles).
                </li>
              </ul>
            </p>
          </article>
        </div>
      ) : (
        <div className="sr-only">
          <h1>Bioengineer, professor, researcher, scientific developer.</h1>
          <article>
            <p>
              Bioengineer from Universidad de Mendoza, with teaching and
              research experience. My background includes a CONICET doctoral
              fellowship, international publications on atomistic simulations,
              and several years as a professor.
              <br />
              Undergraduate degree
              <br />
              National Standard Bearer 2014, gold medal, and one of the top
              graduating averages in engineering in Argentina (National Academy
              of Engineering Award). I completed professional internships at the{' '}
              INBIOMED laboratory and carried out thesis work on computational
              simulations of biomaterials.
              <br />
              CONICET doctoral fellowship
              <br />
              Conducted doctoral research in atomistic simulations: 8 scientific
              publications. Tools and languages used:
              <br />
              <ul>
                <li>Simulation & visualization: LAMMPS, OVITO, Gnuplot</li>
                <li>Languages & scripting: C++, MATLAB, Python, Bash</li>
                <li>Scientific documentation: LaTeX</li>
                <li>Multi-agent modeling: NetLogo</li>
              </ul>
              <br />
              Teaching
              <br />
              <ul>
                <li>3 years: Biomaterials (4th year, Bioengineering).</li>
                <li>3 years: Physics (pre-university level).</li>
                <li>Current: Calculus II (2nd year, Engineering).</li>
                <li>
                  Private tutoring in mathematics and physics (all levels).
                </li>
              </ul>
            </p>
          </article>
        </div>
      )}
    </section>
  );
}

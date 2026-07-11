import { Typewriter } from "@/components/ui/typewriter";
import { ShaderBackground } from "@/src/components/ShaderBackground";

const manifesto = `This is Rosebeg.
I am here to create.
I am here to explore.
I am here to redefine.
I am Ha22yX.`;

const projects = [
  ["Project 01", "Primary site"],
  ["Project 02", "Interactive work"],
  ["Project 03", "Visual system"],
  ["Archive", "Older signals"],
];

const socials = [
  ["GitHub", "https://github.com/Ha22yX"],
  ["X", "#"],
  ["Instagram", "#"],
  ["Email", "mailto:hello@rosebeg.com"],
];

function App() {
  return (
    <>
      <ShaderBackground />
      <header className="topbar" aria-label="Primary navigation">
        <a className="wordmark" href="#hero" aria-label="Rosebeg home">
          Rosebeg
        </a>
        <nav className="nav-links">
          <a href="#who">Who</a>
          <a href="#works">Works</a>
          <a href="#social">Social</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main className="site-shell">
        <section id="hero" className="hero-panel" aria-labelledby="hero-title">
          <div className="hero-frame">
            <div className="signal-caption">Ha22yX transmission</div>
            <h1 id="hero-title" aria-label="Rosebeg digital manifesto" className="manifesto-title">
              <Typewriter
                text={manifesto}
                speed={4}
                initialDelay={80}
                loop={false}
                cursorChar="_"
                cursorClassName="cursor-mark"
              />
            </h1>
            <p className="hero-subtitle">
              Personal website and digital portfolio of Ha22yX.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <a className="button button-primary" href="#works">
                View Work
              </a>
              <a className="button button-secondary" href="#contact">
                Contact
              </a>
            </div>
          </div>
        </section>

        <section id="who" className="section-panel who-panel" aria-labelledby="who-title">
          <div className="section-copy">
            <h2 id="who-title">Who</h2>
            <p>
              Ha22yX designs and builds digital spaces with a focus on identity,
              atmosphere, interaction, and visual systems.
            </p>
          </div>
          <div className="identity-panel">
            <span>Signal origin</span>
            <strong>Designer, builder, digital identity maker.</strong>
          </div>
        </section>

        <section id="works" className="section-panel works-panel" aria-labelledby="works-title">
          <div className="section-copy">
            <h2 id="works-title">Works</h2>
            <p>
              Editable portals for other websites, experiments, and digital
              artifacts connected to Rosebeg.
            </p>
          </div>
          <div className="project-grid" aria-label="Portfolio links">
            {projects.map(([label, detail], index) => (
              <a
                className={index === 0 ? "project-link project-large" : "project-link"}
                href="#"
                aria-label={label}
                key={label}
              >
                <span>{label}</span>
                <small>{detail}</small>
              </a>
            ))}
          </div>
        </section>

        <section id="social" className="section-panel social-panel" aria-labelledby="social-title">
          <div className="section-copy">
            <h2 id="social-title">Social</h2>
            <p>
              Public channels and identity endpoints. Replace these placeholders
              with live links when the homepage is ready.
            </p>
          </div>
          <div className="port-list" aria-label="Social links">
            {socials.map(([label, href]) => (
              <a href={href} aria-label={label} key={label}>
                {label}
              </a>
            ))}
          </div>
        </section>

        <section id="contact" className="section-panel contact-panel" aria-labelledby="contact-title">
          <div className="contact-terminal">
            <h2 id="contact-title">Contact</h2>
            <p>
              For collaboration, commissions, or a direct signal to Ha22yX, use
              the terminal below and replace the address later.
            </p>
            <a className="contact-link" href="mailto:hello@rosebeg.com">
              hello@rosebeg.com
            </a>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;

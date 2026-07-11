import { useEffect, useState } from "react";
import { ASCIIText } from "@/components/ui/ascii-text";
import {
  ManifestoTypewriter,
  type ManifestoTitleState,
} from "@/components/ui/manifesto-typewriter";
import { ShaderBackground } from "@/src/components/ShaderBackground";

const asciiLayoutTitle = "Where I redefine";
const compactAsciiLayoutTitle = `Where I
redefine`;
const highlightPrefix = "Where I ";
const highlightPhrases = ["create", "explore", "redefine"];
const initialTitleState: ManifestoTitleState = {
  displayText: "",
  targetText: "This is Rosebeg",
};

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

function formatAsciiTitle(text: string, compact: boolean) {
  if (!compact) {
    return text;
  }

  return text
    .replace("This is Rosebeg", "This is\nRosebeg")
    .replace("Where I create", "Where I\ncreate")
    .replace("Where I explore", "Where I\nexplore")
    .replace("Where I redefine", "Where I\nredefine")
    .replace("I am Ha22yX", "I am\nHa22yX");
}

function getAsciiTitleLayers(text: string, targetText: string, compact: boolean) {
  const displayText = text || " ";
  const anchorText = formatAsciiTitle(targetText || displayText, compact);

  if (!displayText.startsWith(highlightPrefix)) {
    return {
      baseText: formatAsciiTitle(displayText, compact),
      accentText: "",
      baseAnchorText: anchorText,
      accentAnchorText: anchorText,
      baseAlignMode: "anchored" as const,
    };
  }

  const ending = displayText.slice(highlightPrefix.length);
  const hasAccent = ending.length > 0 && highlightPhrases.some((phrase) => phrase.startsWith(ending));

  if (!hasAccent) {
    return {
      baseText: formatAsciiTitle(displayText, compact),
      accentText: "",
      baseAnchorText: anchorText,
      accentAnchorText: anchorText,
      baseAlignMode: "anchored" as const,
    };
  }

  if (compact) {
    return {
      baseText: `Where I\n${" ".repeat(ending.length)}`,
      accentText: `\n${ending}`,
      baseAnchorText: anchorText,
      accentAnchorText: anchorText,
      baseAlignMode: "anchored" as const,
    };
  }

  return {
    baseText: `${highlightPrefix}${" ".repeat(ending.length)}`,
    accentText: `${" ".repeat(highlightPrefix.length)}${ending}`,
    baseAnchorText: anchorText,
    accentAnchorText: anchorText,
    baseAlignMode: "anchored" as const,
  };
}

function App() {
  const [titleState, setTitleState] = useState<ManifestoTitleState>(initialTitleState);
  const [isCompact, setIsCompact] = useState(false);
  const asciiTitle = getAsciiTitleLayers(titleState.displayText, titleState.targetText, isCompact);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 560px)");
    const sync = () => setIsCompact(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <>
      <ShaderBackground />
      <main className="site-shell">
        <section id="hero" className="hero-panel" aria-labelledby="hero-title">
          <div className="hero-stage">
            <h1
              id="hero-title"
              aria-label="Rosebeg digital manifesto"
              className="manifesto-title ascii-manifesto-title"
            >
              <span className="typewriter-title-source" data-typewriter-title>
                <ManifestoTypewriter onTitleStateChange={setTitleState} />
              </span>
              <span className="ascii-title-layer" data-ascii-title aria-hidden="true">
                <span className="ascii-title-base">
                  <ASCIIText
                    text={asciiTitle.baseText}
                    layoutText={isCompact ? compactAsciiLayoutTitle : asciiLayoutTitle}
                    anchorText={asciiTitle.baseAnchorText}
                    asciiFontSize={isCompact ? 5 : 6}
                    textFontSize={160}
                    textColor="#fdf9f3"
                    planeBaseHeight={isCompact ? 9 : 9.4}
                    alignMode={asciiTitle.baseAlignMode}
                    enableWaves
                  />
                </span>
                <span className="ascii-title-accent" data-ascii-accent>
                  <ASCIIText
                    text={asciiTitle.accentText || " "}
                    layoutText={isCompact ? compactAsciiLayoutTitle : asciiLayoutTitle}
                    anchorText={asciiTitle.accentAnchorText}
                    asciiFontSize={isCompact ? 5 : 6}
                    textFontSize={160}
                    textColor="#ffd866"
                    planeBaseHeight={isCompact ? 9 : 9.4}
                    alignMode="layout"
                    enableWaves
                  />
                </span>
              </span>
            </h1>
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

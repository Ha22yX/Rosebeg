import { useEffect, useState } from "react";
import { ASCIIText } from "@/components/ui/ascii-text";
import { InfiniteMenu, type InfiniteMenuItem } from "@/components/ui/infinite-menu";
import {
  ManifestoTypewriter,
  type ManifestoTitleState,
} from "@/components/ui/manifesto-typewriter";
import { SignalNavigation } from "@/components/ui/signal-navigation";
import { SmoothScrollController } from "@/components/ui/smooth-scroll-controller";
import { ShaderBackground } from "@/src/components/ShaderBackground";

const compactAsciiLayoutTitle = `A personal
portfolio
by HarryX`;
const highlightPrefix = "I am a ";
const roleAsciiAnchor = "I am a Photographer";
const highlightPhrases = ["Developer", "Researcher", "Photographer"];
const initialTitleState: ManifestoTitleState = {
  displayText: "",
  targetText: "This is Rosebeg",
};

const photographyItems: InfiniteMenuItem[] = [
  {
    image: "/assets/photography/signal-plain-thumb.jpg",
    link: "/assets/photography/signal-plain-large.jpg",
    title: "Stone Gate",
    description: "A quiet threshold held in old masonry and winter light.",
    aspect: 2400 / 1800,
  },
  {
    image: "/assets/photography/violet-street-thumb.jpg",
    link: "/assets/photography/violet-street-large.jpg",
    title: "Underline Skyline",
    description: "A city cut by shadow, steel, and a distant tower.",
    aspect: 2400 / 1800,
  },
  {
    image: "/assets/photography/quiet-edge-thumb.jpg",
    link: "/assets/photography/quiet-edge-large.jpg",
    title: "Crosswalk Heat",
    description: "Street geometry washed in red light and noon glare.",
    aspect: 2400 / 1800,
  },
  {
    image: "/assets/photography/night-current-thumb.jpg",
    link: "/assets/photography/night-current-large.jpg",
    title: "Library Drift",
    description: "A soft corridor of books dissolving into focus.",
    aspect: 2400 / 1173,
  },
  {
    image: "/assets/photography/glass-weather-thumb.jpg",
    link: "/assets/photography/glass-weather-large.jpg",
    title: "Harbor Weather",
    description: "Blue air, water, and towers held in a clean horizon.",
    aspect: 2400 / 1597,
  },
  {
    image: "/assets/photography/afterimage-thumb.jpg",
    link: "/assets/photography/afterimage-large.jpg",
    title: "Window Afterimage",
    description: "The city reduced to panes, silhouettes, and late light.",
    aspect: 1655 / 2400,
  },
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
    .replace("A personal portfolio by HarryX", "A personal\nportfolio\nby HarryX")
    .replace("A personal portfolio", "A personal\nportfolio")
    .replace("I am a Developer", "I am a\nDeveloper")
    .replace("I am a Researcher", "I am a\nResearcher")
    .replace("I am a Photographer", "I am a\nPhotographer")
    .replace("Welcome to Rosebeg", "Welcome to\nRosebeg");
}

function getAsciiRenderConfig(targetText: string, compact: boolean) {
  if (compact) {
    return {
      layoutText: compactAsciiLayoutTitle,
      asciiFontSize: 3,
      planeBaseHeight: 11.6,
    };
  }

  if (targetText === "A personal portfolio by HarryX") {
    return {
      layoutText: "A personal portfolio by HarryX",
      asciiFontSize: 4,
      planeBaseHeight: 5.2,
    };
  }

  if (targetText.startsWith("I am a ")) {
    return {
      layoutText: roleAsciiAnchor,
      asciiFontSize: 4,
      planeBaseHeight: 9.4,
    };
  }

  return {
    layoutText: targetText || "This is Rosebeg",
    asciiFontSize: 4,
    planeBaseHeight: 9.4,
  };
}

function getAsciiTitleLayers(text: string, targetText: string, compact: boolean) {
  const displayText = text || " ";
  const targetOrDisplayText = targetText || displayText;
  const anchorText = formatAsciiTitle(targetOrDisplayText, compact);

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
      baseText: `I am a\n${" ".repeat(ending.length)}`,
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
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const asciiTitle = getAsciiTitleLayers(titleState.displayText, titleState.targetText, isCompact);
  const asciiRender = getAsciiRenderConfig(titleState.targetText, isCompact);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 980px)");
    const sync = () => setIsCompact(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <>
      <SmoothScrollController />
      <ShaderBackground className={isNavigationOpen ? "is-navigation-open" : ""} />
      <div className={isNavigationOpen ? "page-stage is-navigation-open" : "page-stage"} data-page-stage>
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
                      key={`base-${isCompact ? "compact" : "wide"}-${asciiRender.layoutText}`}
                      text={asciiTitle.baseText}
                      layoutText={asciiRender.layoutText}
                      anchorText={asciiTitle.baseAnchorText}
                      asciiFontSize={asciiRender.asciiFontSize}
                      textFontSize={160}
                      textColor="#fdf9f3"
                      planeBaseHeight={asciiRender.planeBaseHeight}
                      alignMode={asciiTitle.baseAlignMode}
                      resizeMode="debounced"
                      enableWaves
                    />
                  </span>
                  <span className="ascii-title-accent" data-ascii-accent>
                    <ASCIIText
                      key={`accent-${isCompact ? "compact" : "wide"}-${asciiRender.layoutText}`}
                      text={asciiTitle.accentText || " "}
                      layoutText={asciiRender.layoutText}
                      anchorText={asciiTitle.accentAnchorText}
                      asciiFontSize={asciiRender.asciiFontSize}
                      textFontSize={160}
                      textColor="#ffd866"
                      planeBaseHeight={asciiRender.planeBaseHeight}
                      alignMode="layout"
                      resizeMode="debounced"
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

          <section id="works" className="section-panel photography-panel" aria-label="Photography">
            <InfiniteMenu items={photographyItems} scale={1} />
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
      </div>
      <SignalNavigation isOpen={isNavigationOpen} onOpenChange={setIsNavigationOpen} />
    </>
  );
}

export default App;

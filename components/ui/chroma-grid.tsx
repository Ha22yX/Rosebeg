import { type CSSProperties, memo, type PointerEvent, useEffect, useRef, useState } from "react";
import "./chroma-grid.css";

export type ChromaGridItem = {
  image: string;
  title: string;
  subtitle: string;
  handle?: string;
  location?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
};

type ChromaGridProps = {
  items?: ChromaGridItem[];
  className?: string;
  radius?: number;
  columns?: number;
  rows?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
  staticMode?: boolean;
};

type ChromaGridStyle = CSSProperties & {
  "--r"?: string;
  "--cols"?: number;
  "--rows"?: number;
  "--x"?: string;
  "--y"?: string;
};

type ChromaCardStyle = CSSProperties & {
  "--card-border"?: string;
  "--card-gradient"?: string;
  "--mouse-x"?: string;
  "--mouse-y"?: string;
};

export const ChromaGrid = memo(({
  items,
  className = "",
  radius = 300,
  columns = 3,
  rows = 2,
  staticMode = false,
}: ChromaGridProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [isPointerActive, setIsPointerActive] = useState(false);

  const demo: ChromaGridItem[] = [
    {
      image: "https://i.pravatar.cc/300?img=8",
      title: "Alex Rivera",
      subtitle: "Full Stack Developer",
      handle: "@alexrivera",
      borderColor: "#4F46E5",
      gradient: "linear-gradient(145deg, #4F46E5, #000)",
      url: "https://github.com/",
    },
    {
      image: "https://i.pravatar.cc/300?img=11",
      title: "Jordan Chen",
      subtitle: "DevOps Engineer",
      handle: "@jordanchen",
      borderColor: "#10B981",
      gradient: "linear-gradient(210deg, #10B981, #000)",
      url: "https://linkedin.com/in/",
    },
    {
      image: "https://i.pravatar.cc/300?img=3",
      title: "Morgan Blake",
      subtitle: "UI/UX Designer",
      handle: "@morganblake",
      borderColor: "#F59E0B",
      gradient: "linear-gradient(165deg, #F59E0B, #000)",
      url: "https://dribbble.com/",
    },
    {
      image: "https://i.pravatar.cc/300?img=16",
      title: "Casey Park",
      subtitle: "Data Scientist",
      handle: "@caseypark",
      borderColor: "#EF4444",
      gradient: "linear-gradient(195deg, #EF4444, #000)",
      url: "https://kaggle.com/",
    },
    {
      image: "https://i.pravatar.cc/300?img=25",
      title: "Sam Kim",
      subtitle: "Mobile Developer",
      handle: "@thesamkim",
      borderColor: "#8B5CF6",
      gradient: "linear-gradient(225deg, #8B5CF6, #000)",
      url: "https://github.com/",
    },
    {
      image: "https://i.pravatar.cc/300?img=60",
      title: "Tyler Rodriguez",
      subtitle: "Cloud Architect",
      handle: "@tylerrod",
      borderColor: "#06B6D4",
      gradient: "linear-gradient(135deg, #06B6D4, #000)",
      url: "https://aws.amazon.com/",
    },
  ];
  const data = items?.length ? items : demo;

  const handleCardClick = (url?: string) => {
    if (!url) {
      return;
    }

    if (url.startsWith("#")) {
      const target = document.getElementById(url.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", url);
      }
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCardMove = (e: PointerEvent<HTMLElement>) => {
    if (staticMode) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const updatePointerPosition = (clientX: number, clientY: number) => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    root.style.setProperty("--x", `${clientX - rect.left}px`);
    root.style.setProperty("--y", `${clientY - rect.top}px`);
  };

  const schedulePointerUpdate = (clientX: number, clientY: number) => {
    pointerRef.current = { x: clientX, y: clientY };
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      updatePointerPosition(pointerRef.current.x, pointerRef.current.y);
    });
  };

  const handlePointerEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (staticMode) return;
    setIsPointerActive(true);
    updatePointerPosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (staticMode) return;
    schedulePointerUpdate(e.clientX, e.clientY);
  };

  const handlePointerLeave = () => {
    if (staticMode) return;
    setIsPointerActive(false);
  };

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const gridClassName = [
    "chroma-grid",
    staticMode ? "is-static" : "",
    isPointerActive ? "is-pointer-active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={rootRef}
      className={gridClassName}
      data-chroma-grid
      data-static-mode={staticMode ? "true" : "false"}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          "--r": `${radius}px`,
          "--cols": columns,
          "--rows": rows,
          "--x": "50%",
          "--y": "50%",
        } as ChromaGridStyle
      }
    >
      {data.map((c, i) => (
        <article
          key={`${c.title}-${i}`}
          className="chroma-card"
          onPointerMove={handleCardMove}
          onClick={() => handleCardClick(c.url)}
          style={
            {
              "--card-border": c.borderColor || "transparent",
              "--card-gradient": c.gradient,
              "--mouse-x": "50%",
              "--mouse-y": "50%",
              cursor: c.url ? "pointer" : "default",
            } as ChromaCardStyle
          }
        >
          <div className="chroma-img-wrapper">
            <img className="chroma-img" src={c.image} alt={c.title} loading="lazy" />
          </div>
          <footer className="chroma-info">
            <h3 className="name">{c.title}</h3>
            {c.handle && <span className="handle">{c.handle}</span>}
            <p className="role">{c.subtitle}</p>
            {c.location && <span className="location">{c.location}</span>}
          </footer>
        </article>
      ))}
      {!staticMode ? (
        <>
          <div className="chroma-overlay" aria-hidden="true" />
          <div className={`chroma-fade${isPointerActive ? " is-hidden" : ""}`} aria-hidden="true" />
        </>
      ) : null}
    </div>
  );
});

export default ChromaGrid;

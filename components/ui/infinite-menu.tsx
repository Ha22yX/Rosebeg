import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type InfiniteMenuItem = {
  image: string;
  fullImage: string;
  title: string;
  description: string;
  aspect: number;
};

type InfiniteMenuProps = {
  items: InfiniteMenuItem[];
  scale?: number;
  headingId?: string;
};

type ViewerState = {
  item: InfiniteMenuItem;
  origin: DOMRect;
  target: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

function getTargetRect(aspect: number) {
  const maxWidth = window.innerWidth * 0.86;
  const maxHeight = window.innerHeight * 0.82;
  let width = maxWidth;
  let height = width / aspect;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }

  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  };
}

function getCssRect(state: ViewerState) {
  return {
    "--origin-left": `${state.origin.left}px`,
    "--origin-top": `${state.origin.top}px`,
    "--origin-width": `${state.origin.width}px`,
    "--origin-height": `${state.origin.height}px`,
    "--target-left": `${state.target.left}px`,
    "--target-top": `${state.target.top}px`,
    "--target-width": `${state.target.width}px`,
    "--target-height": `${state.target.height}px`,
  } as CSSProperties;
}

export function InfiniteMenu({ items, scale = 1, headingId }: InfiniteMenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [viewerExpanded, setViewerExpanded] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const repeatedItems = useMemo(() => [...items, ...items], [items]);
  const activeItem = items[activeIndex % items.length];

  const openViewer = (item: InfiniteMenuItem, element: HTMLElement) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const orb = element.closest("[data-infinite-menu-orb]") ?? element;
    const origin = orb.getBoundingClientRect();
    setViewer({
      item,
      origin,
      target: getTargetRect(item.aspect),
    });
    window.requestAnimationFrame(() => setViewerExpanded(true));
  };

  const closeViewer = useCallback(() => {
    setViewerExpanded(false);

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setViewer(null);
      closeTimerRef.current = null;
    }, 520);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && viewer) {
        closeViewer();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeViewer, viewer]);

  useEffect(() => {
    if (!viewer || !viewerExpanded) {
      return;
    }

    const onResize = () => {
      setViewer((currentViewer) =>
        currentViewer
          ? {
              ...currentViewer,
              target: getTargetRect(currentViewer.item.aspect),
            }
          : currentViewer
      );
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [viewer, viewerExpanded]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="infinite-menu" style={{ "--infinite-menu-scale": scale } as CSSProperties} data-infinite-menu>
      <div className="infinite-menu-copy">
        <span>Photography field</span>
        <h2 id={headingId}>Photography</h2>
        <p>
          A moving index of Ha22yX photographs, compressed for the web and ready
          to open into larger views.
        </p>
      </div>

      <div className="infinite-menu-stage" aria-label="Photography menu">
        <div className="infinite-menu-rail" aria-hidden="false">
          {repeatedItems.map((item, index) => {
            const itemIndex = index % items.length;
            return (
              <article
                className="infinite-menu-item"
                data-infinite-menu-orb
                key={`${item.title}-${index}`}
                style={{ "--item-y": `${[-30, 36, -72, 54, -18, 78][itemIndex]}px` } as CSSProperties}
                onPointerEnter={() => setActiveIndex(itemIndex)}
                onFocus={() => setActiveIndex(itemIndex)}
              >
                <img src={item.image} alt="" loading="lazy" draggable={false} />
                <button
                  type="button"
                  className="infinite-menu-open"
                  aria-label={`Open ${item.title}`}
                  onClick={(event) => openViewer(item, event.currentTarget)}
                >
                  <span aria-hidden="true">{"\u2197"}</span>
                </button>
              </article>
            );
          })}
        </div>

        <div className="infinite-menu-info" aria-live="polite">
          <h3>{activeItem.title}</h3>
          <p>{activeItem.description}</p>
        </div>
      </div>

      {viewer &&
        createPortal(
          <div
            className={viewerExpanded ? "photo-lightbox is-expanded" : "photo-lightbox"}
            data-photo-lightbox
            onPointerDown={closeViewer}
          >
            <figure
              className="photo-lightbox-visual"
              style={getCssRect(viewer)}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <img src={viewer.item.fullImage} alt={viewer.item.title} />
              <figcaption>
                <strong>{viewer.item.title}</strong>
                <span>{viewer.item.description}</span>
              </figcaption>
            </figure>
          </div>,
          document.body
        )}
    </div>
  );
}

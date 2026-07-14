import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";

type ShuffleDirection = "left" | "right" | "up" | "down";
type ShuffleMode = "evenodd" | "normal";

type ShuffleProps = {
  text: string;
  shuffleDirection?: ShuffleDirection;
  duration?: number;
  animationMode?: ShuffleMode;
  shuffleTimes?: number;
  ease?: string;
  stagger?: number;
  threshold?: number;
  triggerOnce?: boolean;
  triggerOnHover?: boolean;
  respectReducedMotion?: boolean;
  loop?: boolean;
  loopDelay?: number;
  activeKey?: string | number;
  playDelay?: number;
  enabled?: boolean;
  fixedCharacterMetrics?: boolean;
  className?: string;
};

type StripPlacement = "start" | "still";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getStripCharacters(character: string, shuffleTimes: number) {
  const rolls = Math.max(1, Math.floor(shuffleTimes));
  return Array.from({ length: rolls + 2 }, () => character);
}

function setStripPlacement(
  strip: HTMLSpanElement,
  direction: ShuffleDirection,
  steps: number,
  width: number,
  height: number,
  placement: StripPlacement
) {
  let startX = 0;
  let finalX = 0;
  let startY = 0;
  let finalY = 0;

  if (direction === "right") {
    startX = -steps * width;
  } else if (direction === "left") {
    finalX = -steps * width;
  } else if (direction === "down") {
    startY = -steps * height;
  } else if (direction === "up") {
    finalY = -steps * height;
  }

  strip.dataset.startX = String(startX);
  strip.dataset.finalX = String(finalX);
  strip.dataset.startY = String(startY);
  strip.dataset.finalY = String(finalY);
  gsap.set(strip, {
    x: placement === "start" ? startX : 0,
    y: placement === "start" ? startY : 0,
    force3D: true,
  });
}

export function Shuffle({
  text,
  shuffleDirection = "right",
  duration = 0.35,
  animationMode = "evenodd",
  shuffleTimes = 1,
  ease = "power3.out",
  stagger = 0.03,
  triggerOnce = true,
  triggerOnHover = false,
  respectReducedMotion = true,
  loop = false,
  loopDelay = 0,
  activeKey,
  playDelay = 0,
  enabled = true,
  fixedCharacterMetrics = false,
  className,
}: ShuffleProps) {
  const characters = useMemo(() => [...text], [text]);
  const rootRef = useRef<HTMLSpanElement>(null);
  const wrapperRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stripRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const timerRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef(false);
  const isPlayingRef = useRef(false);
  const enabledRef = useRef(enabled);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  enabledRef.current = enabled;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimeline = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
    isPlayingRef.current = false;
  }, []);

  const prepareStrips = useCallback((placement: StripPlacement = "start") => {
    const isVertical = shuffleDirection === "up" || shuffleDirection === "down";
    const rolls = Math.max(1, Math.floor(shuffleTimes));
    const steps = rolls + 1;
    let fixedWidth = 0;
    let fixedHeight = 0;

    stripRefs.current.forEach((strip, index) => {
      const wrapper = wrapperRefs.current[index];
      if (!wrapper || !strip) {
        return;
      }

      const chars = Array.from(strip.children) as HTMLElement[];
      const finalChar = chars[0];
      if (!finalChar) {
        return;
      }

      gsap.set(strip, { clearProps: "transform" });
      if (fixedCharacterMetrics) {
        wrapper.style.width = "1ch";
        wrapper.style.height = isVertical ? "1em" : "";
        chars.forEach((char) => {
          char.style.width = "1ch";
        });

        if (!fixedWidth) {
          fixedWidth = wrapper.offsetWidth || finalChar.offsetWidth || 1;
          fixedHeight = wrapper.offsetHeight || finalChar.offsetHeight || 1;
        }

        setStripPlacement(strip, shuffleDirection, steps, fixedWidth, isVertical ? fixedHeight : 1, placement);
        return;
      }

      const rect = finalChar.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);

      wrapper.style.width = `${width}px`;
      wrapper.style.height = isVertical ? `${height}px` : "";
      chars.forEach((char) => {
        char.style.width = `${width}px`;
      });

      setStripPlacement(strip, shuffleDirection, steps, width, height, placement);
    });
  }, [fixedCharacterMetrics, shuffleDirection, shuffleTimes]);

  const cleanupToStill = useCallback(() => {
    prepareStrips("still");
    stripRefs.current.forEach((strip) => {
      if (!strip) {
        return;
      }
      gsap.set(strip, { x: 0, y: 0, clearProps: "willChange" });
    });
  }, [prepareStrips]);

  const runShuffle = useCallback(
    (force = false) => {
      if (!enabledRef.current || !rootRef.current || !fontsLoaded || !text) {
        return;
      }

      clearTimer();
      resetTimeline();

      if (respectReducedMotion && prefersReducedMotion()) {
        cleanupToStill();
        setReady(true);
        return;
      }

      if (triggerOnce && hasTriggeredRef.current && !force) {
        cleanupToStill();
        setReady(true);
        return;
      }

      hasTriggeredRef.current = true;
      prepareStrips("start");
      setReady(true);
      isPlayingRef.current = true;

      const isVertical = shuffleDirection === "up" || shuffleDirection === "down";
      const strips = stripRefs.current.filter(Boolean) as HTMLSpanElement[];
      const addTween = (targets: HTMLSpanElement[], at: number) => {
        if (!targets.length) {
          return;
        }

        gsap.set(targets, {
          x: isVertical ? 0 : (index, target) => Number((target as HTMLSpanElement).dataset.startX ?? 0),
          y: isVertical ? (index, target) => Number((target as HTMLSpanElement).dataset.startY ?? 0) : 0,
        });

        timeline.to(
          targets,
          {
            duration,
            ease,
            force3D: true,
            stagger: animationMode === "evenodd" ? stagger : 0,
            x: isVertical ? 0 : (index, target) => Number((target as HTMLSpanElement).dataset.finalX ?? 0),
            y: isVertical ? (index, target) => Number((target as HTMLSpanElement).dataset.finalY ?? 0) : 0,
          },
          at
        );
      };

      const timeline = gsap.timeline({
        repeat: loop ? -1 : 0,
        repeatDelay: loop ? loopDelay : 0,
        onComplete: () => {
          isPlayingRef.current = false;
          if (!loop) {
            cleanupToStill();
          }
        },
      });

      if (animationMode === "evenodd") {
        const odd = strips.filter((_, index) => index % 2 === 1);
        const even = strips.filter((_, index) => index % 2 === 0);
        const oddTotal = duration + Math.max(0, odd.length - 1) * stagger;
        const evenStart = odd.length ? oddTotal * 0.7 : 0;
        addTween(odd, 0);
        addTween(even, evenStart);
      } else {
        strips.forEach((strip, index) => addTween([strip], index * stagger));
      }

      timelineRef.current = timeline;
    },
    [
      animationMode,
      cleanupToStill,
      clearTimer,
      duration,
      ease,
      fontsLoaded,
      loop,
      loopDelay,
      prepareStrips,
      resetTimeline,
      respectReducedMotion,
      shuffleDirection,
      stagger,
      text,
      triggerOnce,
    ]
  );

  const scheduleShuffle = useCallback(
    (force = false, delay = playDelay) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        if (enabledRef.current) {
          runShuffle(force);
        }
      }, Math.max(0, delay) * 1000);
    },
    [clearTimer, playDelay, runShuffle]
  );

  useEffect(() => {
    if (fixedCharacterMetrics) {
      setFontsLoaded(true);
      return;
    }

    if ("fonts" in document) {
      if (document.fonts.status === "loaded") {
        setFontsLoaded(true);
      } else {
        document.fonts.ready.then(() => setFontsLoaded(true));
      }
      return;
    }

    setFontsLoaded(true);
  }, []);

  useEffect(() => {
    hasTriggeredRef.current = false;
    setReady(false);
  }, [text]);

  useLayoutEffect(() => {
    if (!enabled) {
      clearTimer();
      resetTimeline();
      if (fontsLoaded) {
        cleanupToStill();
        setReady(true);
      } else {
        setReady(false);
      }
      return;
    }

    if (!fontsLoaded) {
      setReady(false);
      return;
    }

    cleanupToStill();
    setReady(true);
    scheduleShuffle(activeKey !== undefined);
  }, [activeKey, cleanupToStill, clearTimer, enabled, fontsLoaded, resetTimeline, scheduleShuffle]);

  useEffect(() => {
    return () => {
      clearTimer();
      resetTimeline();
    };
  }, [clearTimer, resetTimeline]);

  const handlePointerEnter = () => {
    if (!enabled || !triggerOnHover || isPlayingRef.current) {
      return;
    }

    scheduleShuffle(true, 0);
  };

  return (
    <span
      ref={rootRef}
      className={cn("shuffle-parent", ready && "is-ready", className)}
      aria-hidden="true"
      data-shuffle-text={text}
      data-shuffle-delay={playDelay}
      data-shuffle-enabled={enabled ? "true" : "false"}
      data-shuffle-hover={triggerOnHover ? "true" : "false"}
      onPointerEnter={handlePointerEnter}
    >
      {characters.map((character, index) => {
        if (character === " ") {
          return (
            <span className="shuffle-char is-space" data-shuffle-char key={`${text}-${index}`}>
              {" "}
            </span>
          );
        }

        return (
          <span
            className="shuffle-char-wrapper"
            data-shuffle-char-wrapper
            key={`${text}-${index}`}
            ref={(element) => {
              wrapperRefs.current[index] = element;
            }}
          >
            <span
              ref={(element) => {
                stripRefs.current[index] = element;
              }}
            >
              {getStripCharacters(character, shuffleTimes).map((stripCharacter, stripIndex) => (
                <span className="shuffle-char" data-shuffle-char key={`${text}-${index}-${stripIndex}`}>
                  {stripCharacter}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

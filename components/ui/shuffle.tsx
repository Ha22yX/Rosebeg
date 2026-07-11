import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";

type ShuffleDirection = "left" | "right";
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
  className?: string;
};

const shuffleGlyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@";

function getShuffleOrder(length: number, direction: ShuffleDirection, mode: ShuffleMode) {
  const indices = Array.from({ length }, (_, index) => index);
  const directional = direction === "left" ? indices.reverse() : indices;

  if (mode !== "evenodd") {
    return directional;
  }

  const even = directional.filter((index) => index % 2 === 0);
  const odd = directional.filter((index) => index % 2 !== 0);
  return [...even, ...odd];
}

function randomGlyph() {
  return shuffleGlyphs[Math.floor(Math.random() * shuffleGlyphs.length)];
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Shuffle({
  text,
  shuffleDirection = "right",
  duration = 0.35,
  animationMode = "evenodd",
  shuffleTimes = 1,
  ease = "power3.out",
  stagger = 0.03,
  threshold = 0.1,
  triggerOnce = true,
  triggerOnHover = false,
  respectReducedMotion = true,
  loop = false,
  loopDelay = 0,
  activeKey,
  className,
}: ShuffleProps) {
  const finalCharacters = useMemo(() => [...text], [text]);
  const [displayCharacters, setDisplayCharacters] = useState(finalCharacters);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const loopTimeoutRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef(false);

  const clearLoop = useCallback(() => {
    if (loopTimeoutRef.current !== null) {
      window.clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
  }, []);

  const runShuffle = useCallback(
    (force = false) => {
      clearLoop();
      timelineRef.current?.kill();

      if (respectReducedMotion && prefersReducedMotion()) {
        setDisplayCharacters(finalCharacters);
        return;
      }

      if (triggerOnce && hasTriggeredRef.current && !force) {
        setDisplayCharacters(finalCharacters);
        return;
      }

      hasTriggeredRef.current = true;
      const order = getShuffleOrder(finalCharacters.length, shuffleDirection, animationMode);
      const orderPosition = new Map(order.map((index, position) => [index, position]));
      const iterationBuckets = Math.max(1, shuffleTimes * 8);
      const finalThreshold = Math.max(0, Math.min(0.9, 1 - threshold));

      setDisplayCharacters((current) => {
        return finalCharacters.map((character, index) => {
          if (character === " ") {
            return " ";
          }
          return current[index] && current[index] !== " " ? current[index] : randomGlyph();
        });
      });

      const timeline = gsap.timeline({
        onComplete: () => {
          setDisplayCharacters(finalCharacters);
          if (loop) {
            loopTimeoutRef.current = window.setTimeout(() => runShuffle(true), loopDelay * 1000);
          }
        },
      });

      finalCharacters.forEach((character, index) => {
        if (character === " ") {
          return;
        }

        const proxy = { progress: 0, bucket: -1 };
        timeline.to(
          proxy,
          {
            progress: 1,
            duration,
            ease,
            onUpdate: () => {
              const nextBucket = Math.floor(proxy.progress * iterationBuckets);
              const shouldResolve = proxy.progress >= finalThreshold;
              if (nextBucket === proxy.bucket && !shouldResolve) {
                return;
              }

              proxy.bucket = nextBucket;
              setDisplayCharacters((current) => {
                const next = [...current];
                next[index] = shouldResolve ? character : randomGlyph();
                return next;
              });
            },
          },
          (orderPosition.get(index) ?? index) * stagger
        );
      });

      timelineRef.current = timeline;
    },
    [
      animationMode,
      clearLoop,
      duration,
      ease,
      finalCharacters,
      loop,
      loopDelay,
      respectReducedMotion,
      shuffleDirection,
      shuffleTimes,
      stagger,
      threshold,
      triggerOnce,
    ]
  );

  useEffect(() => {
    hasTriggeredRef.current = false;
    setDisplayCharacters(finalCharacters);
  }, [finalCharacters]);

  useEffect(() => {
    if (activeKey === undefined) {
      runShuffle(false);
      return;
    }

    runShuffle(true);
  }, [activeKey, runShuffle]);

  useEffect(() => {
    return () => {
      clearLoop();
      timelineRef.current?.kill();
    };
  }, [clearLoop]);

  return (
    <span
      className={cn("shuffle-text", className)}
      aria-hidden="true"
      data-shuffle-text={text}
      onPointerEnter={triggerOnHover ? () => runShuffle(true) : undefined}
    >
      {displayCharacters.map((character, index) => (
        <span
          className={character === " " ? "shuffle-char is-space" : "shuffle-char"}
          data-shuffle-char
          key={`${text}-${index}`}
        >
          {character}
        </span>
      ))}
    </span>
  );
}

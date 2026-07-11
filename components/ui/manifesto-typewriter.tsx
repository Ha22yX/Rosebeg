import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

type SequenceStep =
  | {
      action: "type";
      text: string;
      speed?: number;
      targetText?: string;
    }
  | {
      action: "delete";
      count: number;
      speed?: number;
      targetText?: string;
    }
  | {
      action: "wait";
      duration: number;
      targetText?: string;
    };

type ManifestoTypewriterProps = {
  className?: string;
  onDisplayTextChange?: (displayText: string) => void;
  onTitleStateChange?: (state: ManifestoTitleState) => void;
};

export type ManifestoTitleState = {
  displayText: string;
  targetText: string;
};

const typeSpeed = 62;
const deleteSpeed = 34;

const titleSequence: SequenceStep[] = [
  { action: "type", text: "This is Rosebeg", speed: typeSpeed, targetText: "This is Rosebeg" },
  { action: "wait", duration: 2600, targetText: "This is Rosebeg" },
  { action: "delete", count: "This is Rosebeg".length, speed: deleteSpeed, targetText: "This is Rosebeg" },
  { action: "type", text: "Where I create", speed: typeSpeed, targetText: "Where I create" },
  { action: "wait", duration: 1600, targetText: "Where I create" },
  { action: "delete", count: " create".length, speed: deleteSpeed, targetText: "Where I create" },
  { action: "type", text: " explore", speed: typeSpeed, targetText: "Where I explore" },
  { action: "wait", duration: 1600, targetText: "Where I explore" },
  { action: "delete", count: " explore".length, speed: deleteSpeed, targetText: "Where I explore" },
  { action: "type", text: " redefine", speed: typeSpeed, targetText: "Where I redefine" },
  { action: "wait", duration: 1600, targetText: "Where I redefine" },
  { action: "delete", count: "Where I redefine".length, speed: deleteSpeed, targetText: "Where I redefine" },
  { action: "type", text: "I am Ha22yX", speed: typeSpeed, targetText: "I am Ha22yX" },
];

type TimelineSegment =
  | {
      action: "type";
      start: number;
      end: number;
      from: string;
      insert: string;
      targetText: string;
    }
  | {
      action: "delete";
      start: number;
      end: number;
      from: string;
      count: number;
      targetText: string;
    }
  | {
      action: "wait";
      start: number;
      end: number;
      text: string;
      targetText: string;
    };

function buildTimeline(steps: SequenceStep[]) {
  const timeline: TimelineSegment[] = [
    { action: "wait", start: 0, end: 180, text: "", targetText: "This is Rosebeg" },
  ];
  let currentText = "";
  let currentTargetText = "This is Rosebeg";
  let cursorTime = 180;

  steps.forEach((step) => {
    const targetText = step.targetText ?? currentTargetText;

    if (step.action === "wait") {
      timeline.push({
        action: "wait",
        start: cursorTime,
        end: cursorTime + step.duration,
        text: currentText,
        targetText,
      });
      currentTargetText = targetText;
      cursorTime += step.duration;
      return;
    }

    if (step.action === "type") {
      const duration = step.text.length * (step.speed ?? typeSpeed);
      timeline.push({
        action: "type",
        start: cursorTime,
        end: cursorTime + duration,
        from: currentText,
        insert: step.text,
        targetText,
      });
      currentText += step.text;
      currentTargetText = targetText;
      cursorTime += duration;
      return;
    }

    const duration = step.count * (step.speed ?? deleteSpeed);
    timeline.push({
      action: "delete",
      start: cursorTime,
      end: cursorTime + duration,
      from: currentText,
      count: step.count,
      targetText,
    });
    currentText = currentText.slice(0, -step.count);
    currentTargetText = targetText;
    cursorTime += duration;
  });

  return {
    segments: timeline,
    duration: cursorTime,
    finalText: currentText,
    finalTargetText: currentTargetText,
  };
}

const titleTimeline = buildTimeline(titleSequence);

const cursorAnimationVariants: {
  initial: Variants["initial"];
  animate: Variants["animate"];
} = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.01,
      repeat: Infinity,
      repeatDelay: 0.42,
      repeatType: "reverse",
    },
  },
};

const yellowSegments = [
  { key: "create", phrase: "create" },
  { key: "explore", phrase: "explore" },
  { key: "redefine", phrase: "redefine" },
];

function renderSegmentedTitle(displayText: string) {
  const base = "Where I ";

  if (!displayText.startsWith(base)) {
    return <span>{displayText}</span>;
  }

  const ending = displayText.slice(base.length);
  const activeSegment = yellowSegments.find((segment) => {
    return ending.length > 0 && segment.phrase.startsWith(ending);
  });

  if (!activeSegment) {
    return <span>{displayText}</span>;
  }

  return (
    <>
      <span>{base}</span>
      <span className="typewriter-highlight" data-yellow-segment={activeSegment.key}>
        {ending}
      </span>
    </>
  );
}

function ManifestoTypewriter({
  className,
  onDisplayTextChange,
  onTitleStateChange,
}: ManifestoTypewriterProps) {
  const [titleState, setTitleState] = useState<ManifestoTitleState>({
    displayText: "",
    targetText: "This is Rosebeg",
  });

  useEffect(() => {
    onDisplayTextChange?.(titleState.displayText);
    onTitleStateChange?.(titleState);
  }, [onDisplayTextChange, onTitleStateChange, titleState]);

  useEffect(() => {
    let frame = 0;
    let lastState = titleState;
    const startedAt = performance.now();

    const resolveState = (elapsed: number): ManifestoTitleState => {
      if (elapsed >= titleTimeline.duration) {
        return {
          displayText: titleTimeline.finalText,
          targetText: titleTimeline.finalTargetText,
        };
      }

      const segment = titleTimeline.segments.find((item) => {
        return elapsed >= item.start && elapsed < item.end;
      });

      if (!segment) {
        return {
          displayText: "",
          targetText: "This is Rosebeg",
        };
      }

      if (segment.action === "wait") {
        return {
          displayText: segment.text,
          targetText: segment.targetText,
        };
      }

      const progress = Math.max(0, Math.min(1, (elapsed - segment.start) / (segment.end - segment.start)));

      if (segment.action === "type") {
        const count =
          progress >= 1 ? segment.insert.length : Math.floor(progress * segment.insert.length);
        return {
          displayText: `${segment.from}${segment.insert.slice(0, count)}`,
          targetText: segment.targetText,
        };
      }

      const count = progress >= 1 ? segment.count : Math.floor(progress * segment.count);
      return {
        displayText: segment.from.slice(0, segment.from.length - count),
        targetText: segment.targetText,
      };
    };

    const tick = () => {
      const nextState = resolveState(performance.now() - startedAt);

      if (
        nextState.displayText !== lastState.displayText ||
        nextState.targetText !== lastState.targetText
      ) {
        lastState = nextState;
        setTitleState(nextState);
      }

      if (nextState.displayText !== titleTimeline.finalText) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={cn("inline whitespace-pre-wrap tracking-normal", className)}>
      {renderSegmentedTitle(titleState.displayText)}
      <motion.span
        variants={cursorAnimationVariants}
        className="cursor-mark"
        initial="initial"
        animate="animate"
      >
        _
      </motion.span>
    </div>
  );
}

export { ManifestoTypewriter };

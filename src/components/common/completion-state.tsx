import { motion, useReducedMotion } from "motion/react";
import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

const confetti = [
  { x: -94, y: -52, color: "bg-primary" },
  { x: -60, y: -76, color: "bg-success" },
  { x: -22, y: -84, color: "bg-warning" },
  { x: 34, y: -78, color: "bg-primary" },
  { x: 76, y: -60, color: "bg-warning" },
  { x: 100, y: -20, color: "bg-success" },
  { x: 90, y: 34, color: "bg-primary" },
  { x: 54, y: 64, color: "bg-warning" },
  { x: -48, y: 64, color: "bg-success" },
  { x: -90, y: 30, color: "bg-warning" },
] as const;

type CompletionStateProps = {
  title: string;
  description: string;
  summary?: string;
};

export function CompletionState({ title, description, summary }: CompletionStateProps) {
  const reduceMotion = useReducedMotion();
  return <Empty className="border-0 py-5" role="status" aria-live="polite">
    <EmptyHeader className="gap-3">
      <EmptyMedia>
        <div className="relative flex h-40 w-56 items-center justify-center" aria-hidden="true">
          <div className="absolute size-32 rounded-full bg-linear-to-br from-success/25 via-primary/10 to-warning/20 ring-1 ring-success/15" />
          {!reduceMotion ? confetti.map(({ x, y, color }, index) => <motion.span
            key={index}
            className={cn("pointer-events-none absolute h-2 w-1 rounded-full", color)}
            initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
            animate={{ x: [0, x, x * 1.1], y: [0, y, y + 20], opacity: [0, 1, 0], rotate: [0, index % 2 ? 150 : -150] }}
            transition={{ duration: 0.85, delay: 0.15 + index * 0.015, ease: "easeOut", repeat: Infinity, repeatDelay: 4 }}
          />) : null}
          <motion.div
            className="relative flex size-20 items-center justify-center rounded-full bg-success text-background shadow-sm ring-8 ring-success/10"
            initial={false}
            animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.08, 1] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.85, ease: "easeInOut", repeat: Infinity, repeatDelay: 4 }}
          >
            <IconCheck className="size-10" stroke={2.5} />
          </motion.div>
        </div>
      </EmptyMedia>
      {summary ? <Badge variant="secondary">{summary}</Badge> : null}
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
    </EmptyHeader>
  </Empty>;
}

import type { ComponentType } from "react";
import {
  CloudIcon,
  CodeIcon,
  DatabaseIcon,
  GaugeIcon,
  type IconProps,
  LayersIcon,
  PuzzleIcon,
  RocketIcon,
  ShieldIcon,
  SparklesIcon,
  WorkflowIcon,
} from "@/components/ui/icons";

type Outcome = { _key: string; icon: string; title: string; description: string | null };

const icons: Record<string, ComponentType<IconProps>> = {
  layers: LayersIcon,
  database: DatabaseIcon,
  gauge: GaugeIcon,
  cloud: CloudIcon,
  code: CodeIcon,
  shield: ShieldIcon,
  rocket: RocketIcon,
  sparkles: SparklesIcon,
  workflow: WorkflowIcon,
  puzzle: PuzzleIcon,
};

export function LearningOutcomes({ outcomes }: { outcomes: Outcome[] }) {
  return (
    <section
      aria-labelledby="what-youll-learn"
      className="rounded-lg border border-line bg-white/60 p-5 sm:p-8 lg:p-10"
    >
      <h2
        id="what-youll-learn"
        className="font-display text-heading-1 font-normal text-neutral-900 lg:text-[28px] lg:leading-9"
      >
        What you’ll learn
      </h2>
      <ul className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-2 lg:gap-8">
        {outcomes.map((outcome) => {
          const Icon = icons[outcome.icon] ?? LayersIcon;
          return (
            <li
              key={outcome._key}
              className="flex gap-6 rounded-md border border-line bg-white p-6 lg:gap-10 lg:px-10 lg:py-11"
            >
              <Icon size={56} className="shrink-0 text-primary-500" />
              <div>
                <h3 className="font-display text-heading-2 font-normal text-neutral-900 lg:text-[24px] lg:leading-8">
                  {outcome.title}
                </h3>
                {outcome.description && (
                  <p className="mt-3 text-body-lg leading-7 text-neutral-500 lg:text-heading-3 lg:leading-8 lg:font-normal">
                    {outcome.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

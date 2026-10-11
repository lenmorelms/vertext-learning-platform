import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { CourseCard, LessonCard, ResourceCard, VideoLessonCard } from "@/components/ui/cards";
import {
  BarChartIcon,
  BellIcon,
  BookmarkIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentIcon,
  ExternalLinkIcon,
  PlayCircleIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Pagination } from "@/components/ui/pagination";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { SiteNav } from "@/components/ui/site-nav";
import { Status } from "@/components/ui/status";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Design System | Vertex",
  robots: { index: false },
};

const primary = [
  { name: "Primary 500", hex: "#F97316", className: "bg-primary-500" },
  { name: "Primary 400", hex: "#FB923C", className: "bg-primary-400" },
  { name: "Primary 300", hex: "#FDBA74", className: "bg-primary-300" },
  { name: "Primary 200", hex: "#FED7AA", className: "bg-primary-200" },
  { name: "Primary 100", hex: "#FFEEE5", className: "bg-primary-100" },
];

const neutral = [
  { name: "Neutral 900", hex: "#0F172A", className: "bg-neutral-900" },
  { name: "Neutral 700", hex: "#334155", className: "bg-neutral-700" },
  { name: "Neutral 500", hex: "#64748B", className: "bg-neutral-500" },
  { name: "Neutral 300", hex: "#CBD5E1", className: "bg-neutral-300" },
  { name: "Neutral 200", hex: "#E2E8F0", className: "bg-neutral-200" },
  { name: "Neutral 100", hex: "#F1F5F9", className: "bg-neutral-100" },
  { name: "Neutral 50", hex: "#FAFAFC", className: "border border-neutral-200 bg-neutral-50" },
  { name: "White", hex: "#FFFFFF", className: "border border-neutral-200 bg-white" },
];

const typeScale = [
  { style: "Display 1", className: "font-display font-bold", font: "Playfair Display", size: "48 / 56", weight: "Bold", use: "Page titles" },
  { style: "Display 2", className: "font-display font-bold", font: "Playfair Display", size: "36 / 44", weight: "Bold", use: "Section titles" },
  { style: "Heading 1", className: "font-semibold", font: "Inter", size: "28 / 36", weight: "Semi Bold", use: "Card titles" },
  { style: "Heading 2", className: "font-semibold", font: "Inter", size: "22 / 30", weight: "Semi Bold", use: "Sub sections" },
  { style: "Heading 3", className: "font-medium", font: "Inter", size: "18 / 26", weight: "Medium", use: "Small titles" },
  { style: "Body Large", className: "", font: "Inter", size: "16 / 24", weight: "Regular", use: "Body copy" },
  { style: "Body", className: "", font: "Inter", size: "14 / 20", weight: "Regular", use: "Supporting text" },
  { style: "Small", className: "", font: "Inter", size: "12 / 16", weight: "Regular", use: "Captions, meta" },
];

const spacing = [
  { px: 4, rem: "0.25rem", className: "size-1" },
  { px: 8, rem: "0.5rem", className: "size-2" },
  { px: 12, rem: "0.75rem", className: "size-3" },
  { px: 16, rem: "1rem", className: "size-4" },
  { px: 24, rem: "1.5rem", className: "size-6" },
  { px: 32, rem: "2rem", className: "size-8" },
  { px: 40, rem: "2.5rem", className: "size-10" },
  { px: 48, rem: "3rem", className: "size-12" },
  { px: 64, rem: "4rem", className: "size-16" },
];

const radii = [
  { label: "4px", name: "xs", className: "rounded-xs" },
  { label: "8px", name: "sm", className: "rounded-sm" },
  { label: "12px", name: "md", className: "rounded-md" },
  { label: "16px", name: "lg", className: "rounded-lg" },
  { label: "24px", name: "xl", className: "rounded-xl" },
  { label: "Full", name: "circle", className: "rounded-full" },
];

const shadows = [
  { name: "Sm", className: "shadow-sm", offset: "0 1px 2px 0", color: "rgba(15, 23, 42, 0.05)" },
  { name: "Md", className: "shadow-md", offset: "0 4px 12px -2px", color: "rgba(15, 23, 42, 0.08)" },
  { name: "Lg", className: "shadow-lg", offset: "0 12px 24px -4px", color: "rgba(15, 23, 42, 0.10)" },
  { name: "Xl", className: "shadow-xl", offset: "0 20px 40px -8px", color: "rgba(15, 23, 42, 0.12)" },
];

const icons = [
  BellIcon,
  SearchIcon,
  PlayCircleIcon,
  DocumentIcon,
  BookmarkIcon,
  BarChartIcon,
  ClockIcon,
  UserIcon,
  ChevronRightIcon,
];

const buttonStates = [
  { label: "Default", props: {} },
  { label: "Hover", props: { "data-hover": "" } },
  { label: "Disabled", props: { disabled: true } },
];

function Section({
  number,
  title,
  className,
  children,
}: {
  number: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("min-w-0 rounded-lg border border-[#F4EEEC] bg-[#FCF8F7] p-6 sm:p-8", className)}>
      <h2 className="mb-8 flex items-center gap-6 text-body font-semibold tracking-[0.15em] text-neutral-900 uppercase">
        <span className="text-primary-500">{number}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-body font-medium text-neutral-900", className)}>{children}</p>;
}

function Specs({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-8">
      <Label>{title}</Label>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-body text-neutral-500">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Swatches({ colors, size }: { colors: typeof primary; size: string }) {
  return (
    <ul className="flex flex-wrap gap-x-10 gap-y-6">
      {colors.map((color) => (
        <li key={color.name}>
          <div className={cn("rounded-sm", size, color.className)} />
          <p className="mt-4 text-body text-neutral-700">{color.name}</p>
          <p className="mt-1 text-body text-neutral-700">{color.hex}</p>
        </li>
      ))}
    </ul>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="flex-1 bg-[#F9F5F2] p-4 lg:p-6">
      <div className="mx-auto grid max-w-[1760px] gap-4 lg:grid-cols-12">
        <section className="min-w-0 rounded-lg border border-[#F4EEEC] bg-[#FCF8F7] p-6 sm:p-8 lg:col-span-4 lg:p-12">
          <Logo size={44} />
          <h1 className="mt-10 font-display text-display-2 font-medium text-neutral-900 sm:text-display-1 xl:text-[64px] xl:leading-[72px]">
            Design System
          </h1>
          <p className="mt-8 max-w-md text-heading-3 font-normal leading-10 text-neutral-700">
            A unified design language for Vertex learning platform. Clean, modern and focused on
            clarity, consistency and intuitive learning experiences.
          </p>
          <p className="mt-10 text-body tracking-[0.15em] text-neutral-700 uppercase">
            Version 1.0 <span className="mx-3">·</span> May 2025
          </p>
        </section>

        <Section number="01" title="Colors" className="lg:col-span-8">
          <Label className="mb-4 text-body-lg">Primary</Label>
          <Swatches colors={primary} size="h-20 w-32" />
          <Label className="mt-8 mb-4 text-body-lg">Neutral</Label>
          <Swatches colors={neutral} size="h-16 w-24" />
        </Section>

        <Section number="02" title="Typography" className="lg:col-span-5">
          <div className="space-y-10">
            <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
              <span className="w-32 font-display text-[88px] leading-none text-neutral-900">Ag</span>
              <div>
                <p className="font-display text-heading-1 font-normal text-neutral-900">
                  Playfair Display
                </p>
                <p className="mt-3 text-body-lg text-neutral-500">
                  Elegant <span className="mx-2 text-primary-500">·</span> Readable
                  <span className="mx-2 text-primary-500">·</span> Timeless
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
              <span className="w-32 text-[88px] leading-none font-medium text-neutral-900">Ag</span>
              <div>
                <p className="text-heading-1 font-normal text-neutral-900">Inter</p>
                <p className="mt-3 text-body-lg text-neutral-500">
                  Clean <span className="mx-2 text-primary-500">·</span> Modern
                  <span className="mx-2 text-primary-500">·</span> Highly legible
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section number="03" title="Type Scale" className="lg:col-span-7">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-body text-neutral-500">
              <thead>
                <tr className="text-neutral-700">
                  {["Style", "Font", "Size / Line Height", "Weight", "Use"].map((heading) => (
                    <th key={heading} className="pb-4 font-normal">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {typeScale.map((row) => (
                  <tr key={row.style}>
                    <td className={cn("py-1.5 pr-6 text-body-lg whitespace-nowrap text-neutral-900", row.className)}>
                      {row.style}
                    </td>
                    <td className="pr-6">{row.font}</td>
                    <td className="pr-6">{row.size}</td>
                    <td className="pr-6">{row.weight}</td>
                    <td>{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section number="04" title="Spacing System" className="lg:col-span-6">
          <Label className="-mt-4 text-body-lg">Base unit: 4px</Label>
          <ul className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-6">
            {spacing.map((step) => (
              <li key={step.px} className="flex flex-col items-center gap-4">
                <span className={cn("rounded-xs bg-primary-200", step.className)} />
                <span className="text-center text-body text-neutral-900">
                  {step.px}
                  <span className="mt-1 block text-neutral-500">({step.rem})</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section number="05" title="Radius & Shadows" className="lg:col-span-6">
          <Label className="-mt-4 text-body-lg">Radius</Label>
          <ul className="mt-4 flex flex-wrap gap-x-12 gap-y-6">
            {radii.map((radius) => (
              <li key={radius.name} className="flex flex-col items-center gap-4">
                <span className={cn("size-16 border border-neutral-200 bg-white", radius.className)} />
                <span className="text-center text-body text-neutral-700">
                  {radius.label}
                  <span className="mt-1 block text-neutral-500">({radius.name})</span>
                </span>
              </li>
            ))}
          </ul>
          <Label className="mt-8 text-body-lg">Shadows</Label>
          <ul className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {shadows.map((shadow) => (
              <li key={shadow.name} className={cn("rounded-sm bg-white p-5", shadow.className)}>
                <p className="text-body-lg font-medium text-neutral-900">{shadow.name}</p>
                <p className="mt-3 text-small leading-6 text-neutral-500">
                  {shadow.offset}
                  <br />
                  {shadow.color}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section number="06" title="Icons" className="lg:col-span-3">
          <Label className="-mt-4">Outline Style</Label>
          <div className="mt-6 flex flex-wrap gap-4 text-neutral-900">
            {icons.map((Icon) => (
              <Icon key={Icon.name} />
            ))}
          </div>
          <Label className="mt-8">Filled Style</Label>
          <div className="mt-6 flex flex-wrap gap-4 text-neutral-900">
            {icons.map((Icon) => (
              <Icon key={Icon.name} filled />
            ))}
          </div>
          <Specs
            title="Icon Specs"
            items={[
              "24x24px grid",
              "2px stroke width (outline)",
              "Rounded line caps",
              "Consistent optical balance",
            ]}
          />
        </Section>

        <Section number="07" title="Buttons" className="lg:col-span-6">
          <div className="-mt-4 overflow-x-auto">
            <table className="min-w-[640px] border-separate border-spacing-x-6 border-spacing-y-3 text-left">
              <thead>
                <tr className="text-body text-neutral-500">
                  <td />
                  {["Primary", "Secondary", "Tertiary", "Text"].map((heading) => (
                    <th key={heading} className="font-normal">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buttonStates.map((state) => (
                  <tr key={state.label}>
                    <th className="pr-2 text-body font-medium text-neutral-900">{state.label}</th>
                    <td>
                      <Button {...state.props}>Get Started</Button>
                    </td>
                    <td>
                      <Button variant="secondary" {...state.props}>
                        Explore Courses
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="tertiary"
                        icon={<ExternalLinkIcon size={18} />}
                        {...state.props}
                      >
                        View Lesson
                      </Button>
                    </td>
                    <td>
                      <Button variant="text" icon={<PlayCircleIcon size={20} />} {...state.props}>
                        Watch Video
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Specs
            title="Button Specs"
            items={[
              "Height: 44px (default)",
              "Padding: 0 16px (lg), 0 12px (md)",
              "Radius: 12px",
              "Font: Inter Medium (14–16px)",
            ]}
          />
        </Section>

        <Section number="08" title="Inputs" className="lg:col-span-3">
          <Label className="-mt-4 mb-3">Search / Text Input</Label>
          <Input
            type="search"
            aria-label="Search"
            placeholder="Search anything..."
            icon={<SearchIcon size={20} />}
            hint="⌘ K"
          />
          <Label className="mt-6 mb-3">Select</Label>
          <Select aria-label="Sort by" defaultValue="relevant">
            <option value="relevant">Most Relevant</option>
            <option value="newest">Newest</option>
          </Select>
          <Specs
            title="Field Specs"
            items={[
              "Height: 44px",
              "Radius: 12px",
              "Border: 1px solid #E2E8F0",
              "Padding: 0 16px",
              "Focus: Border color #FB923C",
            ]}
          />
        </Section>

        <Section number="09" title="Badges / Tags" className="lg:col-span-4">
          <div className="-mt-2 grid grid-cols-3 gap-4">
            {(["video", "lesson", "popular"] as const).map((variant) => (
              <div key={variant}>
                <p className="mb-3 text-body text-neutral-700 capitalize">{variant}</p>
                <Badge variant={variant} />
              </div>
            ))}
          </div>
        </Section>

        <Section number="10" title="Status / Indicators" className="lg:col-span-4">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <Status variant="in-progress" />
            <Status variant="completed" />
            <Status variant="now-playing" />
            <Status variant="locked" />
          </div>
        </Section>

        <Section number="11" title="Progress Bar" className="lg:col-span-4">
          <ProgressBar value={35} />
        </Section>

        <Section number="12" title="Cards" className="lg:col-span-12">
          <div className="-mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col">
              <p className="mb-3 text-body text-neutral-700">Course Card</p>
              <CourseCard
                className="flex-1"
                href="#"
                icon={<span className="text-heading-1 font-normal">N</span>}
                title="Next.js for Production"
                summary="Build scalable, high-performance web applications with Next.js."
                level="Intermediate"
                duration="18h 24m"
                moduleCount={12}
              />
            </div>
            <div className="flex flex-col">
              <p className="mb-3 text-body text-neutral-700">Lesson Card (Video)</p>
              <VideoLessonCard
                className="flex-1"
                href="#"
                title="Data Fetching in Server Components"
                description="Learn how to fetch data on the server using async/await and Next.js best practices."
                lessonLabel="Lesson 5.1"
                length="12:45"
                watchFrom="12:45"
              />
            </div>
            <div className="flex flex-col">
              <p className="mb-3 text-body text-neutral-700">Lesson Card (Lesson)</p>
              <LessonCard
                className="flex-1"
                href="#"
                title="Data Fetching & Caching"
                description="Explore different data fetching methods in Next.js and how to cache and revalidate data for optimal performance."
                moduleLabel="Module 5"
              />
            </div>
            <div className="flex flex-col">
              <p className="mb-3 text-body text-neutral-700">Resource Card</p>
              <ResourceCard
                className="flex-1"
                href="#"
                title="Caching and Revalidation Guide"
                description="Deep dive into Next.js caching strategies."
                type="PDF"
                size="1.2 MB"
              />
            </div>
          </div>
        </Section>

        <Section number="13" title="Navigation" className="lg:col-span-12">
          <div className="-mt-2 grid items-center gap-8 lg:grid-cols-3">
            <SiteNav
              items={[
                { label: "Courses", href: "#courses", active: true },
                { label: "My Learning", href: "#my-learning" },
              ]}
            />
            <div>
              <p className="mb-3 text-body text-neutral-700">Breadcrumbs</p>
              <Breadcrumbs
                items={[
                  { label: "All Courses", href: "#" },
                  { label: "Next.js for Production", href: "#" },
                  { label: "Data Fetching & Caching" },
                ]}
              />
            </div>
            <div>
              <p className="mb-3 text-body text-neutral-700">Pagination</p>
              <Pagination page={1} pageCount={8} hrefFor={(page) => `#page-${page}`} />
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}

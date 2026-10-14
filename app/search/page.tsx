import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchFooter } from "@/components/search/search-footer";
import { SearchForm } from "@/components/search/search-form";
import { SearchResults } from "@/components/search/search-results";
import { SiteHeader } from "@/components/ui/site-header";
import { QUERY_MAX_LENGTH, QUERY_MIN_LENGTH } from "@/lib/search/types";

export const metadata: Metadata = {
  title: "Search · Vertex",
  description: "Search every Vertex lesson in plain English.",
};

async function SearchView({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const { q } = await searchParams;
  const query = (typeof q === "string" ? q : "").trim().slice(0, QUERY_MAX_LENGTH);

  if (query.length < QUERY_MIN_LENGTH) {
    return (
      <>
        <section className="flex flex-col items-center text-center">
          <h1 className="font-display text-[36px] leading-[44px] font-medium tracking-tight text-neutral-900 sm:text-[44px] sm:leading-[54px] lg:text-[52px] lg:leading-[64px]">
            Search your learning
          </h1>
          <p className="mt-3 text-body-lg text-neutral-500 lg:text-heading-3 lg:font-normal">
            Describe what you want to learn and Vertex finds the lessons that teach it.
          </p>
          <SearchForm query={query} className="mt-8 w-full max-w-[936px]" />
        </section>
        <SearchFooter className="mt-10" />
      </>
    );
  }

  // Keyed by query so a new search starts from a clean loading state.
  return <SearchResults key={query} query={query} />;
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="flex flex-1 flex-col bg-canvas bg-hatch">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col border-x border-line bg-surface">
        <SiteHeader active="courses" />
        <main className="mx-auto w-full max-w-[1208px] flex-1 px-4 pt-10 pb-16 sm:px-8 lg:pt-12 lg:pb-20">
          <Suspense
            fallback={<div className="h-[260px]" aria-hidden="true" />}
          >
            <SearchView searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

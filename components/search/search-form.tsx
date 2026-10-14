import { SearchShortcut } from "@/components/home/search-shortcut";
import { SearchIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { QUERY_MAX_LENGTH } from "@/lib/search/types";

const SEARCH_INPUT_ID = "search-page-query";

/* GET form to /search, so every search has a shareable URL. */
export function SearchForm({ query, className }: { query: string; className?: string }) {
  return (
    <form action="/search" role="search" className={className}>
      <Input
        id={SEARCH_INPUT_ID}
        name="q"
        type="search"
        defaultValue={query}
        maxLength={QUERY_MAX_LENGTH}
        required
        aria-label="Search your learning"
        placeholder="Ask anything about your learning..."
        icon={<SearchIcon size={24} />}
        hint="⌘ K"
        fieldSize="tall"
      />
      <SearchShortcut targetId={SEARCH_INPUT_ID} />
    </form>
  );
}

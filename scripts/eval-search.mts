/*
 * Offline eval for the search agent. Runs the real system prompt through the
 * Sanity Context MCP for each query and prints what the agent picked. Never
 * imported by the app, and writes nothing to Sanity.
 *
 *   npm run eval:search
 *   npm run eval:search -- --instructions ""          # blank Context instructions
 *   npm run eval:search -- --filter '_type in [...]'   # try a scope filter
 *   npm run eval:search -- --queries my-queries.json
 *
 * Overrides go through MCP URL params, so the production Context document is
 * untouched. Mirrors lib/search/agent.ts (model, tools, schema, step cap).
 */
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { createMCPClient } from "@ai-sdk/mcp";
import { openai } from "@ai-sdk/openai";
import { generateText, Output, stepCountIs } from "ai";
import { createClient } from "next-sanity";
import { z } from "zod";

const { values: args } = parseArgs({
  options: {
    queries: { type: "string", default: "scripts/eval-queries.json" },
    instructions: { type: "string" },
    filter: { type: "string" },
  },
});

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const token = env("SANITY_API_READ_TOKEN");
const headers = { Authorization: `Bearer ${token}` };
const mcpUrl = new URL(env("SANITY_CONTEXT_MCP_URL"));
if (args.instructions !== undefined) mcpUrl.searchParams.set("instructions", args.instructions);
if (args.filter) mcpUrl.searchParams.set("groqFilter", args.filter);

const initialContextUrl = new URL(mcpUrl);
initialContextUrl.pathname = `${initialContextUrl.pathname.replace(/\/$/, "")}/initial-context`;
const initialContext = await (await fetch(initialContextUrl, { headers })).text();

// A variable path keeps the .ts import out of the type checker's way.
const promptModule = "../lib/search/prompt.ts";
const { buildSystemPrompt } = (await import(promptModule)) as {
  buildSystemPrompt: (context: string | null) => string;
};

const outputSchema = z.object({
  results: z.array(z.object({ kind: z.enum(["lesson", "video"]), lessonId: z.string() })),
  terms: z.array(z.string()),
});

const sanity = createClient({
  projectId: env("NEXT_PUBLIC_SANITY_PROJECT_ID"),
  dataset: env("NEXT_PUBLIC_SANITY_DATASET"),
  apiVersion: "2026-03-01",
  token,
  useCdn: false,
});

async function run(query: string) {
  const mcp = await createMCPClient({ transport: { type: "http", url: mcpUrl.toString(), headers } });
  const started = Date.now();
  try {
    const allTools = await mcp.tools();
    const tools = Object.fromEntries(
      Object.entries(allTools).filter(([name]) => name === "groq_query" || name === "schema_explorer"),
    );
    const { output, steps } = await generateText({
      model: openai(process.env.OPENAI_MODEL || "gpt-5.4-mini"),
      instructions: buildSystemPrompt(initialContext),
      prompt: `Search query: ${JSON.stringify(query)}`,
      tools,
      output: Output.object({ schema: outputSchema }),
      stopWhen: stepCountIs(12),
      maxOutputTokens: 4000,
    });
    const ids = output.results.map((result) => result.lessonId);
    const titles: { id: string; title: string | null }[] = await sanity.fetch(
      `$ids[]{ "id": @, "title": *[_type == "lesson" && _id == ^.@][0].title }`,
      { ids },
    );
    const videos = output.results.filter((result) => result.kind === "video").length;
    const invalid = titles.filter((entry) => !entry.title).length;
    return [
      `${query}: ${ids.length} results (${videos} video), ${invalid} invalid ids, ${steps.length} steps, ${Math.round((Date.now() - started) / 1000)}s`,
      `  top:   ${titles.slice(0, 6).map((entry) => entry.title ?? `?${entry.id}`).join(" | ") || "(none)"}`,
      `  terms: ${output.terms.join(", ")}`,
    ].join("\n");
  } catch (error) {
    return `${query}: FAILED ${String(error).slice(0, 300)}`;
  } finally {
    await mcp.close();
  }
}

const queries = JSON.parse(readFileSync(args.queries, "utf8")) as string[];
for (const line of await Promise.all(queries.map(run))) console.log(line);

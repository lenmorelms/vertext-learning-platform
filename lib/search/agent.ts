import "server-only";

import { openai } from "@ai-sdk/openai";
import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { generateText, Output, stepCountIs } from "ai";
import { z } from "zod";

import { buildSystemPrompt } from "./prompt";

const DEFAULT_MODEL = "gpt-5.4-mini";
const MAX_STEPS = 8;
const MAX_RESULTS = 60;

const outputSchema = z.object({
  lessonIds: z
    .array(z.string())
    .describe("Lesson _id values returned by your queries, best match first."),
});

function getConfig() {
  const mcpUrl = process.env.SANITY_CONTEXT_MCP_URL;
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!mcpUrl) throw new Error("Missing environment variable: SANITY_CONTEXT_MCP_URL");
  if (!token) throw new Error("Missing environment variable: SANITY_API_READ_TOKEN");
  if (!process.env.OPENAI_API_KEY) throw new Error("Missing environment variable: OPENAI_API_KEY");
  return { mcpUrl, token, model: process.env.OPENAI_MODEL || DEFAULT_MODEL };
}

// The schema overview is stable, so it is fetched once per server process.
// Changes to it (or to the inline prompt) take effect after a restart.
let initialContext: Promise<string | null> | null = null;

function getInitialContext(mcpUrl: string, token: string) {
  initialContext ??= (async () => {
    const url = new URL(mcpUrl);
    url.pathname = `${url.pathname.replace(/\/$/, "")}/initial-context`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error(`Initial context request failed: ${response.status}`);
    return response.text();
  })().catch((error) => {
    // Do not cache a failure. The agent can still call schema_explorer.
    initialContext = null;
    console.error("[search] initial context unavailable", error);
    return null;
  });
  return initialContext;
}

/**
 * Asks the LLM to find lessons for `query` through the Sanity Context MCP.
 * Returns lesson ids only, best first. The caller loads the lessons itself.
 */
export async function findLessonIds(query: string, { onToolCall }: { onToolCall?: () => void } = {}) {
  const { mcpUrl, token, model } = getConfig();
  let mcpClient: MCPClient | null = null;

  try {
    const [client, context] = await Promise.all([
      createMCPClient({
        transport: { type: "http", url: mcpUrl, headers: { Authorization: `Bearer ${token}` } },
      }),
      getInitialContext(mcpUrl, token),
    ]);
    mcpClient = client;

    const allTools = await mcpClient.tools();
    // Read only tools. The initial context is already in the prompt.
    const tools = Object.fromEntries(
      Object.entries(allTools).filter(([name]) => name === "groq_query" || name === "schema_explorer"),
    );

    const { output } = await generateText({
      model: openai(model),
      instructions: buildSystemPrompt(context),
      prompt: `Search query: ${JSON.stringify(query)}`,
      tools,
      output: Output.object({ schema: outputSchema }),
      stopWhen: stepCountIs(MAX_STEPS),
      maxOutputTokens: 4000,
      onToolExecutionStart: () => onToolCall?.(),
    });

    return [...new Set(output.lessonIds)].slice(0, MAX_RESULTS);
  } finally {
    await mcpClient?.close();
  }
}

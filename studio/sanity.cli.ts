import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;

export default defineCliConfig({
  api: { projectId, dataset },
  // Read from env so `sanity deploy` does not prompt for a hostname.
  studioHost: process.env.SANITY_STUDIO_HOSTNAME || undefined,
  // The deployed Studio (https://vertex-6hua1jt0.sanity.studio). The Context MCP needs it.
  deployment: { appId: "i0u38496ufh0yqr455diihdc" },
  // Types for the web app's GROQ queries are generated into the repo root.
  typegen: {
    path: ["../sanity/**/*.{ts,tsx}", "../app/**/*.{ts,tsx}"],
    schema: "schema.json",
    generates: "../sanity.types.ts",
    overloadClientMethods: true,
  },
});

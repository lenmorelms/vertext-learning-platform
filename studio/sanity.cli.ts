import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;

export default defineCliConfig({
  api: { projectId, dataset },
  // Types for the web app's GROQ queries are generated into the repo root.
  typegen: {
    path: ["../sanity/**/*.{ts,tsx}", "../app/**/*.{ts,tsx}"],
    schema: "schema.json",
    generates: "../sanity.types.ts",
    overloadClientMethods: true,
  },
});

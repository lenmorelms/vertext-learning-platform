import "server-only";

import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

const token = process.env.SANITY_API_READ_TOKEN;

if (!token) {
  throw new Error("Missing environment variable: SANITY_API_READ_TOKEN");
}

// The dataset is private, so every read carries the server only viewer token.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: true,
  perspective: "published",
});

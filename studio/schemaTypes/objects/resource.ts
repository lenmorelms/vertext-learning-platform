import { LinkIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const resource = defineType({
  name: "resource",
  title: "Resource",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "type",
      type: "string",
      options: {
        list: [
          { title: "Documentation", value: "documentation" },
          { title: "Guide", value: "guide" },
          { title: "Repository", value: "repository" },
          { title: "Article", value: "article" },
          { title: "Download", value: "download" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["http", "https"] }),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "type" },
  },
});

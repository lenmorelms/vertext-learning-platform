import { CheckmarkCircleIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const learningOutcome = defineType({
  name: "learningOutcome",
  title: "Learning outcome",
  type: "object",
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: "icon",
      type: "string",
      options: {
        list: [
          { title: "Layers", value: "layers" },
          { title: "Database", value: "database" },
          { title: "Gauge", value: "gauge" },
          { title: "Cloud", value: "cloud" },
          { title: "Code", value: "code" },
          { title: "Shield", value: "shield" },
          { title: "Rocket", value: "rocket" },
          { title: "Sparkles", value: "sparkles" },
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
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
});

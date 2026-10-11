import { StackCompactIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const module = defineType({
  name: "module",
  title: "Module",
  type: "object",
  icon: StackCompactIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      description: "One sentence on what this module covers.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "lessons",
      description: "Every lesson here should genuinely cover this module’s topic.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "lesson" }] })],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "summary" },
  },
});

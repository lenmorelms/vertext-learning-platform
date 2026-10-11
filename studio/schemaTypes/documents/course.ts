import { BookIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const course = defineType({
  name: "course",
  title: "Course",
  type: "document",
  icon: BookIcon,
  groups: [
    { name: "details", title: "Details", default: true },
    { name: "marketing", title: "Marketing" },
    { name: "curriculum", title: "Curriculum" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "details",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "details",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "instructor",
      type: "reference",
      group: "details",
      to: [{ type: "instructor" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      type: "reference",
      group: "details",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      description: "One or two sentences shown on the course card and course page.",
      type: "text",
      rows: 3,
      group: "marketing",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      description: "Square artwork. Also used as the small course icon.",
      type: "image",
      group: "marketing",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          // A warning, not a requirement, so a document can publish without it.
          validation: (rule) => rule.custom((alt) => (alt ? true : "Describe the image for screen readers.")).warning(),
        }),
      ],
    }),
    defineField({
      name: "level",
      type: "string",
      group: "marketing",
      options: {
        list: [
          { title: "Beginner", value: "beginner" },
          { title: "Intermediate", value: "intermediate" },
          { title: "Advanced", value: "advanced" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price (USD)",
      description: "Use 0 for a free course.",
      type: "number",
      group: "marketing",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "popular",
      description: "Shows the popular badge.",
      type: "boolean",
      group: "marketing",
    }),
    defineField({
      name: "studentCount",
      title: "Student count",
      description: "Display only.",
      type: "number",
      group: "marketing",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "learningOutcomes",
      title: "Learning outcomes",
      description: "Shown under “What you’ll learn”.",
      type: "array",
      group: "marketing",
      of: [defineArrayMember({ type: "learningOutcome" })],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "modules",
      description: "Module and lesson numbers come from the order here.",
      type: "array",
      group: "curriculum",
      of: [defineArrayMember({ type: "module" })],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "instructor.name", media: "coverImage" },
  },
});

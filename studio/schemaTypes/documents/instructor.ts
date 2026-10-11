import { UserIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const instructor = defineType({
  name: "instructor",
  title: "Instructor",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          // A warning, not a requirement, so a document can publish without it.
          validation: (rule) => rule.custom((alt) => (alt ? true : "Describe the photo for screen readers.")).warning(),
        }),
      ],
    }),
    defineField({
      name: "expertise",
      description: "Short topics this instructor teaches, for example React or DevOps.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "bio",
      type: "text",
      rows: 5,
    }),
  ],
  preview: {
    select: { title: "name", media: "photo" },
  },
});

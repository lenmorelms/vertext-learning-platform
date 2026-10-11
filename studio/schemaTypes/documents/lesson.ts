import { PlayIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const lesson = defineType({
  name: "lesson",
  title: "Lesson",
  type: "document",
  icon: PlayIcon,
  groups: [
    { name: "details", title: "Details", default: true },
    { name: "video", title: "Video" },
    { name: "content", title: "Content" },
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
      name: "summary",
      description: "One or two sentences shown under the lesson title.",
      type: "text",
      rows: 3,
      group: "details",
    }),
    defineField({
      name: "freePreview",
      title: "Free preview",
      description: "Shows a free preview badge. It is a label, not access control.",
      type: "boolean",
      group: "details",
      initialValue: false,
    }),
    defineField({
      name: "studentCount",
      title: "Student count",
      description: "Display only.",
      type: "number",
      group: "details",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      description: "A YouTube, Vimeo, or Bunny video URL.",
      type: "url",
      group: "video",
      validation: (rule) => rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "duration",
      title: "Duration (seconds)",
      description: "Length of the video in whole seconds.",
      type: "number",
      group: "video",
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: "poster",
      description: "Thumbnail shown before the video plays and on search results.",
      type: "image",
      group: "video",
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
      name: "notes",
      description: "The written lesson content.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              defineArrayMember({
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (rule) =>
                      rule.required().uri({ scheme: ["http", "https", "mailto"] }),
                  }),
                ],
              }),
            ],
          },
        }),
      ],
    }),
    defineField({
      name: "keyPoints",
      title: "Key points",
      description: "Shown under “In this lesson you will”.",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "proTip",
      title: "Pro tip",
      type: "text",
      rows: 3,
      group: "content",
    }),
    defineField({
      name: "resources",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "resource" })],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "summary", media: "poster" },
  },
});

import { defineQuery } from "next-sanity";

const imageFields = /* groq */ `asset, alt, hotspot, crop`;

// Module and lesson numbers are derived from the order of these arrays.
const moduleOutline = /* groq */ `
  modules[]{
    _key,
    title,
    summary,
    "durationSeconds": coalesce(math::sum(lessons[]->duration), 0),
    "lessons": lessons[]->{
      _id,
      title,
      "slug": slug.current,
      duration,
      freePreview
    }
  }
`;

export const COURSES_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && defined(slug.current)] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage{ ${imageFields} },
    level,
    price,
    popular,
    studentCount,
    "category": category->{ _id, title, "slug": slug.current },
    "instructor": instructor->{ _id, name, "slug": slug.current },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[]),
    "durationSeconds": coalesce(math::sum(modules[].lessons[]->duration), 0)
  }
`);

// Home page row: popular first, then the most students.
export const FEATURED_COURSES_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && defined(slug.current)]
    | order(popular desc, studentCount desc, title asc)[0...3] {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage{ ${imageFields} },
    level,
    "moduleCount": count(modules),
    "durationSeconds": coalesce(math::sum(modules[].lessons[]->duration), 0)
  }
`);

export const COURSE_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage{ ${imageFields} },
    level,
    price,
    popular,
    studentCount,
    learningOutcomes[]{ _key, icon, title, description },
    "category": category->{ _id, title, "slug": slug.current },
    "instructor": instructor->{
      _id,
      name,
      "slug": slug.current,
      photo{ ${imageFields} },
      expertise,
      bio
    },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[]),
    "durationSeconds": coalesce(math::sum(modules[].lessons[]->duration), 0),
    ${moduleOutline}
  }
`);

// A lesson stores no parent, so its course comes from a reverse reference.
export const LESSON_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    // With no authored summary, fall back to the first plain paragraph of the notes.
    "summary": coalesce(summary, pt::text(notes[style == "normal" && !defined(listItem)][0])),
    videoUrl,
    thumbnail{ ${imageFields} },
    duration,
    freePreview,
    studentCount,
    notes,
    keyPoints,
    proTip,
    resources[]{ _key, type, title, description, url },
    "course": *[_type == "course" && references(^._id)][0]{
      _id,
      title,
      "slug": slug.current,
      coverImage{ ${imageFields} },
      level,
      "instructor": instructor->{
        _id,
        name,
        "slug": slug.current,
        photo{ ${imageFields} }
      },
      ${moduleOutline}
    }
  }
`);

export const LESSON_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && defined(slug.current)].slug.current
`);

export const INSTRUCTOR_QUERY = defineQuery(/* groq */ `
  *[_type == "instructor" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    photo{ ${imageFields} },
    expertise,
    bio,
    "courses": *[_type == "course" && references(^._id) && defined(slug.current)] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      summary,
      coverImage{ ${imageFields} },
      level,
      "moduleCount": count(modules),
      "durationSeconds": coalesce(math::sum(modules[].lessons[]->duration), 0)
    }
  }
`);

export const CATEGORIES_QUERY = defineQuery(/* groq */ `
  *[_type == "category" && defined(slug.current)] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description
  }
`);

// Search results: the agent picks lesson ids, and the cards are built only from
// this stored data. Lessons with no parent course are left out.
export const SEARCH_LESSONS_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && _id in $ids && defined(slug.current)]{
    _id,
    title,
    "slug": slug.current,
    "summary": coalesce(summary, pt::text(notes[style == "normal" && !defined(listItem)][0])),
    keyPoints,
    "course": *[_type == "course" && references(^._id) && defined(slug.current)][0]{
      _id,
      title,
      "slug": slug.current,
      coverImage{ ${imageFields} },
      modules[]{ title, "lessons": lessons[]{ "_id": _ref } }
    }
  }
`);

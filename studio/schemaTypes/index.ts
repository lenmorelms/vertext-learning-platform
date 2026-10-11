import type { SchemaTypeDefinition } from "sanity";

import { category } from "./documents/category";
import { course } from "./documents/course";
import { instructor } from "./documents/instructor";
import { lesson } from "./documents/lesson";
import { learningOutcome } from "./objects/learning-outcome";
import { module } from "./objects/module";
import { resource } from "./objects/resource";

export const schemaTypes: SchemaTypeDefinition[] = [
  course,
  lesson,
  instructor,
  category,
  module,
  learningOutcome,
  resource,
];

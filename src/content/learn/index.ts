import type { Track } from "./types";
import { pythonLessons } from "./python";
import { sqlLessons } from "./sql";
import { javascriptLessons } from "./javascript";

export const tracks: Track[] = [
  {
    slug: "python",
    language: "Python",
    domain: "Data / AI / Scripting",
    tagline: "The most versatile language in tech.",
    description: "From zero to job-ready Python: syntax, OOP, standard library, and a mini CLI project.",
    icon: "🐍",
    color: "from-yellow-500 to-blue-500",
    seeded: true,
    lessons: pythonLessons,
  },
  {
    slug: "sql",
    language: "SQL",
    domain: "Data / Backend",
    tagline: "The universal language of data.",
    description: "Master SELECT to window functions, indexes, transactions, and query performance.",
    icon: "🗄️",
    color: "from-sky-500 to-indigo-600",
    seeded: true,
    lessons: sqlLessons,
  },
  {
    slug: "javascript",
    language: "JavaScript",
    domain: "Web / Full-stack",
    tagline: "The language of the web — and beyond.",
    description: "Modern ES2020+ JavaScript: closures, async/await, modules, DOM, and tooling.",
    icon: "🟨",
    color: "from-yellow-400 to-orange-500",
    seeded: true,
    lessons: javascriptLessons,
  },
  { slug: "typescript", language: "TypeScript", domain: "Web / Full-stack", tagline: "JavaScript that scales.", description: "AI-generated lessons on demand.", icon: "🔷", color: "from-blue-500 to-cyan-500", seeded: false, lessons: [] },
  { slug: "java", language: "Java", domain: "Enterprise / Android", tagline: "Enterprise workhorse.", description: "AI-generated lessons on demand.", icon: "☕", color: "from-orange-500 to-red-600", seeded: false, lessons: [] },
  { slug: "cpp", language: "C++", domain: "Systems / Games", tagline: "Performance-critical systems.", description: "AI-generated lessons on demand.", icon: "➕", color: "from-indigo-500 to-purple-600", seeded: false, lessons: [] },
  { slug: "go", language: "Go", domain: "Cloud / Backend", tagline: "Simple, fast, concurrent.", description: "AI-generated lessons on demand.", icon: "🐹", color: "from-cyan-500 to-teal-600", seeded: false, lessons: [] },
  { slug: "rust", language: "Rust", domain: "Systems / Web", tagline: "Fast and memory-safe.", description: "AI-generated lessons on demand.", icon: "🦀", color: "from-orange-600 to-red-700", seeded: false, lessons: [] },
  { slug: "html-css", language: "HTML & CSS", domain: "Web / Frontend", tagline: "The visual layer of the web.", description: "AI-generated lessons on demand.", icon: "🎨", color: "from-pink-500 to-rose-600", seeded: false, lessons: [] },
  { slug: "react", language: "React", domain: "Web / Frontend", tagline: "Build UIs with components.", description: "AI-generated lessons on demand.", icon: "⚛️", color: "from-cyan-400 to-blue-600", seeded: false, lessons: [] },
];

export function getTrack(slug: string): Track | undefined {
  return tracks.find((t) => t.slug === slug);
}

export function getLesson(trackSlug: string, lessonSlug: string) {
  const t = getTrack(trackSlug);
  if (!t) return null;
  return t.lessons.find((l) => l.slug === lessonSlug) ?? null;
}

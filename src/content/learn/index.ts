import type { Track } from "./types";
import { pythonLessons } from "./python";
import { sqlLessons } from "./sql";
import { javascriptLessons } from "./javascript";

const PY_SYLLABUS = [
  "Introduction", "Variables", "Strings", "Numbers", "Boolean", "Lists", "Tuples",
  "Dictionaries", "Sets", "Conditional Statements", "Loops", "Functions", "Lambda",
  "File Handling", "Exception Handling", "Modules", "OOP", "Popular Libraries",
  "Mini Project: CLI To-Do", "Final Project: Data Analyzer",
];

const SQL_SYLLABUS = [
  "Introduction", "SELECT", "WHERE", "ORDER BY", "GROUP BY", "HAVING",
  "Aggregate Functions", "JOINS", "Subqueries", "CTE", "Window Functions",
  "Views", "Indexes", "Transactions", "Query Optimization", "Capstone Project",
];

const JAVA_SYLLABUS = [
  "Introduction", "Variables & Types", "Operators", "Control Flow", "Arrays",
  "Strings", "Methods", "OOP: Classes & Objects", "Inheritance", "Interfaces",
  "Collections", "Generics", "Exception Handling", "File I/O", "Streams & Lambdas",
  "Concurrency", "JDBC", "Build Tools", "Final Project",
];

const JS_SYLLABUS = [
  "Introduction", "Variables & Scope", "Types & Coercion", "Operators", "Control Flow",
  "Functions & Closures", "Arrays", "Objects", "ES6+ Features", "Destructuring",
  "Promises & async/await", "Modules", "DOM Basics", "Events", "Fetch & APIs",
  "Error Handling", "Tooling", "Final Project",
];

const CPP_SYLLABUS = [
  "Introduction", "Variables & Types", "Operators", "Control Flow", "Functions",
  "Arrays & Strings", "Pointers & References", "Memory Management",
  "Classes & Objects", "Inheritance", "Polymorphism", "Templates", "STL Containers",
  "STL Algorithms", "File I/O", "Exception Handling", "Final Project",
];

const R_SYLLABUS = [
  "Introduction & RStudio", "Variables & Vectors", "Data Types", "Operators",
  "Control Flow", "Functions", "Lists", "Data Frames", "Reading Data",
  "dplyr Basics", "tidyr & Reshaping", "ggplot2 Visualization", "Statistics",
  "Linear Regression", "R Markdown", "Final Project",
];

const DATA_ANALYTICS_SYLLABUS = [
  "Excel Fundamentals", "Advanced Excel: Pivots & VLOOKUP", "SQL for Analytics",
  "Power BI Basics", "DAX & Measures", "Statistics for Analysts", "Data Cleaning",
  "Dashboard Design", "Business Analytics Frameworks", "Case Study: Sales Analytics",
  "Capstone Project",
];

const DATA_SCIENCE_SYLLABUS = [
  "Python for DS", "NumPy Essentials", "Pandas Deep Dive", "Matplotlib",
  "Seaborn", "Descriptive Statistics", "Inferential Statistics", "Intro to ML",
  "Supervised Learning", "Unsupervised Learning", "Deep Learning Intro",
  "NLP Basics", "Computer Vision Basics", "Capstone Project",
];

const ML_SYLLABUS = [
  "ML Fundamentals", "Data Preprocessing", "Linear Regression", "Logistic Regression",
  "Decision Trees", "Random Forests", "SVM", "KNN", "Clustering (K-Means)",
  "PCA & Dimensionality Reduction", "Feature Engineering", "Model Evaluation",
  "Cross-Validation", "Ensemble Learning: Boosting", "Deployment Basics", "Projects",
];

const AI_SYLLABUS = [
  "AI Fundamentals", "History & Landscape", "Generative AI Overview",
  "Prompt Engineering", "LLM Architectures", "RAG (Retrieval-Augmented Generation)",
  "Vector Databases", "AI Agents", "Tool Use & Function Calling", "Fine-Tuning",
  "Evaluation & Safety", "Building an AI Product",
];

const WEB_SYLLABUS = [
  "How the Web Works", "HTML Fundamentals", "CSS Fundamentals", "Responsive Design",
  "Tailwind CSS", "JavaScript for the Web", "React Fundamentals", "React State & Hooks",
  "Node.js Basics", "Express.js APIs", "REST vs GraphQL", "Authentication",
  "Databases: SQL vs NoSQL", "Deployment", "Full-Stack Project",
];

const CLOUD_SYLLABUS = [
  "Cloud Fundamentals", "AWS Core Services", "Azure Overview", "GCP Overview",
  "IAM & Security", "Compute (EC2/VM)", "Storage & Databases", "Networking Basics",
  "Docker", "Kubernetes", "CI/CD Pipelines", "Serverless", "Cost Optimization",
  "Capstone Deployment",
];

const CYBER_SYLLABUS = [
  "Security Fundamentals", "Networking Basics", "Linux for Security",
  "Cryptography Basics", "Web Vulnerabilities (OWASP Top 10)", "Ethical Hacking Intro",
  "Reconnaissance", "Penetration Testing Basics", "Defense & Hardening",
  "Incident Response", "Capstone CTF",
];

const DEVOPS_SYLLABUS = [
  "DevOps Culture", "Git Fundamentals", "GitHub Workflows", "Linux Basics",
  "Docker", "Docker Compose", "Kubernetes", "Jenkins Pipelines",
  "GitHub Actions", "Terraform (IaC)", "Monitoring & Logging", "Capstone Pipeline",
];

const APTITUDE_SYLLABUS = [
  "Numbers & Percentages", "Ratios & Proportions", "Time, Speed & Distance",
  "Time & Work", "Profit & Loss", "Probability & Combinatorics",
  "Series & Analogies", "Blood Relations", "Direction Sense", "Puzzles",
  "Reading Comprehension", "Sentence Correction", "Vocabulary",
  "Coding Round Strategy", "HR Interview Prep",
];

export const tracks: Track[] = [
  // ========== PROGRAMMING LANGUAGES ==========
  { slug: "python", language: "Python", category: "programming", domain: "Programming Languages", tagline: "The most versatile language in tech.", description: "From zero to job-ready Python: syntax, OOP, standard library, and a mini CLI project.", icon: "🐍", color: "from-yellow-500 to-blue-500", seeded: true, syllabus: PY_SYLLABUS, lessons: pythonLessons },
  { slug: "sql", language: "SQL", category: "programming", domain: "Programming Languages", tagline: "The universal language of data.", description: "Master SELECT to window functions, indexes, transactions, and query performance.", icon: "🗄️", color: "from-sky-500 to-indigo-600", seeded: true, syllabus: SQL_SYLLABUS, lessons: sqlLessons },
  { slug: "javascript", language: "JavaScript", category: "programming", domain: "Programming Languages", tagline: "The language of the web — and beyond.", description: "Modern ES2020+ JavaScript: closures, async/await, modules, DOM, and tooling.", icon: "🟨", color: "from-yellow-400 to-orange-500", seeded: true, syllabus: JS_SYLLABUS, lessons: javascriptLessons },
  { slug: "java", language: "Java", category: "programming", domain: "Programming Languages", tagline: "Enterprise workhorse.", description: "Object-oriented Java: classes, collections, streams, and concurrency.", icon: "☕", color: "from-orange-500 to-red-600", seeded: false, syllabus: JAVA_SYLLABUS, lessons: [] },
  { slug: "cpp", language: "C++", category: "programming", domain: "Programming Languages", tagline: "Performance-critical systems.", description: "Pointers, memory, OOP, templates, and the STL.", icon: "➕", color: "from-indigo-500 to-purple-600", seeded: false, syllabus: CPP_SYLLABUS, lessons: [] },
  { slug: "r", language: "R Programming", category: "programming", domain: "Programming Languages", tagline: "Statistics and data science in R.", description: "Vectors, data frames, dplyr, ggplot2, and modeling.", icon: "📊", color: "from-blue-400 to-blue-700", seeded: false, syllabus: R_SYLLABUS, lessons: [] },

  // ========== DOMAIN KNOWLEDGE ==========
  { slug: "data-analytics", language: "Data Analytics", category: "domain", domain: "Data & AI", tagline: "Turn raw data into decisions.", description: "Excel, SQL, Power BI, statistics, dashboards, and business analytics.", icon: "📈", color: "from-emerald-500 to-teal-600", seeded: false, syllabus: DATA_ANALYTICS_SYLLABUS, lessons: [] },
  { slug: "data-science", language: "Data Science", category: "domain", domain: "Data & AI", tagline: "Python-powered data science.", description: "NumPy, Pandas, visualization, statistics, and ML foundations.", icon: "🔬", color: "from-cyan-500 to-blue-600", seeded: false, syllabus: DATA_SCIENCE_SYLLABUS, lessons: [] },
  { slug: "machine-learning", language: "Machine Learning", category: "domain", domain: "Data & AI", tagline: "Classical ML end-to-end.", description: "Regression, classification, clustering, feature engineering, and evaluation.", icon: "🤖", color: "from-purple-500 to-pink-600", seeded: false, syllabus: ML_SYLLABUS, lessons: [] },
  { slug: "ai", language: "Artificial Intelligence", category: "domain", domain: "Data & AI", tagline: "Modern AI, LLMs, and agents.", description: "Generative AI, prompt engineering, RAG, agents, and fine-tuning.", icon: "🧠", color: "from-fuchsia-500 to-purple-700", seeded: false, syllabus: AI_SYLLABUS, lessons: [] },

  { slug: "web-development", language: "Web Development", category: "domain", domain: "Engineering", tagline: "Full-stack web from HTML to APIs.", description: "HTML, CSS, JavaScript, React, Tailwind, Node.js, Express, auth, databases.", icon: "🌐", color: "from-pink-500 to-rose-600", seeded: false, syllabus: WEB_SYLLABUS, lessons: [] },
  { slug: "cloud-computing", language: "Cloud Computing", category: "domain", domain: "Engineering", tagline: "AWS, Azure, GCP fundamentals.", description: "Compute, storage, networking, containers, CI/CD, and cost optimization.", icon: "☁️", color: "from-sky-400 to-blue-600", seeded: false, syllabus: CLOUD_SYLLABUS, lessons: [] },
  { slug: "cyber-security", language: "Cyber Security", category: "domain", domain: "Engineering", tagline: "Defend and probe systems.", description: "Networking, Linux, ethical hacking, and penetration testing basics.", icon: "🔐", color: "from-slate-500 to-slate-800", seeded: false, syllabus: CYBER_SYLLABUS, lessons: [] },
  { slug: "devops", language: "DevOps", category: "domain", domain: "Engineering", tagline: "Ship faster, more reliably.", description: "Git, Docker, Kubernetes, Jenkins, Terraform, and CI/CD pipelines.", icon: "🛠️", color: "from-amber-500 to-orange-600", seeded: false, syllabus: DEVOPS_SYLLABUS, lessons: [] },

  { slug: "aptitude-placement", language: "Aptitude & Placement", category: "domain", domain: "Career Readiness", tagline: "Ace campus placements.", description: "Quantitative, logical, verbal, coding round strategy, and HR interview prep.", icon: "🎯", color: "from-rose-500 to-red-600", seeded: false, syllabus: APTITUDE_SYLLABUS, lessons: [] },
];

export function getTrack(slug: string): Track | undefined {
  return tracks.find((t) => t.slug === slug);
}

export function getLesson(trackSlug: string, lessonSlug: string) {
  const t = getTrack(trackSlug);
  if (!t) return null;
  return t.lessons.find((l) => l.slug === lessonSlug) ?? null;
}

export function topicSlug(topic: string): string {
  return topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

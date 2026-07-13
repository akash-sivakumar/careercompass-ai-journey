export type ProjectIdea = {
  title: string;
  brief: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  hours: number;
  skills: string[];
  portfolio: "Low" | "Medium" | "High";
  githubQuery: string;
};

const P = (
  title: string,
  brief: string,
  difficulty: ProjectIdea["difficulty"],
  hours: number,
  skills: string[],
  portfolio: ProjectIdea["portfolio"] = "Medium",
): ProjectIdea => ({
  title, brief, difficulty, hours, skills, portfolio,
  githubQuery: `https://github.com/search?q=${encodeURIComponent(title)}&type=repositories`,
});

export const PROJECTS_BY_TRACK: Record<string, ProjectIdea[]> = {
  python: [
    P("CLI Expense Tracker", "Track expenses in a JSON file with categories and monthly summaries.", "Beginner", 6, ["Python", "File I/O", "argparse"]),
    P("Weather App", "Fetch live weather using an open API and print formatted forecasts.", "Beginner", 4, ["Python", "requests", "APIs"]),
    P("Library Management (OOP)", "Model books, members, loans as classes with a simple menu-driven CLI.", "Intermediate", 10, ["Python", "OOP"], "High"),
    P("Web Scraper Dashboard", "Scrape a news site and render a static HTML report.", "Intermediate", 8, ["Python", "BeautifulSoup", "HTML"]),
  ],
  sql: [
    P("Sales Analytics Warehouse", "Model a star schema and answer 10 business questions.", "Intermediate", 8, ["SQL", "Joins", "Window Functions"], "High"),
    P("Hospital Database", "Design and query a normalized hospital DB with patients, visits, prescriptions.", "Beginner", 6, ["SQL", "Normalization"]),
    P("Bank Transactions", "Model accounts, transactions, and write CTE queries for monthly statements.", "Intermediate", 8, ["SQL", "CTEs"]),
  ],
  javascript: [
    P("Todo App with LocalStorage", "Add/remove/edit todos, persist across reloads.", "Beginner", 4, ["JavaScript", "DOM"]),
    P("Movie Search (OMDb)", "Search movies and render cards from an API.", "Beginner", 6, ["JavaScript", "fetch", "APIs"]),
    P("Kanban Board", "Drag-and-drop tasks between columns.", "Intermediate", 12, ["JavaScript", "Drag & Drop"], "High"),
  ],
  typescript: [
    P("Typed REST Client", "Wrap fetch with generics and Zod runtime validation.", "Intermediate", 6, ["TypeScript", "Generics", "Zod"], "High"),
    P("Command Palette Library", "Publish a tiny keyboard-driven palette with full types.", "Advanced", 12, ["TypeScript", "npm"]),
  ],
  java: [
    P("Student Management System", "JDBC + Swing CRUD app.", "Intermediate", 12, ["Java", "JDBC", "OOP"]),
    P("Multithreaded Chat", "Socket-based chat with a thread per client.", "Advanced", 14, ["Java", "Concurrency", "Sockets"], "High"),
  ],
  c: [
    P("Mini Shell", "Parse commands, fork+exec, handle pipes.", "Advanced", 16, ["C", "Pointers", "syscalls"], "High"),
    P("Memory Allocator", "Implement malloc/free over sbrk.", "Advanced", 20, ["C", "Memory"], "High"),
  ],
  cpp: [
    P("Bank Management (STL)", "Vectors, maps, file persistence.", "Intermediate", 10, ["C++", "STL", "OOP"]),
    P("2D Game with SFML", "Simple platformer or shooter.", "Advanced", 20, ["C++", "SFML"], "High"),
  ],
  r: [
    P("Retail EDA Report", "R Markdown notebook analyzing a sales dataset.", "Beginner", 6, ["R", "dplyr", "ggplot2"]),
    P("Linear Regression Model", "Predict housing prices with diagnostics.", "Intermediate", 8, ["R", "Statistics"]),
  ],
  "data-analytics": [
    P("HR Attrition Dashboard", "Power BI/Tableau dashboard on IBM HR dataset.", "Beginner", 8, ["Power BI", "DAX"], "High"),
    P("Netflix Content Analysis", "SQL + visualization on the Netflix titles dataset.", "Intermediate", 10, ["SQL", "Visualization"]),
    P("Sales Performance Report", "Interactive dashboard with KPIs and drill-downs.", "Intermediate", 10, ["Excel", "Power BI"], "High"),
  ],
  "data-science": [
    P("Customer Churn Prediction", "EDA + logistic regression + XGBoost baseline.", "Intermediate", 12, ["Pandas", "Scikit-learn"], "High"),
    P("Retail Sales Forecast", "Time-series with Prophet or ARIMA.", "Advanced", 16, ["Pandas", "Time Series"], "High"),
  ],
  "machine-learning": [
    P("House Price Prediction", "Regression pipeline with feature engineering.", "Intermediate", 10, ["Scikit-learn", "Pandas"], "High"),
    P("Spam Detection", "TF-IDF + Naive Bayes classifier.", "Beginner", 6, ["NLP", "Scikit-learn"]),
    P("Movie Recommender", "Collaborative filtering with matrix factorization.", "Advanced", 14, ["ML", "Recommenders"], "High"),
  ],
  ai: [
    P("Prompt Playground", "UI that A/B tests two prompts across a dataset.", "Intermediate", 10, ["LLMs", "Prompt Engineering"]),
    P("Personal Study Coach", "LLM + your own notes as a study buddy.", "Intermediate", 12, ["LLMs", "RAG"], "High"),
  ],
  "ai-engineering": [
    P("PDF Q&A over Your Notes", "RAG pipeline with chunking + vector DB.", "Intermediate", 14, ["RAG", "Embeddings", "Vector DB"], "High"),
    P("Multi-tool Agent", "LangGraph agent that browses + summarizes.", "Advanced", 20, ["Agents", "LangChain"], "High"),
  ],
  "web-development": [
    P("Blog with Auth", "React + Node + PostgreSQL + JWT auth.", "Intermediate", 16, ["React", "Node", "SQL"], "High"),
    P("Real-Time Chat", "Socket.io messaging with rooms.", "Intermediate", 14, ["Node", "WebSockets"]),
    P("E-Commerce Storefront", "Cart, checkout, Stripe test mode.", "Advanced", 24, ["Full-stack", "Stripe"], "High"),
  ],
  "mobile-development": [
    P("Habit Tracker (Flutter)", "Local storage, notifications, streaks.", "Intermediate", 14, ["Flutter", "Dart"], "High"),
    P("Expense Tracker (RN)", "Charts, categories, cloud sync.", "Intermediate", 14, ["React Native"]),
  ],
  "cloud-computing": [
    P("Serverless URL Shortener", "Lambda + DynamoDB + API Gateway.", "Intermediate", 10, ["AWS", "Serverless"], "High"),
    P("Dockerized Blog Deploy", "CI/CD to a cloud VM.", "Beginner", 8, ["Docker", "CI/CD"]),
  ],
  "cyber-security": [
    P("OWASP Juice Shop Walkthrough", "Solve top 10 challenges with write-ups.", "Beginner", 10, ["Web Security", "OWASP"], "High"),
    P("Home Lab Pentest", "Set up a vulnerable VM and pen-test it end-to-end.", "Intermediate", 16, ["Networking", "Kali"], "High"),
  ],
  devops: [
    P("GitHub Actions CI Pipeline", "Test + build + deploy for a real app.", "Beginner", 6, ["GitHub Actions", "CI/CD"]),
    P("K8s Blue/Green Deploy", "Manifest, service, ingress on a cluster.", "Advanced", 14, ["Kubernetes", "Helm"], "High"),
    P("Terraform AWS Stack", "IaC for VPC + EC2 + RDS.", "Intermediate", 12, ["Terraform", "AWS"]),
  ],
  "ui-ux-design": [
    P("Fintech App Redesign", "Case study with research, wireframes, prototype.", "Intermediate", 20, ["Figma", "UX Research"], "High"),
    P("Design System Starter", "Tokens, components, docs in Figma.", "Advanced", 16, ["Design Systems"], "High"),
  ],
  "software-engineering": [
    P("URL Shortener Service", "Design + implement with system-design write-up.", "Intermediate", 12, ["System Design", "APIs"], "High"),
    P("LRU Cache Library", "Package with tests and benchmarks.", "Intermediate", 8, ["Data Structures"]),
  ],
  "aptitude-placement": [
    P("30-Day Prep Tracker", "Notion/Sheet tracker of daily topics + accuracy.", "Beginner", 3, ["Study Plan"]),
  ],
};

export function projectsForTrack(slug: string): ProjectIdea[] {
  return PROJECTS_BY_TRACK[slug] ?? [];
}

import type { Lesson } from "./types";

export const sqlLessons: Lesson[] = [
  {
    slug: "intro-to-sql",
    title: "Intro to SQL & Relational Databases",
    minutes: 8,
    summary: "What SQL is, RDBMS concepts, and the query lifecycle.",
    sections: [
      { heading: "What is SQL", body: "SQL (Structured Query Language) is the standard language for relational databases (Postgres, MySQL, SQL Server, SQLite, Oracle). It's declarative — you say what you want, not how to fetch it." },
      { heading: "Relational model", body: "Data lives in tables (relations) with rows and typed columns. Tables relate through keys. The design goal is to eliminate duplication and enforce consistency." },
      { heading: "Query lifecycle", body: "Parser → planner → optimizer → executor. The engine may pick indexes, join order, and parallel workers. Same result, different plans." },
    ],
    examples: [
      { language: "sql", code: "-- Your first SQL query\nSELECT 1 + 1 AS answer;" },
    ],
    quiz: [
      { q: "SQL is:", options: ["Imperative", "Declarative", "Assembly", "Markup"], answer: 1 },
      { q: "Which is NOT an RDBMS?", options: ["Postgres", "MySQL", "Redis", "SQLite"], answer: 2, explain: "Redis is a key-value store." },
      { q: "A table row is also called:", options: ["Column", "Tuple", "Schema", "View"], answer: 1 },
    ],
  },
  {
    slug: "data-types",
    title: "Data Types",
    minutes: 8,
    summary: "Choosing the right column types for correctness and performance.",
    sections: [
      { heading: "Numbers", body: "`INTEGER`, `BIGINT`, `NUMERIC(p,s)` for exact decimals (money), `REAL`/`DOUBLE PRECISION` for floats. Use `NUMERIC` for currency." },
      { heading: "Strings", body: "`VARCHAR(n)`, `TEXT`. In Postgres there is no performance difference between `TEXT` and `VARCHAR` — prefer `TEXT` unless a length limit is a real business rule." },
      { heading: "Date/time", body: "`DATE`, `TIME`, `TIMESTAMP`, `TIMESTAMPTZ` (with timezone — always prefer for events). Never store dates as strings." },
      { heading: "Booleans, JSON, arrays", body: "`BOOLEAN`, `JSONB` (indexed JSON in Postgres), and array types are supported by modern engines." },
    ],
    examples: [
      { language: "sql", code: "CREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  total NUMERIC(10,2) NOT NULL,\n  placed_at TIMESTAMPTZ DEFAULT NOW()\n);" },
    ],
    quiz: [
      { q: "Best type for currency:", options: ["FLOAT", "NUMERIC", "TEXT", "INTEGER"], answer: 1 },
      { q: "Preferred timestamp type:", options: ["TIMESTAMP", "TIMESTAMPTZ", "DATE", "TEXT"], answer: 1 },
      { q: "Indexable JSON in Postgres:", options: ["JSON", "JSONB", "XML", "BLOB"], answer: 1 },
    ],
  },
  {
    slug: "create-table",
    title: "CREATE TABLE & Schemas",
    minutes: 10,
    summary: "Defining tables, columns, constraints, and defaults.",
    sections: [
      { heading: "Basic syntax", body: "`CREATE TABLE name (col TYPE constraints, ...)`. Constraints: `NOT NULL`, `UNIQUE`, `DEFAULT value`, `CHECK (expr)`, `PRIMARY KEY`, `REFERENCES`." },
      { heading: "Primary keys", body: "Every table should have one. Use `SERIAL` / `BIGSERIAL` (Postgres) or `UUID` for distributed systems. Composite keys allowed." },
      { heading: "ALTER TABLE", body: "Add/drop columns and constraints as your schema evolves: `ALTER TABLE t ADD COLUMN email TEXT;`. Migrations should be reviewable and reversible." },
    ],
    examples: [
      { language: "sql", code: "CREATE TABLE users (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  email TEXT UNIQUE NOT NULL,\n  age INTEGER CHECK (age >= 0),\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);" },
    ],
    quiz: [
      { q: "Which enforces uniqueness at row level?", options: ["NOT NULL", "UNIQUE", "CHECK", "DEFAULT"], answer: 1 },
      { q: "Primary key implies:", options: ["Only NOT NULL", "Only UNIQUE", "Both", "Nothing"], answer: 2 },
      { q: "Add a column:", options: ["UPDATE TABLE ADD", "ALTER TABLE ADD COLUMN", "MODIFY TABLE", "TABLE ADD"], answer: 1 },
    ],
  },
  {
    slug: "insert",
    title: "INSERT: Adding Rows",
    minutes: 6,
    summary: "Single and bulk inserts, returning generated values.",
    sections: [
      { heading: "Single row", body: "`INSERT INTO t (col1, col2) VALUES (v1, v2);`. Omit columns with defaults." },
      { heading: "Multi-row", body: "`INSERT INTO t (a,b) VALUES (1,2), (3,4), (5,6);` is one statement — much faster than many single inserts." },
      { heading: "RETURNING & UPSERT", body: "Postgres: `INSERT ... RETURNING id` gives back generated columns. `ON CONFLICT (col) DO UPDATE SET ...` performs an upsert." },
    ],
    examples: [
      { language: "sql", code: "INSERT INTO users (email, age)\nVALUES ('ada@example.com', 36)\nON CONFLICT (email) DO UPDATE SET age = EXCLUDED.age\nRETURNING id, email;" },
    ],
    quiz: [
      { q: "Fastest way to add many rows:", options: ["Many INSERTs", "Multi-row INSERT", "One at a time in loop", "TRUNCATE + INSERT"], answer: 1 },
      { q: "RETURNING clause is useful for:", options: ["Deleting", "Getting generated columns", "Joining", "Aggregating"], answer: 1 },
      { q: "Upsert keyword in Postgres:", options: ["MERGE", "REPLACE", "ON CONFLICT", "UPSERT"], answer: 2 },
    ],
  },
  {
    slug: "select-basics",
    title: "SELECT: Basic Queries",
    minutes: 8,
    summary: "Choose columns, alias, and compute expressions.",
    sections: [
      { heading: "Column list", body: "`SELECT col1, col2 FROM t;` — prefer explicit lists over `SELECT *` in production (schema drift, bandwidth)." },
      { heading: "Aliases", body: "Rename columns with `AS`: `SELECT price * quantity AS subtotal FROM items;`. Table aliases shorten joins." },
      { heading: "DISTINCT", body: "`SELECT DISTINCT country FROM users;` removes duplicate rows. Prefer `GROUP BY` when you also aggregate." },
    ],
    examples: [
      { language: "sql", code: "SELECT id, email, LOWER(email) AS email_lower\nFROM users\nWHERE age >= 18;" },
    ],
    quiz: [
      { q: "SELECT * downsides:", options: ["Always faster", "Bandwidth + schema fragility", "Wrong syntax", "Only works on views"], answer: 1 },
      { q: "Column alias keyword:", options: ["AKA", "AS", "IS", "LIKE"], answer: 1 },
      { q: "Remove duplicate rows:", options: ["UNIQUE", "DISTINCT", "GROUP", "SET"], answer: 1 },
    ],
  },
  {
    slug: "where",
    title: "WHERE: Filtering Rows",
    minutes: 8,
    summary: "Comparison, logical, LIKE, IN, BETWEEN, and NULL handling.",
    sections: [
      { heading: "Operators", body: "`= <> < <= > >=`, `AND`, `OR`, `NOT`. Precedence: NOT > AND > OR; use parentheses for clarity." },
      { heading: "IN, BETWEEN, LIKE", body: "`WHERE country IN ('IN','US')`; `WHERE age BETWEEN 18 AND 30`; `WHERE email LIKE '%@gmail.com'` (`%` any, `_` one)." },
      { heading: "NULLs", body: "`NULL` means unknown. `col = NULL` is always UNKNOWN — use `IS NULL` / `IS NOT NULL`. `COALESCE(a, b, 'default')` returns first non-null." },
    ],
    examples: [
      { language: "sql", code: "SELECT * FROM users\nWHERE (country IN ('IN','US'))\n  AND age BETWEEN 18 AND 30\n  AND deleted_at IS NULL;" },
    ],
    quiz: [
      { q: "Correct null check:", options: ["= NULL", "IS NULL", "== NULL", "NULL()"], answer: 1 },
      { q: "LIKE wildcard for many chars:", options: ["*", "_", "%", "?"], answer: 2 },
      { q: "COALESCE returns:", options: ["Last non-null", "First non-null", "Sum", "Max"], answer: 1 },
    ],
  },
  {
    slug: "order-and-limit",
    title: "ORDER BY, LIMIT & Pagination",
    minutes: 8,
    summary: "Sort results and page through them safely.",
    sections: [
      { heading: "ORDER BY", body: "`ORDER BY col ASC|DESC`. Order multiple columns for tie-breaking. `NULLS FIRST` / `NULLS LAST` (Postgres) controls null placement." },
      { heading: "LIMIT / OFFSET", body: "`LIMIT n OFFSET m` — simple but slow on deep offsets (the DB still reads skipped rows)." },
      { heading: "Keyset pagination", body: "Better for infinite scroll: `WHERE (created_at, id) < (:last_ts, :last_id) ORDER BY created_at DESC, id DESC LIMIT 20`." },
    ],
    examples: [
      { language: "sql", code: "SELECT id, title\nFROM posts\nORDER BY created_at DESC, id DESC\nLIMIT 20 OFFSET 40;" },
    ],
    quiz: [
      { q: "Descending order keyword:", options: ["DOWN", "DESC", "REV", "SORT-"], answer: 1 },
      { q: "Better for large-offset pagination:", options: ["OFFSET", "Keyset (seek) pagination", "SELECT *", "GROUP BY"], answer: 1 },
      { q: "ORDER BY runs:", options: ["Before WHERE", "Before SELECT", "After SELECT list", "Never"], answer: 2 },
    ],
  },
  {
    slug: "update-delete",
    title: "UPDATE & DELETE",
    minutes: 8,
    summary: "Mutate rows safely with WHERE, transactions, and RETURNING.",
    sections: [
      { heading: "UPDATE", body: "`UPDATE t SET col = value WHERE ...`. Missing WHERE updates the whole table! Preview with `SELECT` first." },
      { heading: "DELETE", body: "`DELETE FROM t WHERE ...`. Same footgun. Consider soft deletes (`deleted_at TIMESTAMPTZ`) for audit trails." },
      { heading: "TRUNCATE", body: "Faster than DELETE for wiping a whole table; skips triggers/RLS in many engines. Cannot be rolled back in some DBs." },
    ],
    examples: [
      { language: "sql", code: "BEGIN;\nUPDATE users\nSET age = age + 1\nWHERE email = 'ada@example.com'\nRETURNING id, age;\nCOMMIT;" },
    ],
    quiz: [
      { q: "UPDATE without WHERE affects:", options: ["No rows", "One random row", "Every row", "Errors out"], answer: 2 },
      { q: "Soft delete adds:", options: ["A boolean is_ok", "A deleted_at timestamp", "A trigger only", "Nothing"], answer: 1 },
      { q: "TRUNCATE vs DELETE:", options: ["Same", "TRUNCATE is slower", "TRUNCATE is faster/no WHERE", "DELETE is DDL"], answer: 2 },
    ],
  },
  {
    slug: "aggregates",
    title: "Aggregate Functions",
    minutes: 8,
    summary: "COUNT, SUM, AVG, MIN, MAX and how NULLs behave.",
    sections: [
      { heading: "Common aggregates", body: "`COUNT(*)` counts rows; `COUNT(col)` skips NULLs. `SUM`, `AVG`, `MIN`, `MAX`, `STRING_AGG`, `ARRAY_AGG` for concatenation." },
      { heading: "DISTINCT inside aggregates", body: "`COUNT(DISTINCT user_id)` — unique users. `AVG(DISTINCT amount)`." },
      { heading: "Behavior with WHERE", body: "Aggregates ignore rows filtered by WHERE. Use `FILTER (WHERE …)` (Postgres) for conditional aggregation in the same query." },
    ],
    examples: [
      { language: "sql", code: "SELECT COUNT(*) AS total_orders,\n       COUNT(DISTINCT user_id) AS unique_buyers,\n       AVG(total) FILTER (WHERE status='paid') AS avg_paid\nFROM orders;" },
    ],
    quiz: [
      { q: "COUNT(*) counts:", options: ["Non-null values only", "All rows", "Distinct rows", "Columns"], answer: 1 },
      { q: "Conditional aggregate clause:", options: ["WHERE", "FILTER", "ONLY", "IF"], answer: 1 },
      { q: "Unique count of column x:", options: ["COUNT(x)", "COUNT DISTINCT x", "COUNT(DISTINCT x)", "SUM DISTINCT"], answer: 2 },
    ],
  },
  {
    slug: "group-by-having",
    title: "GROUP BY & HAVING",
    minutes: 10,
    summary: "Bucket rows and filter groups.",
    sections: [
      { heading: "GROUP BY", body: "Groups rows sharing values in listed columns; aggregates run per group. Every non-aggregated SELECT column must appear in GROUP BY." },
      { heading: "HAVING", body: "Filters groups (like WHERE for aggregates): `HAVING SUM(total) > 1000`. WHERE filters rows before grouping; HAVING after." },
      { heading: "GROUPING SETS / ROLLUP", body: "Return multiple aggregation levels in one query (e.g., subtotals + grand total). Great for reports." },
    ],
    examples: [
      { language: "sql", code: "SELECT country, COUNT(*) AS users, AVG(age) AS avg_age\nFROM users\nGROUP BY country\nHAVING COUNT(*) >= 10\nORDER BY users DESC;" },
    ],
    quiz: [
      { q: "HAVING filters:", options: ["Rows before grouping", "Groups after aggregation", "Columns", "Nothing"], answer: 1 },
      { q: "Non-aggregated SELECT columns must:", options: ["Be indexed", "Appear in GROUP BY", "Be primary keys", "Be aliases"], answer: 1 },
      { q: "ROLLUP produces:", options: ["Random order", "Subtotals + grand total", "Only totals", "Extra rows unrelated"], answer: 1 },
    ],
  },
  {
    slug: "inner-join",
    title: "JOINs: INNER JOIN",
    minutes: 10,
    summary: "Combine data from related tables.",
    sections: [
      { heading: "The idea", body: "A join stitches rows from two tables on a matching condition (usually a foreign-key equality). INNER JOIN keeps only rows that match in both sides." },
      { heading: "Syntax", body: "`FROM a JOIN b ON a.id = b.a_id`. Use table aliases: `FROM users u JOIN orders o ON o.user_id = u.id`." },
      { heading: "Multiple joins", body: "Chain them: `JOIN products p ON p.id = o.product_id`. Postgres and most DBs optimize join order — but bad joins on huge tables kill performance." },
    ],
    examples: [
      { language: "sql", code: "SELECT u.email, COUNT(o.id) AS orders_count\nFROM users u\nJOIN orders o ON o.user_id = u.id\nGROUP BY u.email\nORDER BY orders_count DESC;" },
    ],
    quiz: [
      { q: "INNER JOIN keeps:", options: ["All rows both sides", "Only matching rows", "Only left", "Only right"], answer: 1 },
      { q: "Best way to shorten table names:", options: ["Rename tables", "Use aliases", "Views", "Comments"], answer: 1 },
      { q: "Join on foreign key uses:", options: ["=", "ON", "IN", "MATCH"], answer: 1, explain: "Syntax: JOIN t2 ON t1.col = t2.col." },
    ],
  },
  {
    slug: "outer-joins",
    title: "LEFT, RIGHT & FULL OUTER JOINs",
    minutes: 10,
    summary: "Keep unmatched rows, and find missing relationships.",
    sections: [
      { heading: "LEFT JOIN", body: "Keeps every row from the left table; NULLs fill missing right-side columns. Great for 'users with 0 orders': filter with `WHERE right.id IS NULL`." },
      { heading: "RIGHT and FULL", body: "Mirror image, and the union of both. RIGHT is rarely used — rewrite as LEFT with tables swapped." },
      { heading: "CROSS JOIN", body: "Cartesian product — every row × every row. Useful with tally tables and calendar generation." },
    ],
    examples: [
      { language: "sql", code: "-- Users who have never ordered\nSELECT u.email\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE o.id IS NULL;" },
    ],
    quiz: [
      { q: "LEFT JOIN keeps:", options: ["All left rows", "All matching rows", "All right rows", "No rows"], answer: 0 },
      { q: "Find rows without a match on the right:", options: ["WHERE right.id IS NOT NULL", "WHERE right.id IS NULL", "GROUP BY right.id", "INNER JOIN"], answer: 1 },
      { q: "CROSS JOIN produces:", options: ["Union", "Cartesian product", "Only matches", "Empty set"], answer: 1 },
    ],
  },
  {
    slug: "self-joins",
    title: "Self Joins & Recursive Joins",
    minutes: 10,
    summary: "Join a table to itself for hierarchies and comparisons.",
    sections: [
      { heading: "Self join basics", body: "Alias the table twice: `FROM employees e JOIN employees m ON e.manager_id = m.id`. Common for org charts and category trees." },
      { heading: "Recursive CTE", body: "For arbitrary-depth trees use `WITH RECURSIVE`. Base case + union with the recursive step until nothing new." },
    ],
    examples: [
      { language: "sql", code: "WITH RECURSIVE org AS (\n  SELECT id, name, manager_id, 1 AS lvl FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, o.lvl+1\n  FROM employees e JOIN org o ON e.manager_id = o.id\n)\nSELECT * FROM org ORDER BY lvl;" },
    ],
    quiz: [
      { q: "Self join needs:", options: ["Two tables", "Two aliases of same table", "A trigger", "Recursion"], answer: 1 },
      { q: "For arbitrary depth trees use:", options: ["Regular join", "WITH RECURSIVE", "SELF JOIN keyword", "OUTER JOIN"], answer: 1 },
      { q: "Recursive CTE combines base and recursive parts with:", options: ["UNION", "UNION ALL", "INTERSECT", "JOIN"], answer: 1 },
    ],
  },
  {
    slug: "subqueries",
    title: "Subqueries",
    minutes: 10,
    summary: "Queries inside queries — scalar, IN, EXISTS, and correlated forms.",
    sections: [
      { heading: "Scalar subqueries", body: "A single-value query used inline: `SELECT name, (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) FROM users u;`." },
      { heading: "IN vs EXISTS", body: "`WHERE id IN (SELECT user_id FROM orders)` is set membership; `EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)` short-circuits on the first match — often faster on big tables." },
      { heading: "Correlated subqueries", body: "Reference an outer row (`o.user_id = u.id`). Read as 'for each outer row, run this'. Sometimes rewritten as joins for speed." },
    ],
    examples: [
      { language: "sql", code: "-- Users with at least one paid order\nSELECT u.email\nFROM users u\nWHERE EXISTS (\n  SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status='paid'\n);" },
    ],
    quiz: [
      { q: "EXISTS returns:", options: ["The row", "TRUE if any row matches", "COUNT(*)", "First column"], answer: 1 },
      { q: "IN vs EXISTS — for big lists EXISTS often:", options: ["Slower", "Faster", "Same", "Only works on views"], answer: 1 },
      { q: "Correlated subquery references:", options: ["Only itself", "Outer query columns", "System tables", "Other databases"], answer: 1 },
    ],
  },
  {
    slug: "cte",
    title: "Common Table Expressions (CTEs)",
    minutes: 10,
    summary: "Structure complex queries with WITH clauses.",
    sections: [
      { heading: "WITH syntax", body: "`WITH t AS (SELECT ...) SELECT ... FROM t;`. Reads top-down like a script; often clearer than nested subqueries." },
      { heading: "Multiple CTEs", body: "Chain them with commas. Later CTEs can reference earlier ones. Great for building step-by-step reports." },
      { heading: "Materialization", body: "In Postgres, CTEs may be inlined or materialized (`MATERIALIZED` / `NOT MATERIALIZED` hints available in newer versions)." },
    ],
    examples: [
      { language: "sql", code: "WITH recent AS (\n  SELECT * FROM orders WHERE placed_at > NOW() - INTERVAL '30 days'\n), by_user AS (\n  SELECT user_id, SUM(total) AS spent FROM recent GROUP BY user_id\n)\nSELECT u.email, b.spent\nFROM users u JOIN by_user b ON b.user_id = u.id\nORDER BY b.spent DESC;" },
    ],
    quiz: [
      { q: "CTE keyword:", options: ["USING", "WITH", "LET", "DECLARE"], answer: 1 },
      { q: "CTEs help by:", options: ["Adding indexes", "Structuring complex logic", "Enforcing constraints", "Rolling back"], answer: 1 },
      { q: "Multiple CTEs separated by:", options: ["Semicolons", "AND", "Commas", "UNION"], answer: 2 },
    ],
  },
  {
    slug: "window-functions",
    title: "Window Functions",
    minutes: 12,
    summary: "Aggregates without collapsing rows: running totals, ranks, lags.",
    sections: [
      { heading: "OVER clause", body: "`SUM(total) OVER (PARTITION BY user_id ORDER BY placed_at)` gives a per-user running total while keeping every row." },
      { heading: "Ranking", body: "`ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE(n)` for buckets. Perfect for top-N per group with `QUALIFY` or a subquery." },
      { heading: "LAG / LEAD", body: "Access previous/next row values: `LAG(total, 1) OVER (PARTITION BY user_id ORDER BY placed_at)` for period-over-period deltas." },
    ],
    examples: [
      { language: "sql", code: "-- Top 3 orders per user\nSELECT * FROM (\n  SELECT o.*, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY total DESC) AS rn\n  FROM orders o\n) t WHERE rn <= 3;" },
    ],
    quiz: [
      { q: "Window functions:", options: ["Collapse rows", "Return one row per group", "Keep every row", "Only work on views"], answer: 2 },
      { q: "Access previous row value:", options: ["LAG", "LEAD", "PRIOR", "OFFSET"], answer: 0 },
      { q: "Ranking with gaps for ties:", options: ["ROW_NUMBER", "RANK", "DENSE_RANK", "NTILE"], answer: 1 },
    ],
  },
  {
    slug: "indexes",
    title: "Indexes",
    minutes: 12,
    summary: "How indexes speed reads (and slow writes).",
    sections: [
      { heading: "What is an index", body: "A sorted secondary data structure (B-tree by default) that lets the DB find matching rows without scanning the whole table." },
      { heading: "When to add", body: "Columns used in WHERE, JOIN, or ORDER BY on large tables. Composite indexes `(a, b)` are used for `WHERE a = ?` or `WHERE a = ? AND b = ?`, not just `b`." },
      { heading: "Trade-offs", body: "Indexes speed reads but slow INSERT/UPDATE/DELETE. Too many indexes = bloated storage. Measure with `EXPLAIN ANALYZE`." },
      { heading: "Specialized indexes", body: "GIN/GiST for JSON, arrays, full-text; partial indexes: `WHERE active = true`; covering indexes with `INCLUDE`." },
    ],
    examples: [
      { language: "sql", code: "CREATE INDEX orders_user_placed_idx\n  ON orders (user_id, placed_at DESC);\n\nEXPLAIN ANALYZE\n  SELECT * FROM orders WHERE user_id = 42 ORDER BY placed_at DESC LIMIT 20;" },
    ],
    quiz: [
      { q: "Indexes slow which operations?", options: ["SELECT", "INSERT/UPDATE/DELETE", "Both equally", "Only truncate"], answer: 1 },
      { q: "Composite index (a,b) supports WHERE:", options: ["b only", "a only, or a AND b", "Only both", "Neither"], answer: 1 },
      { q: "Inspect query plan with:", options: ["ANALYZE", "EXPLAIN", "PROFILE", "DESCRIBE"], answer: 1 },
    ],
  },
  {
    slug: "constraints-keys",
    title: "Constraints, Primary & Foreign Keys",
    minutes: 8,
    summary: "Enforce integrity at the database layer.",
    sections: [
      { heading: "Why DB-level constraints", body: "Application bugs come and go; DB constraints are the last line of defense against bad data. Cheap, always on." },
      { heading: "Foreign keys", body: "`FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`. Options: CASCADE, SET NULL, RESTRICT, NO ACTION." },
      { heading: "CHECK & UNIQUE", body: "`CHECK (price >= 0)` blocks invalid rows. Composite UNIQUE for natural keys: `UNIQUE (user_id, email)`." },
    ],
    examples: [
      { language: "sql", code: "CREATE TABLE reviews (\n  id BIGSERIAL PRIMARY KEY,\n  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,\n  rating INT CHECK (rating BETWEEN 1 AND 5),\n  UNIQUE (product_id, user_id)\n);" },
    ],
    quiz: [
      { q: "Delete parent, delete children — clause:", options: ["ON DELETE RESTRICT", "ON DELETE CASCADE", "ON DELETE SET DEFAULT", "ON DELETE FAIL"], answer: 1 },
      { q: "Enforce rating range at DB level:", options: ["Trigger only", "CHECK constraint", "Comment", "App logic"], answer: 1 },
      { q: "Constraints improve:", options: ["Speed only", "Data integrity", "UI only", "Nothing"], answer: 1 },
    ],
  },
  {
    slug: "transactions",
    title: "Transactions & ACID",
    minutes: 10,
    summary: "All-or-nothing changes with isolation levels.",
    sections: [
      { heading: "ACID", body: "Atomicity (all or nothing), Consistency (constraints preserved), Isolation (concurrent txns don't corrupt), Durability (committed data survives crashes)." },
      { heading: "BEGIN / COMMIT / ROLLBACK", body: "Wrap related writes; either all persist or none. Roll back on error. Use `SAVEPOINT` for partial rollbacks." },
      { heading: "Isolation levels", body: "READ COMMITTED (Postgres default), REPEATABLE READ, SERIALIZABLE. Higher = safer, slower. Watch for deadlocks and serialization failures — retry with backoff." },
    ],
    examples: [
      { language: "sql", code: "BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;" },
    ],
    quiz: [
      { q: "ACID's I is:", options: ["Indexing", "Integrity", "Isolation", "Identity"], answer: 2 },
      { q: "Default Postgres isolation:", options: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"], answer: 1 },
      { q: "Undo a transaction:", options: ["ROLLBACK", "UNDO", "REVERT", "CANCEL"], answer: 0 },
    ],
  },
  {
    slug: "views",
    title: "Views & Materialized Views",
    minutes: 8,
    summary: "Reusable, named queries — and cached snapshots.",
    sections: [
      { heading: "Views", body: "`CREATE VIEW active_users AS SELECT * FROM users WHERE deleted_at IS NULL;`. Behave like tables in SELECTs. Reduce duplication; enforce permissions." },
      { heading: "Materialized views", body: "Store the result physically for fast reads. Refresh manually: `REFRESH MATERIALIZED VIEW mv;` (Postgres) — great for reports." },
      { heading: "Updatable views", body: "Simple views may be INSERT/UPDATE-able. Complex ones need INSTEAD OF triggers. In practice, prefer explicit tables for writes." },
    ],
    examples: [
      { language: "sql", code: "CREATE MATERIALIZED VIEW daily_revenue AS\nSELECT date_trunc('day', placed_at) AS day, SUM(total) AS revenue\nFROM orders WHERE status='paid'\nGROUP BY 1;" },
    ],
    quiz: [
      { q: "Materialized view stores:", options: ["Only query text", "Cached result rows", "Nothing", "Triggers"], answer: 1 },
      { q: "Refresh a materialized view with:", options: ["UPDATE", "REFRESH MATERIALIZED VIEW", "REBUILD", "TOUCH"], answer: 1 },
      { q: "Views help with:", options: ["Storage", "Reusability & permissions", "Backup", "Sharding"], answer: 1 },
    ],
  },
  {
    slug: "procedures-functions",
    title: "Stored Procedures & Functions",
    minutes: 8,
    summary: "Server-side reusable logic.",
    sections: [
      { heading: "Functions", body: "`CREATE FUNCTION fn(...) RETURNS ... AS $$ ... $$ LANGUAGE sql|plpgsql;`. Return scalars, rows, tables. Called from SELECT." },
      { heading: "Procedures", body: "Postgres 11+ `CREATE PROCEDURE ...` supports transactions inside (COMMIT/ROLLBACK). Called with `CALL name(...)`." },
      { heading: "When to use", body: "Encapsulate multi-statement logic tightly bound to data. Beware — hard to version compared to app code." },
    ],
    examples: [
      { language: "sql", code: "CREATE OR REPLACE FUNCTION full_name(p profiles) RETURNS text\n  LANGUAGE sql IMMUTABLE\nAS $$ SELECT p.first_name || ' ' || p.last_name $$;\n\nSELECT full_name(p) FROM profiles p LIMIT 5;" },
    ],
    quiz: [
      { q: "Call a procedure:", options: ["SELECT", "CALL", "RUN", "DO"], answer: 1 },
      { q: "Language for procedural code in Postgres:", options: ["JS", "plpgsql", "csharp", "bash"], answer: 1 },
      { q: "Functions returning many rows use RETURNS:", options: ["SCALAR", "TABLE(...)", "SET", "MULTI"], answer: 1 },
    ],
  },
  {
    slug: "triggers",
    title: "Triggers",
    minutes: 8,
    summary: "Run code automatically on INSERT/UPDATE/DELETE.",
    sections: [
      { heading: "Trigger anatomy", body: "A trigger fires BEFORE or AFTER an event on a table, per row or per statement. It calls a trigger function." },
      { heading: "Common uses", body: "Auto-update `updated_at`, audit history, enforce complex invariants, denormalize. Avoid heavy business logic in triggers." },
      { heading: "Pitfalls", body: "Triggers can hide behavior and hurt performance. Document them; test carefully. Consider generated columns or app code where possible." },
    ],
    examples: [
      { language: "sql", code: "CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$\nBEGIN NEW.updated_at = now(); RETURN NEW; END;\n$$ LANGUAGE plpgsql;\n\nCREATE TRIGGER users_updated\n  BEFORE UPDATE ON users\n  FOR EACH ROW EXECUTE FUNCTION set_updated_at();" },
    ],
    quiz: [
      { q: "Trigger fires on:", options: ["SELECT", "DDL only", "INSERT/UPDATE/DELETE", "Backups"], answer: 2 },
      { q: "Timing options include:", options: ["ONLY", "BEFORE / AFTER", "MID", "PRE"], answer: 1 },
      { q: "Best practice with triggers:", options: ["Put all logic there", "Use sparingly, document", "Never use", "Only DDL"], answer: 1 },
    ],
  },
  {
    slug: "normalization",
    title: "Normalization & Data Modeling",
    minutes: 10,
    summary: "1NF/2NF/3NF, denormalization trade-offs, and choosing keys.",
    sections: [
      { heading: "Normal forms", body: "1NF: atomic columns. 2NF: no partial dependency on composite key. 3NF: no transitive dependencies. Aim for 3NF by default." },
      { heading: "When to denormalize", body: "Read-heavy analytics, caches, materialized views. Trade write complexity for read speed. Keep the source of truth normalized." },
      { heading: "Choosing keys", body: "Prefer surrogate keys (UUID, BIGSERIAL) for stability; add UNIQUE on natural business keys. Composite keys are fine for join tables." },
    ],
    examples: [
      { language: "sql", code: "-- Bad (repeats city per user):\n-- users(id, name, city_id, city_name, city_country)\n-- Better (3NF):\nCREATE TABLE cities (id BIGSERIAL PRIMARY KEY, name TEXT, country TEXT);\nCREATE TABLE users (id BIGSERIAL PRIMARY KEY, name TEXT, city_id BIGINT REFERENCES cities);" },
    ],
    quiz: [
      { q: "1NF requires:", options: ["No transitive deps", "Atomic column values", "No composite keys", "No joins"], answer: 1 },
      { q: "Denormalization trades:", options: ["Nothing", "Write complexity for read speed", "Read speed for write speed", "Both slow"], answer: 1 },
      { q: "3NF removes:", options: ["Duplicates only", "Transitive dependencies", "Nulls", "Joins"], answer: 1 },
    ],
  },
  {
    slug: "performance-explain",
    title: "Performance & EXPLAIN",
    minutes: 12,
    summary: "Read query plans, spot Seq Scans, and add the right index.",
    sections: [
      { heading: "EXPLAIN vs EXPLAIN ANALYZE", body: "`EXPLAIN` shows the plan; `EXPLAIN ANALYZE` runs the query and shows real timings and row counts. Compare estimated vs actual to spot bad stats." },
      { heading: "Common bad patterns", body: "Sequential scans on huge tables, nested loops with millions of rows, sorting without indexes, functions on indexed columns disabling index use (`WHERE lower(email) = ...` requires a functional index)." },
      { heading: "Fixes", body: "Add matching indexes, rewrite queries, `VACUUM ANALYZE` to refresh stats, use `LIMIT` early, avoid `SELECT *`, break work into CTEs when it helps." },
    ],
    examples: [
      { language: "sql", code: "EXPLAIN ANALYZE\nSELECT u.email\nFROM users u\nJOIN orders o ON o.user_id = u.id\nWHERE u.country = 'IN' AND o.status='paid';" },
    ],
    quiz: [
      { q: "Show real runtime metrics:", options: ["EXPLAIN", "EXPLAIN ANALYZE", "SHOW PLAN", "PROFILE"], answer: 1 },
      { q: "Function on indexed column typically:", options: ["Uses the index", "Prevents index use", "Speeds it up", "Locks the table"], answer: 1 },
      { q: "Refresh planner statistics with:", options: ["REINDEX", "VACUUM ANALYZE", "TRUNCATE", "CLUSTER"], answer: 1 },
    ],
  },
  {
    slug: "real-world-patterns",
    title: "Real-world Query Patterns",
    minutes: 12,
    summary: "Upserts, running totals, top-N per group, gaps & islands.",
    sections: [
      { heading: "Top-N per group", body: "Use `ROW_NUMBER() OVER (PARTITION BY g ORDER BY x DESC)` and filter `rn <= n`. Cleaner than correlated subqueries." },
      { heading: "Running totals", body: "`SUM(x) OVER (PARTITION BY g ORDER BY t)`. Excellent for cumulative charts." },
      { heading: "Gaps & islands", body: "Detect consecutive runs using row_number differences. Common interview problem." },
      { heading: "Pivoting", body: "Postgres `crosstab` extension or `FILTER (WHERE …)` with aggregates to reshape rows into columns." },
    ],
    examples: [
      { language: "sql", code: "-- Monthly revenue with rolling 3-month average\nWITH m AS (\n  SELECT date_trunc('month', placed_at) AS mo, SUM(total) AS rev\n  FROM orders WHERE status='paid' GROUP BY 1\n)\nSELECT mo, rev,\n  AVG(rev) OVER (ORDER BY mo ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS rolling_3m\nFROM m ORDER BY mo;" },
    ],
    quiz: [
      { q: "Top-N per group typically uses:", options: ["ROW_NUMBER + partition", "LIMIT per row", "DISTINCT ON always", "Subquery per row"], answer: 0 },
      { q: "Running total window frame default:", options: ["ROWS UNBOUNDED FOLLOWING", "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW (with ORDER BY)", "Empty", "None"], answer: 1 },
      { q: "Pivot without extensions using:", options: ["FILTER + GROUP BY", "CROSS JOIN", "LATERAL only", "MATCH"], answer: 0 },
    ],
  },
];

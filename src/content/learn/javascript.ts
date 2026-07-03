import type { Lesson } from "./types";

export const javascriptLessons: Lesson[] = [
  {
    slug: "intro-and-running-js",
    title: "Intro to JavaScript",
    minutes: 8,
    summary: "The language of the web: history, runtimes, and how to run code.",
    sections: [
      { heading: "What is JS", body: "JavaScript is a high-level, dynamic, single-threaded language born in browsers and now everywhere: servers (Node/Deno/Bun), mobile (React Native), desktop (Electron). The formal spec is ECMAScript." },
      { heading: "Runtimes", body: "Browsers ship a JS engine (V8, SpiderMonkey, JavaScriptCore). Node.js runs V8 outside the browser. Bun and Deno are modern alternatives with built-in TypeScript." },
      { heading: "How to run", body: "Browser console (DevTools) for quick tests. Node: `node file.js`. Modern projects use ES modules (`.mjs` or `\"type\": \"module\"` in package.json)." },
    ],
    examples: [
      { language: "js", code: "// hello.js\nconst name = 'world';\nconsole.log(`Hello, ${name}!`);" },
    ],
    quiz: [
      { q: "Formal name of the language spec:", options: ["EcmaScript", "ECMAScript", "JScript", "V8Script"], answer: 1 },
      { q: "Node runs on engine:", options: ["V8", "Chakra", "SpiderMonkey", "Nashorn"], answer: 0 },
      { q: "Modern module syntax uses:", options: ["require()", "import/export", "include", "using"], answer: 1 },
    ],
  },
  {
    slug: "variables",
    title: "Variables: var, let & const",
    minutes: 8,
    summary: "Why let/const replaced var and how block scoping works.",
    sections: [
      { heading: "let & const", body: "`const` for values that shouldn't be reassigned (but object contents can still change). `let` for mutable bindings. Both are block-scoped." },
      { heading: "var pitfalls", body: "`var` is function-scoped and hoisted with an `undefined` value — a classic source of bugs. Don't use it in new code." },
      { heading: "Temporal Dead Zone", body: "`let` and `const` are hoisted but not initialized. Accessing them before declaration throws `ReferenceError`." },
    ],
    examples: [
      { language: "js", code: "const user = { name: 'Ada' };\nuser.name = 'Grace';   // OK — contents mutable\n// user = {};          // TypeError — binding is const\n\nfor (let i = 0; i < 3; i++) setTimeout(() => console.log(i));   // 0 1 2\nfor (var j = 0; j < 3; j++) setTimeout(() => console.log(j));   // 3 3 3" },
    ],
    quiz: [
      { q: "Which is block-scoped?", options: ["var", "let", "function", "global"], answer: 1 },
      { q: "const prevents:", options: ["Object mutation", "Rebinding the name", "Both", "Neither"], answer: 1 },
      { q: "TDZ affects:", options: ["var only", "let / const", "function decls", "hoisting nothing"], answer: 1 },
    ],
  },
  {
    slug: "types-and-coercion",
    title: "Types & Coercion",
    minutes: 10,
    summary: "Primitives, objects, == vs ===, and truthiness.",
    sections: [
      { heading: "Primitive types", body: "`string`, `number`, `bigint`, `boolean`, `undefined`, `null`, `symbol`. Everything else is an object (arrays, functions, dates)." },
      { heading: "== vs ===", body: "`==` performs coercion (surprises abound: `[] == false` is true). Always prefer `===` and `!==`." },
      { heading: "Falsy values", body: "`false, 0, -0, 0n, '', null, undefined, NaN`. Everything else is truthy — including `'0'` and `[]`." },
    ],
    examples: [
      { language: "js", code: "console.log(typeof 'x', typeof 42, typeof null);    // string number object\nconsole.log(1 == '1');    // true (coercion)\nconsole.log(1 === '1');   // false\nconsole.log(Boolean(''), Boolean('0'));  // false true" },
    ],
    quiz: [
      { q: "typeof null returns:", options: ["'null'", "'object'", "'undefined'", "'nothing'"], answer: 1, explain: "A famous historical bug preserved for compatibility." },
      { q: "Prefer for equality:", options: ["==", "===", "!==", "eq()"], answer: 1 },
      { q: "Which is truthy?", options: ["0", "''", "'0'", "NaN"], answer: 2 },
    ],
  },
  {
    slug: "strings",
    title: "Strings & Template Literals",
    minutes: 8,
    summary: "Immutable text, interpolation, and the essential methods.",
    sections: [
      { heading: "Creation", body: "Single or double quotes. Prefer template literals (backticks) for interpolation and multiline strings: `` `Hello, ${name}` ``." },
      { heading: "Methods", body: "`.length`, `.slice`, `.substring`, `.toUpperCase`, `.toLowerCase`, `.trim`, `.replace`, `.split`, `.includes`, `.startsWith`. All non-mutating." },
      { heading: "Tagged templates", body: "Functions can receive template pieces: `tag`x=${x}`` — used by libraries like styled-components and SQL taggers to safely embed values." },
    ],
    examples: [
      { language: "js", code: "const name = 'Ada';\nconst msg = `Hi ${name.toUpperCase()}, welcome!`;\nconsole.log(msg.split(' ').length);   // 3" },
    ],
    quiz: [
      { q: "Best for interpolation:", options: ["+", "concat()", "Template literals", "sprintf"], answer: 2 },
      { q: "Strings are:", options: ["Mutable", "Immutable", "Objects always", "Byte arrays"], answer: 1 },
      { q: "Check for substring:", options: ["str.contains(x)", "str.includes(x)", "str.has(x)", "str.find(x)"], answer: 1 },
    ],
  },
  {
    slug: "numbers-and-math",
    title: "Numbers, Math & BigInt",
    minutes: 8,
    summary: "IEEE-754 quirks, useful Math methods, and BigInt for huge integers.",
    sections: [
      { heading: "One number type", body: "All numbers are 64-bit floats. `0.1 + 0.2 !== 0.3`. For money use minor units (cents) or a decimal library." },
      { heading: "Math", body: "`Math.floor`, `Math.round`, `Math.random`, `Math.max`, `Math.pow` (or `**`). `Number.parseInt/parseFloat` beat their global versions." },
      { heading: "BigInt", body: "For integers above 2^53 use `10n`. Can't mix with `number` without conversion." },
    ],
    examples: [
      { language: "js", code: "console.log(0.1 + 0.2);              // 0.30000000000000004\nconsole.log((0.1 + 0.2).toFixed(2)); // '0.30'\nconst big = 2n ** 100n;\nconsole.log(big.toString());" },
    ],
    quiz: [
      { q: "Integer above 2^53 safely uses:", options: ["Number", "BigInt", "String", "Array"], answer: 1 },
      { q: "0.1+0.2 === 0.3 is:", options: ["true", "false", "NaN", "Error"], answer: 1 },
      { q: "Exponent operator:", options: ["^", "**", "//", "%%"], answer: 1 },
    ],
  },
  {
    slug: "arrays",
    title: "Arrays",
    minutes: 12,
    summary: "Ordered lists and the modern array methods everyone uses.",
    sections: [
      { heading: "Basics", body: "`const xs = [1,2,3]`. Arrays are objects with numeric indices and `.length`. Add/remove at either end with `push/pop/shift/unshift`." },
      { heading: "Mutating vs non-mutating", body: "`sort/reverse/splice` mutate. `map/filter/reduce/slice/concat/flat` return new arrays. Prefer non-mutating in React/Redux." },
      { heading: "Iterating", body: "`for...of` for values, `forEach` for side-effects, `map` to transform. Use `Array.from(iter)` to materialize iterables." },
    ],
    examples: [
      { language: "js", code: "const nums = [4, 1, 5, 2];\nconst sorted = [...nums].sort((a,b) => a-b);\nconsole.log(sorted);        // [1,2,4,5]\nconsole.log(nums);          // [4,1,5,2] — original unchanged" },
    ],
    quiz: [
      { q: "Non-mutating sort:", options: [".sort()", "[...arr].sort()", "sort(arr)", "arr.stableSort()"], answer: 1 },
      { q: "Add to the end:", options: ["push", "shift", "unshift", "add"], answer: 0 },
      { q: "map / filter return:", options: ["undefined", "New array", "Mutated original", "Iterator"], answer: 1 },
    ],
  },
  {
    slug: "objects",
    title: "Objects",
    minutes: 10,
    summary: "Key-value maps, property access, and common operations.",
    sections: [
      { heading: "Creation & access", body: "`const u = { name: 'Ada', age: 36 }`. Dot access or `u['name']`. Shorthand: `{ name, age }` for `{ name: name, age: age }`." },
      { heading: "Common operations", body: "`Object.keys/values/entries`, `Object.assign({}, a, b)`, spread `{ ...a, ...b }`, destructuring `const { name } = u`." },
      { heading: "Prefer Map for dynamic keys", body: "Plain objects are fine for records but keys are always strings/symbols. Use `Map` when keys can be arbitrary and iteration order matters." },
    ],
    examples: [
      { language: "js", code: "const u = { name: 'Ada', age: 36 };\nconst updated = { ...u, age: 37 };\nfor (const [k, v] of Object.entries(updated)) console.log(k, v);" },
    ],
    quiz: [
      { q: "Merge two objects, right-wins:", options: ["Object.merge", "{...a,...b}", "assign(a,b)", "concat(a,b)"], answer: 1 },
      { q: "Iterate key/value pairs:", options: ["Object.keys", "Object.entries", "for...in only", "for...of directly"], answer: 1 },
      { q: "Preferred for arbitrary keys:", options: ["Plain object", "Map", "Array", "Set"], answer: 1 },
    ],
  },
  {
    slug: "control-flow",
    title: "Control Flow",
    minutes: 8,
    summary: "if/else, switch, ternary, and nullish operators.",
    sections: [
      { heading: "Conditionals", body: "`if / else if / else`. `switch` with `break` (fall-through by accident is a common bug). Ternary `cond ? a : b` for concise expressions." },
      { heading: "Nullish operators", body: "`??` returns right side only when left is `null`/`undefined` (not `0` or `''`). `?.` optional chaining short-circuits when a value is nullish." },
    ],
    examples: [
      { language: "js", code: "const name = user?.profile?.name ?? 'Anonymous';\nconst grade = score >= 90 ? 'A' : score >= 75 ? 'B' : 'C';" },
    ],
    quiz: [
      { q: "?? differs from || because:", options: ["Same thing", "?? treats 0/'' as valid", "|| ignores null", "|| is stricter"], answer: 1 },
      { q: "Prevent 'undefined' errors reading nested prop:", options: [".", "?.", "??", "!."], answer: 1 },
      { q: "Switch cases without break cause:", options: ["Warning", "Fall-through", "Error", "Restart"], answer: 1 },
    ],
  },
  {
    slug: "loops",
    title: "Loops",
    minutes: 8,
    summary: "for, for...of, for...in and when to reach for array methods instead.",
    sections: [
      { heading: "for", body: "Classic `for (let i = 0; i < n; i++)`. Fastest when you need explicit index control." },
      { heading: "for...of vs for...in", body: "`for (const x of iterable)` iterates values (arrays, strings, Maps, Sets). `for...in` iterates enumerable string keys — mostly for plain objects and rarely the right choice." },
      { heading: "Prefer functional", body: "For transformations reach for `map`, `filter`, `reduce`, `some`, `every`, `find`. More declarative, easier to reason about." },
    ],
    examples: [
      { language: "js", code: "const nums = [1,2,3];\nfor (const n of nums) console.log(n);\nconst doubled = nums.map(n => n * 2);" },
    ],
    quiz: [
      { q: "Iterate array values:", options: ["for...in", "for...of", "for-each-key", "loop"], answer: 1 },
      { q: "for...in on arrays is:", options: ["Recommended", "Discouraged", "Error", "Same as for...of"], answer: 1 },
      { q: "Preferred for transformation:", options: ["for", "map", "for...in", "while"], answer: 1 },
    ],
  },
  {
    slug: "functions",
    title: "Functions & Arrow Functions",
    minutes: 12,
    summary: "Declarations, expressions, arrows, and the `this` differences.",
    sections: [
      { heading: "Three forms", body: "Declaration: `function f(){}` — hoisted. Expression: `const f = function(){}`. Arrow: `const f = () => {}` — concise, no own `this`, no `arguments`." },
      { heading: "Default & rest params", body: "`function greet(name = 'world', ...tags) {}`. Rest gathers extra args as an array; spread `...` deals arrays into positional args." },
      { heading: "Arrow gotcha", body: "Arrows don't bind their own `this` — inside a class method or object literal, use regular functions if you need `this` to refer to the caller." },
    ],
    examples: [
      { language: "js", code: "const add = (a, b = 0) => a + b;\nconst sum = (...nums) => nums.reduce((s, n) => s + n, 0);\nconsole.log(sum(1,2,3,4));  // 10" },
    ],
    quiz: [
      { q: "Arrow functions bind their own this:", options: ["Always", "Never", "Only in strict", "Only in class"], answer: 1 },
      { q: "Gather extra args:", options: ["*args", "...args", "arguments only", "params"], answer: 1 },
      { q: "Which is hoisted?", options: ["Arrow", "Function expression", "Function declaration", "Class"], answer: 2 },
    ],
  },
  {
    slug: "scope-hoisting-closures",
    title: "Scope, Hoisting & Closures",
    minutes: 12,
    summary: "How the engine resolves names — and why closures are everywhere.",
    sections: [
      { heading: "Scope chain", body: "Function scope (var, function decls) and block scope (let/const, {}). Names looked up outward through lexical scopes." },
      { heading: "Hoisting", body: "Declarations are conceptually moved to the top. `function` fully hoisted; `var` hoisted as `undefined`; `let/const` hoisted but in TDZ until declaration line." },
      { heading: "Closures", body: "A function 'closes over' variables from its defining scope. Powers privacy, currying, memoization, event handlers, and React hooks like `useState`." },
    ],
    examples: [
      { language: "js", code: "function counter() {\n  let n = 0;\n  return { inc: () => ++n, get: () => n };\n}\nconst c = counter();\nc.inc(); c.inc();\nconsole.log(c.get());  // 2" },
    ],
    quiz: [
      { q: "Closure captures variables from:", options: ["Global only", "Lexical scope where defined", "Call site", "Prototype chain"], answer: 1 },
      { q: "let is:", options: ["Not hoisted", "Hoisted but in TDZ", "Hoisted to undefined", "Function-scoped"], answer: 1 },
      { q: "Function declarations are:", options: ["Not hoisted", "Fully hoisted", "TDZ", "Only in modules"], answer: 1 },
    ],
  },
  {
    slug: "destructuring-spread",
    title: "Destructuring & Spread",
    minutes: 8,
    summary: "Unpack values from arrays/objects and spread them again.",
    sections: [
      { heading: "Object destructuring", body: "`const { name, age = 18 } = user;`. Rename: `const { name: n } = user;`. Rest: `const { id, ...rest } = user;`." },
      { heading: "Array destructuring", body: "`const [first, second, ...rest] = arr;`. Skip with commas: `const [, , third] = arr;`." },
      { heading: "Spread", body: "Clone/merge arrays and objects: `[...a, ...b]`, `{ ...a, ...b }`. Also to spread args: `fn(...args)`." },
    ],
    examples: [
      { language: "js", code: "const user = { id: 1, name: 'Ada', role: 'admin' };\nconst { name, ...rest } = user;\nconst updated = { ...user, role: 'owner' };\nconsole.log(name, rest, updated);" },
    ],
    quiz: [
      { q: "Rename during destructuring:", options: ["{a:b}", "{a as b}", "{a=b}", "{a.b}"], answer: 0 },
      { q: "Spread on array clones:", options: ["Shallow", "Deep", "No effect", "Errors"], answer: 0 },
      { q: "Rest in destructuring uses:", options: [",,,", "!!!", "...", "%%%"], answer: 2 },
    ],
  },
  {
    slug: "array-methods",
    title: "Array Methods: map, filter, reduce",
    minutes: 12,
    summary: "The functional trio powering modern data pipelines.",
    sections: [
      { heading: "map", body: "Transform each element into a new one. Same length output. `[1,2,3].map(x => x*2)` → `[2,4,6]`." },
      { heading: "filter", body: "Keep only elements passing a predicate. Same or shorter output." },
      { heading: "reduce", body: "Fold to a single value with an accumulator: `nums.reduce((sum, n) => sum + n, 0)`. Powerful — use sparingly for readability." },
      { heading: "Others", body: "`find`, `findIndex`, `some`, `every`, `flatMap`, `Object.fromEntries` for converting to objects." },
    ],
    examples: [
      { language: "js", code: "const orders = [{p:'a',qty:2,price:5},{p:'b',qty:1,price:10}];\nconst total = orders\n  .map(o => o.qty * o.price)\n  .filter(x => x > 0)\n  .reduce((s, x) => s + x, 0);\nconsole.log(total);   // 20" },
    ],
    quiz: [
      { q: "reduce needs an accumulator seed usually:", options: ["Never", "Only for numbers", "Yes to avoid empty-array bug", "Only for objects"], answer: 2 },
      { q: "filter output length:", options: ["Always same", "Same or shorter", "Longer possible", "Always 0"], answer: 1 },
      { q: "flatMap ≡:", options: ["map + flat(1)", "reduce + push", "filter + flat", "concat all"], answer: 0 },
    ],
  },
  {
    slug: "classes-and-prototypes",
    title: "Classes & Prototypes",
    minutes: 12,
    summary: "OOP in JS: class syntax over prototypal inheritance.",
    sections: [
      { heading: "Class basics", body: "`class Book { constructor(title){ this.title=title } read(){ } }`. Instances share methods via the prototype chain." },
      { heading: "Inheritance", body: "`class Novel extends Book {}` with `super(...)` calling parent constructor. Prefer composition when hierarchies deepen." },
      { heading: "Prototypes", body: "Under the hood every object has a `[[Prototype]]` chain. Class methods live on `Book.prototype`. Understand it before you meet `Object.create` or fix a legacy codebase." },
      { heading: "Static & private", body: "`static create() {}`, `#password` for private fields (2022+). Getters/setters via `get`/`set`." },
    ],
    examples: [
      { language: "js", code: "class User {\n  #password;\n  constructor(name, password) { this.name = name; this.#password = password; }\n  check(p) { return p === this.#password; }\n  static admin() { return new User('root', 'secret'); }\n}\nconsole.log(User.admin().check('secret'));" },
    ],
    quiz: [
      { q: "Class private fields use:", options: ["_field", "#field", "$field", "private field"], answer: 1 },
      { q: "Static methods called on:", options: ["Instances", "The class itself", "Both", "Prototype only"], answer: 1 },
      { q: "extends triggers:", options: ["No prototype link", "Prototype chain to parent", "Copy of parent", "Interface merge"], answer: 1 },
    ],
  },
  {
    slug: "modules",
    title: "ES Modules",
    minutes: 8,
    summary: "import/export, default vs named, and module scope.",
    sections: [
      { heading: "export syntax", body: "Named: `export const x = 1;` / `export function f(){}`. Default (one per file): `export default class ...`. Re-export: `export * from './x';`." },
      { heading: "import syntax", body: "`import { x, f } from './util.js'`, `import Foo from './foo.js'`. Dynamic: `const m = await import('./mod.js');` for code splitting." },
      { heading: "Module semantics", body: "Modules are singletons, strict mode by default, top-level `await` allowed. Top-level variables are file-scoped, not global." },
    ],
    examples: [
      { language: "js", code: "// math.js\nexport const PI = 3.14159;\nexport function circleArea(r) { return PI * r * r; }\n\n// app.js\nimport { PI, circleArea } from './math.js';\nconsole.log(circleArea(2), PI);" },
    ],
    quiz: [
      { q: "How many default exports per file:", options: ["Any", "One", "Two", "None"], answer: 1 },
      { q: "Dynamic import returns:", options: ["Value", "Promise", "Array", "String"], answer: 1 },
      { q: "Top-level await allowed in:", options: ["Scripts", "CommonJS", "ES modules", "Nowhere"], answer: 2 },
    ],
  },
  {
    slug: "promises-async",
    title: "Promises & async/await",
    minutes: 15,
    summary: "Asynchronous JS the modern way.",
    sections: [
      { heading: "Promises", body: "A promise represents an eventual value: `pending → fulfilled | rejected`. Handle with `.then/.catch/.finally`. Never nest — chain or use await." },
      { heading: "async / await", body: "`async` functions return promises; `await` pauses until a promise settles. Wrap in `try/catch` for errors. Cleaner than long `.then` chains." },
      { heading: "Combinators", body: "`Promise.all([p1, p2])` — parallel, fails on first reject. `Promise.allSettled` — always resolves. `Promise.race` — first settled. `Promise.any` — first fulfilled." },
    ],
    examples: [
      { language: "js", code: "async function loadUser(id) {\n  const [profile, orders] = await Promise.all([\n    fetch(`/api/users/${id}`).then(r => r.json()),\n    fetch(`/api/users/${id}/orders`).then(r => r.json()),\n  ]);\n  return { profile, orders };\n}" },
    ],
    quiz: [
      { q: "await Promise.all fails when:", options: ["All reject", "Any rejects", "First resolves", "Never"], answer: 1 },
      { q: "async fn always returns:", options: ["Value", "Promise", "Iterator", "Undefined"], answer: 1 },
      { q: "Handle errors in async/await with:", options: [".catch only", "try/catch", "onerror", "throwif"], answer: 1 },
    ],
  },
  {
    slug: "fetch-and-apis",
    title: "fetch & REST APIs",
    minutes: 12,
    summary: "Talk to HTTP APIs from browser and Node.",
    sections: [
      { heading: "fetch basics", body: "`fetch(url)` returns a Response. `await r.json()`, `await r.text()`. Check `r.ok` / `r.status` — fetch only rejects on network errors, not HTTP status." },
      { heading: "Options", body: "`fetch(url, { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify(data) })`. AbortController lets you cancel requests." },
      { heading: "CORS", body: "The browser enforces same-origin unless the server sends CORS headers. Preflight OPTIONS requests fire for non-simple methods/headers." },
    ],
    examples: [
      { language: "js", code: "const controller = new AbortController();\nconst t = setTimeout(() => controller.abort(), 5000);\ntry {\n  const r = await fetch('/api/data', { signal: controller.signal });\n  if (!r.ok) throw new Error(`HTTP ${r.status}`);\n  const data = await r.json();\n  console.log(data);\n} finally { clearTimeout(t); }" },
    ],
    quiz: [
      { q: "fetch rejects on 500:", options: ["Yes", "No — only network errors", "Only if body missing", "Depends on browser"], answer: 1 },
      { q: "Cancel a fetch:", options: ["clearTimeout", "AbortController.abort()", "throw", "reject"], answer: 1 },
      { q: "CORS is enforced by:", options: ["Server", "Client browser", "OS", "Router"], answer: 1 },
    ],
  },
  {
    slug: "dom",
    title: "DOM Basics",
    minutes: 10,
    summary: "Query, create, and modify HTML from JS.",
    sections: [
      { heading: "Selecting", body: "`document.getElementById`, `document.querySelector` / `querySelectorAll`. `querySelector` uses any CSS selector." },
      { heading: "Modifying", body: "`el.textContent`, `el.innerHTML` (careful — XSS risk), `el.classList.add/remove/toggle`, `el.setAttribute`, `el.style.color`." },
      { heading: "Creating", body: "`document.createElement('div')`, set properties, append with `parent.append(child)`. Prefer `textContent` over `innerHTML` for user data." },
    ],
    examples: [
      { language: "js", code: "const list = document.querySelector('#todos');\n['Buy milk','Ship v1'].forEach(text => {\n  const li = document.createElement('li');\n  li.textContent = text;\n  list.append(li);\n});" },
    ],
    quiz: [
      { q: "XSS-safer property:", options: ["innerHTML", "textContent", "outerHTML", "setHTML"], answer: 1 },
      { q: "Add a class:", options: ["el.class='x'", "el.classList.add('x')", "el.addClass('x')", "el.setClass('x')"], answer: 1 },
      { q: "Select many elements:", options: ["querySelector", "querySelectorAll", "getElement", "select()"], answer: 1 },
    ],
  },
  {
    slug: "events",
    title: "Events & Delegation",
    minutes: 10,
    summary: "Listen, bubble, capture, and delegate.",
    sections: [
      { heading: "addEventListener", body: "`el.addEventListener('click', handler, { once, passive, capture })`. Prefer over `onclick` — you can attach multiple listeners." },
      { heading: "Bubble & capture", body: "Events fire top-down (capture) then bubble up. Stop with `e.stopPropagation()`. Prevent default action (link nav, form submit) with `e.preventDefault()`." },
      { heading: "Delegation", body: "Attach one listener to a parent, use `e.target` and `.closest(selector)` to handle many children — faster and works for elements added later." },
    ],
    examples: [
      { language: "js", code: "document.querySelector('#list').addEventListener('click', (e) => {\n  const btn = e.target.closest('button[data-id]');\n  if (btn) console.log('delete', btn.dataset.id);\n});" },
    ],
    quiz: [
      { q: "Prevent default browser action:", options: ["stopPropagation()", "preventDefault()", "returnFalse()", "cancel()"], answer: 1 },
      { q: "Handle many children with one listener:", options: ["Attach on each", "Delegation", "Poll", "onclick attribute"], answer: 1 },
      { q: "Passive listeners promise:", options: ["No preventDefault", "Higher priority", "Always sync", "Delayed"], answer: 0 },
    ],
  },
  {
    slug: "error-handling",
    title: "Errors & Error Handling",
    minutes: 8,
    summary: "throw, try/catch, custom errors, and rejection tracking.",
    sections: [
      { heading: "throw & catch", body: "Throw any value — always throw `Error` instances so stack traces work. `try/catch/finally` handles sync and async (with await)." },
      { heading: "Custom errors", body: "Subclass `Error`: `class NotFoundError extends Error { constructor(msg){ super(msg); this.name='NotFoundError'; }}`." },
      { heading: "Unhandled rejections", body: "Unhandled `Promise` rejections crash Node and log warnings in browsers. Always add `.catch` on top-level promises or use await in try/catch." },
    ],
    examples: [
      { language: "js", code: "class ValidationError extends Error {}\nfunction parseAge(x) {\n  const n = Number(x);\n  if (!Number.isFinite(n) || n < 0) throw new ValidationError('bad age');\n  return n;\n}\ntry { parseAge('abc'); }\ncatch (e) { if (e instanceof ValidationError) console.warn(e.message); else throw e; }" },
    ],
    quiz: [
      { q: "Best value to throw:", options: ["String", "Number", "Error instance", "Object literal"], answer: 2 },
      { q: "Detect custom error type:", options: ["typeof e", "e instanceof", "e.name only", "==="], answer: 1 },
      { q: "finally runs:", options: ["Only on error", "Only success", "Always", "Only if returned"], answer: 2 },
    ],
  },
  {
    slug: "regex",
    title: "Regex Essentials",
    minutes: 10,
    summary: "Enough regex to be useful without going wild.",
    sections: [
      { heading: "Syntax", body: "`/pattern/flags`. Flags: `g` global, `i` case-insensitive, `m` multiline, `s` dot-all, `u` unicode. Anchors: `^` start, `$` end." },
      { heading: "Character classes", body: "`\\d` digit, `\\w` word char, `\\s` whitespace, `[a-z]` range, `[^a-z]` negation, `.` any char except newline (unless `s`)." },
      { heading: "Groups", body: "`(abc)` capture, `(?:abc)` non-capture, `(?<name>abc)` named. Use `match.groups.name`. Quantifiers: `*`, `+`, `?`, `{n}`, `{n,m}` — add `?` for lazy." },
    ],
    examples: [
      { language: "js", code: "const re = /(?<user>[^@\\s]+)@(?<domain>[^@\\s]+)/i;\nconst m = 'Ada@Example.com'.match(re);\nconsole.log(m.groups);   // { user: 'Ada', domain: 'Example.com' }" },
    ],
    quiz: [
      { q: "Case-insensitive flag:", options: ["c", "i", "g", "u"], answer: 1 },
      { q: "Non-capturing group:", options: ["(abc)", "(?:abc)", "(?=abc)", "[abc]"], answer: 1 },
      { q: "Digit class:", options: ["\\n", "\\d", "\\w", "\\s"], answer: 1 },
    ],
  },
  {
    slug: "iterators-generators",
    title: "Iterators & Generators",
    minutes: 10,
    summary: "Lazy sequences with function*/yield.",
    sections: [
      { heading: "Iterables", body: "Any object with a `[Symbol.iterator]()` method returning `{ next(): {value, done} }`. Arrays, strings, Maps, Sets are iterable." },
      { heading: "Generators", body: "`function* gen() { yield 1; yield 2; }`. Each `yield` pauses; consumer calls `.next()` or spreads with `for...of`. Great for infinite or lazy streams." },
      { heading: "Async generators", body: "`async function* stream() { yield await fetch(...); }` combined with `for await (const x of stream())`." },
    ],
    examples: [
      { language: "js", code: "function* range(start, end, step = 1) {\n  for (let i = start; i < end; i += step) yield i;\n}\nfor (const n of range(0, 5)) console.log(n);  // 0 1 2 3 4" },
    ],
    quiz: [
      { q: "Generator keyword:", options: ["gen", "function*", "async", "yield*"], answer: 1 },
      { q: "for...of works on:", options: ["Any object", "Iterables only", "Arrays only", "Numbers"], answer: 1 },
      { q: "Async iteration uses:", options: ["for of", "for await of", "forEach await", "await for"], answer: 1 },
    ],
  },
  {
    slug: "symbols-maps-sets",
    title: "Symbols, Maps & Sets",
    minutes: 10,
    summary: "Beyond plain objects: better collections and hidden keys.",
    sections: [
      { heading: "Map", body: "Ordered key/value where keys can be anything, size in O(1) via `.size`. Iterates in insertion order. `get/set/has/delete/entries`." },
      { heading: "Set", body: "Unique values, O(1) `.has`. Perfect for deduplication: `[...new Set(arr)]`." },
      { heading: "Symbol", body: "Unique, immutable primitive often used as non-colliding object keys (`obj[Symbol('id')]`). Well-known symbols hook into language features: `Symbol.iterator`, `Symbol.asyncIterator`." },
      { heading: "WeakMap / WeakSet", body: "Keys are held weakly — GC'd when no other references remain. Useful for private data, caches keyed by object." },
    ],
    examples: [
      { language: "js", code: "const seen = new Set();\nfor (const x of [1,2,2,3,3,3]) if (!seen.has(x)) { console.log(x); seen.add(x); }" },
    ],
    quiz: [
      { q: "Preserve unique values:", options: ["Array", "Object", "Set", "Map"], answer: 2 },
      { q: "Weak collections allow:", options: ["Auto GC of unreferenced keys", "Faster iteration", "Frozen keys", "Encryption"], answer: 0 },
      { q: "Symbol values are:", options: ["Interchangeable", "Always unique", "Serializable to JSON", "Numbers"], answer: 1 },
    ],
  },
  {
    slug: "testing-basics",
    title: "Testing Basics",
    minutes: 10,
    summary: "Write your first tests with Vitest / Jest.",
    sections: [
      { heading: "Why test", body: "Catch regressions, document behavior, enable refactoring with confidence. Aim for a fast unit suite + a smaller integration/e2e suite." },
      { heading: "Anatomy of a test", body: "`describe('feature', () => { it('does x', () => { expect(fn(1)).toBe(2); }); });`. Follow AAA: Arrange, Act, Assert." },
      { heading: "Mocks & spies", body: "Replace network/DB with fakes. `vi.fn()`, `vi.spyOn(obj, 'method')`. Assert on calls: `expect(fn).toHaveBeenCalledWith(...)`." },
    ],
    examples: [
      { language: "js", code: "// sum.test.js\nimport { describe, it, expect } from 'vitest';\nimport { sum } from './sum.js';\ndescribe('sum', () => {\n  it('adds two numbers', () => expect(sum(2, 3)).toBe(5));\n  it('handles negatives', () => expect(sum(-1, 1)).toBe(0));\n});" },
    ],
    quiz: [
      { q: "Test pattern AAA:", options: ["Arrange/Act/Assert", "Assign/Action/Assert", "Always/Any/Assert", "Await/Ack/Act"], answer: 0 },
      { q: "Fast, isolated tests are:", options: ["e2e", "integration", "unit", "manual"], answer: 2 },
      { q: "Replace external calls with:", options: ["console.log", "Mocks/Stubs", "sleep", "console.error"], answer: 1 },
    ],
  },
  {
    slug: "modern-tooling",
    title: "Modern Tooling: Node, npm, Vite",
    minutes: 10,
    summary: "Package managers, module bundlers, and dev workflow.",
    sections: [
      { heading: "Node & package managers", body: "Node runs JS. `npm`, `pnpm`, `bun`, `yarn` install packages listed in `package.json`. Use lockfiles for reproducible installs." },
      { heading: "Bundlers", body: "Vite (dev via native ESM, prod via Rollup) is the default for modern apps. esbuild/swc power TypeScript compilation." },
      { heading: "Linters & formatters", body: "ESLint for code quality, Prettier for formatting, TypeScript for types. Wire into CI so bad code can't merge." },
    ],
    examples: [
      { language: "bash", code: "npm create vite@latest my-app\ncd my-app\nnpm install\nnpm run dev" },
    ],
    quiz: [
      { q: "Default dev bundler in modern JS apps:", options: ["Webpack", "Vite", "Parcel", "Rollup"], answer: 1 },
      { q: "Lockfile ensures:", options: ["Random installs", "Reproducible installs", "Faster CPU", "Bigger bundles"], answer: 1 },
      { q: "Code quality vs formatting:", options: ["ESLint / Prettier", "Prettier / ESLint", "Both same", "Neither"], answer: 0 },
    ],
  },
];

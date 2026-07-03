import type { Lesson } from "./types";

export const pythonLessons: Lesson[] = [
  {
    slug: "intro-and-setup",
    title: "Intro to Python & Setup",
    minutes: 8,
    summary: "What Python is, why it dominates data/AI/scripting, and how to run your first program.",
    sections: [
      { heading: "Why Python", body: "Python is a general-purpose, interpreted, dynamically-typed language famous for readability. It powers data science (pandas, NumPy), machine learning (PyTorch, TensorFlow), web backends (Django, FastAPI), automation and scripting. Its philosophy is captured by `import this` (The Zen of Python): 'Readability counts.'" },
      { heading: "Installing Python", body: "Install Python 3.11+ from python.org, or use pyenv on macOS/Linux for multiple versions. Verify with `python --version`. Use an editor like VS Code with the Python extension. For quick experimentation, launch the REPL with `python`." },
      { heading: "Your first program", body: "Create `hello.py` and run `python hello.py`. Every Python program is just a text file with `.py` extension executed top to bottom. No `main` function is required." },
    ],
    examples: [
      { language: "python", code: "# hello.py\nname = \"world\"\nprint(f\"Hello, {name}!\")" },
    ],
    quiz: [
      { q: "Python is:", options: ["Compiled and statically typed", "Interpreted and dynamically typed", "Only for data science", "A markup language"], answer: 1 },
      { q: "The command to run hello.py is:", options: ["run hello.py", "python hello.py", "exec hello", "py -c hello"], answer: 1 },
      { q: "Which file extension is used for Python source?", options: [".pyt", ".pyth", ".py", ".p3"], answer: 2 },
    ],
  },
  {
    slug: "variables-and-types",
    title: "Variables & Data Types",
    minutes: 10,
    summary: "How Python stores values, dynamic typing, and the built-in primitive types.",
    sections: [
      { heading: "Variables", body: "A variable is a name bound to a value. Python infers the type at runtime. Names use snake_case, must start with a letter/underscore, and are case-sensitive. Assignment uses `=`." },
      { heading: "Primitive types", body: "`int` (arbitrary precision integers), `float` (double-precision), `str` (immutable Unicode text), `bool` (`True`/`False`), and `NoneType` (`None`). Use `type(x)` to inspect. Convert with `int()`, `float()`, `str()`, `bool()`." },
      { heading: "Dynamic typing gotcha", body: "The same name can be rebound to a different type. This flexibility helps prototyping but requires discipline. Type hints (PEP 484) add static context: `age: int = 25`." },
    ],
    examples: [
      { language: "python", code: "age: int = 25\nheight: float = 1.78\nname: str = \"Ada\"\nis_active: bool = True\nprint(type(age), type(height), type(name), type(is_active))" },
    ],
    quiz: [
      { q: "Which is not a Python primitive?", options: ["int", "float", "char", "bool"], answer: 2, explain: "Python has no separate char type; single characters are just strings." },
      { q: "type(3/2) returns:", options: ["int", "float", "double", "number"], answer: 1, explain: "The `/` operator always returns a float in Python 3." },
      { q: "Which is a valid variable name?", options: ["2things", "my-var", "_total", "class"], answer: 2 },
    ],
  },
  {
    slug: "strings",
    title: "Strings & Text",
    minutes: 12,
    summary: "Immutable text, slicing, f-strings, and the most-used string methods.",
    sections: [
      { heading: "Creating strings", body: "Use single, double, or triple quotes. Triple quotes span multiple lines and are also used for docstrings. Strings are immutable — every 'modification' returns a new string." },
      { heading: "Indexing & slicing", body: "Zero-indexed. `s[0]` is first character, `s[-1]` last. Slice with `s[start:stop:step]`; `stop` is exclusive. `s[::-1]` reverses a string." },
      { heading: "Formatting with f-strings", body: "`f\"Hello, {name}!\"` interpolates expressions. You can format numbers: `f\"{price:.2f}\"`. Prefer f-strings over `%` or `.format()` for readability and speed." },
      { heading: "Useful methods", body: "`.upper()`, `.lower()`, `.strip()`, `.replace()`, `.split()`, `.join()`, `.startswith()`, `.find()`, `.count()`. Methods return new strings." },
    ],
    examples: [
      { language: "python", code: "email = \"  Ada@Example.com  \"\nclean = email.strip().lower()\nuser, domain = clean.split(\"@\")\nprint(f\"user={user!r} domain={domain!r}\")" },
    ],
    quiz: [
      { q: "What does 'python'[::-1] produce?", options: ["'python'", "'nohtyp'", "Error", "''"], answer: 1 },
      { q: "Strings in Python are:", options: ["Mutable", "Immutable", "Only ASCII", "Fixed length"], answer: 1 },
      { q: "Best way to format 'Price: 3.14' from a float?", options: ["'Price: ' + 3.14", "f'Price: {price:.2f}'", "print('Price:', str(3.14))", "'%d' % 3.14"], answer: 1 },
    ],
  },
  {
    slug: "numbers-and-math",
    title: "Numbers & Math",
    minutes: 8,
    summary: "Integer and float arithmetic, operators, and the math module.",
    sections: [
      { heading: "Operators", body: "`+ - * /` behave as expected; `//` is floor division, `%` modulo, `**` exponent. Mixing int and float yields float." },
      { heading: "Precision", body: "`float` is IEEE-754 double — beware `0.1 + 0.2 != 0.3`. Use `decimal.Decimal` or `round(x, n)` when precision matters (money, scientific)." },
      { heading: "math module", body: "`math.sqrt`, `math.pi`, `math.floor`, `math.ceil`, `math.log`. For random numbers use the `random` module." },
    ],
    examples: [
      { language: "python", code: "import math\nprint(2 ** 10)          # 1024\nprint(17 // 5, 17 % 5)  # 3 2\nprint(round(math.pi, 3))# 3.142" },
    ],
    quiz: [
      { q: "17 // 5 equals:", options: ["3.4", "3", "4", "2"], answer: 1 },
      { q: "Why can 0.1+0.2 != 0.3?", options: ["Bug in Python", "Floating-point representation error", "Because of integers", "Depends on OS"], answer: 1 },
      { q: "2**8 equals:", options: ["16", "64", "128", "256"], answer: 3 },
    ],
  },
  {
    slug: "booleans-comparisons",
    title: "Booleans, Comparisons & Truthiness",
    minutes: 8,
    summary: "How Python evaluates truth, comparison operators, and short-circuit logic.",
    sections: [
      { heading: "Booleans", body: "`True` and `False` (capitalized). Result of comparisons. Booleans are a subclass of `int` (`True==1`)." },
      { heading: "Comparison operators", body: "`== != < <= > >=`. Chained comparisons work: `0 < x < 10`. Use `is` only to compare with `None` or singletons, not equality." },
      { heading: "Truthiness", body: "Falsy values: `False`, `0`, `0.0`, `''`, `[]`, `{}`, `set()`, `None`. Everything else is truthy. `if items:` is idiomatic for 'not empty'." },
      { heading: "Logical operators", body: "`and`, `or`, `not`. Short-circuit: `x and y` returns `x` if falsy else `y`; commonly used for defaults: `name = name or 'anon'`." },
    ],
    examples: [
      { language: "python", code: "items = []\nif not items:\n    print(\"empty\")\nname = None\nprint(name or \"anonymous\")   # 'anonymous'" },
    ],
    quiz: [
      { q: "Which is falsy?", options: ["'False'", "[0]", "0", "'0'"], answer: 2 },
      { q: "Result of `2 < 5 < 10`:", options: ["True", "False", "SyntaxError", "None"], answer: 0 },
      { q: "Best check for None:", options: ["x == None", "x is None", "not x", "x = None"], answer: 1 },
    ],
  },
  {
    slug: "lists",
    title: "Lists — Ordered Mutable Sequences",
    minutes: 12,
    summary: "The workhorse collection: appending, slicing, sorting, and comprehensions.",
    sections: [
      { heading: "Creating & indexing", body: "`nums = [1, 2, 3]`. Zero-indexed, supports negative indices and slicing like strings. Lists are heterogeneous — items can be any type." },
      { heading: "Mutation", body: "`.append(x)` add to end, `.extend(iter)` add many, `.insert(i, x)`, `.pop()`, `.remove(value)`, `.sort()` in place, `sorted()` returns a new list." },
      { heading: "Copying", body: "`b = a` gives an alias, not a copy. Use `a.copy()`, `a[:]`, or `list(a)` for a shallow copy. Use `copy.deepcopy` for nested structures." },
      { heading: "Iterating", body: "`for x in nums:` is idiomatic. Use `enumerate(nums)` for index+value, `zip(a, b)` to iterate pairs." },
    ],
    examples: [
      { language: "python", code: "scores = [82, 91, 74]\nscores.append(100)\nscores.sort(reverse=True)\nfor i, s in enumerate(scores, start=1):\n    print(f\"{i}: {s}\")" },
    ],
    quiz: [
      { q: "Which method sorts a list in place?", options: [".sorted()", ".sort()", "sorted()", ".order()"], answer: 1 },
      { q: "`a = [1,2]; b = a; b.append(3)` — what is `a`?", options: ["[1,2]", "[1,2,3]", "[3]", "Error"], answer: 1 },
      { q: "Correct shallow copy:", options: ["a.copy()", "copy(a)", "a.clone()", "a{}"], answer: 0 },
    ],
  },
  {
    slug: "tuples",
    title: "Tuples — Immutable Sequences",
    minutes: 6,
    summary: "When you need a fixed record: unpacking, hashability, and named tuples.",
    sections: [
      { heading: "Creation", body: "Parentheses are optional: `t = 1, 2, 3`. Single-element tuple needs trailing comma: `(1,)`. Tuples are immutable — great for keys and stable records." },
      { heading: "Unpacking", body: "`x, y = point`, `first, *rest = nums`. Swap two variables in one line: `a, b = b, a`." },
      { heading: "namedtuple", body: "`from collections import namedtuple; Point = namedtuple('Point', 'x y')`. Gives readable field access without a full class. For richer records prefer `dataclasses`." },
    ],
    examples: [
      { language: "python", code: "from collections import namedtuple\nPoint = namedtuple('Point', 'x y')\np = Point(3, 4)\nprint(p.x, p.y)" },
    ],
    quiz: [
      { q: "How do you make a 1-item tuple?", options: ["(1)", "(1,)", "[1]", "{1}"], answer: 1 },
      { q: "Tuples are:", options: ["Mutable", "Immutable", "Ordered but mutable", "Hashable only if empty"], answer: 1 },
      { q: "Which swaps a and b?", options: ["a=b; b=a", "swap(a,b)", "a,b = b,a", "a,b := b,a"], answer: 2 },
    ],
  },
  {
    slug: "sets",
    title: "Sets — Unique Unordered Collections",
    minutes: 8,
    summary: "O(1) membership tests, deduplication, and set algebra.",
    sections: [
      { heading: "Creating", body: "`s = {1, 2, 3}` or `set([1,2,3])`. Empty set is `set()` — `{}` is a dict. Only hashable items allowed (no lists/dicts)." },
      { heading: "Operations", body: "Union `a | b`, intersection `a & b`, difference `a - b`, symmetric difference `a ^ b`. `.add()`, `.discard()`, `.remove()`." },
      { heading: "When to use", body: "Deduplicate a list: `list(set(items))`. Fast membership: `x in s` is O(1). Order is not preserved (in CPython 3.7+ dicts preserve insertion order; sets do not)." },
    ],
    examples: [
      { language: "python", code: "a = {1,2,3}\nb = {3,4,5}\nprint(a | b, a & b, a - b)   # union, intersection, diff\nunique = list(set([1,1,2,3,3]))\nprint(unique)" },
    ],
    quiz: [
      { q: "How to make an empty set?", options: ["{}", "set()", "[]", "()"], answer: 1 },
      { q: "a & b performs:", options: ["Union", "Intersection", "Difference", "Update"], answer: 1 },
      { q: "Sets guarantee:", options: ["Insertion order", "Uniqueness of hashable elements", "Sorted order", "Constant iteration order"], answer: 1 },
    ],
  },
  {
    slug: "dictionaries",
    title: "Dictionaries — Key/Value Maps",
    minutes: 12,
    summary: "The most versatile data structure in Python. Lookups, iteration, and common patterns.",
    sections: [
      { heading: "Creating & accessing", body: "`d = {'name': 'Ada', 'age': 36}`. Access with `d['name']`; use `d.get('name', default)` to avoid KeyError. Keys must be hashable." },
      { heading: "Iteration", body: "`for k, v in d.items():`, `d.keys()`, `d.values()`. Since 3.7 dicts keep insertion order." },
      { heading: "Merging & updating", body: "`d.update(other)`, `merged = {**a, **b}`, or `a | b` (3.9+). Use `d.setdefault(k, [])` to init nested collections." },
      { heading: "Comprehensions", body: "`{k: v*2 for k, v in d.items() if v > 0}`. Also `collections.defaultdict` and `Counter` from `collections`." },
    ],
    examples: [
      { language: "python", code: "from collections import Counter\nwords = \"the quick fox the lazy dog\".split()\nprint(Counter(words).most_common(2))\n\nprices = {'apple': 1, 'pear': 2}\nupdated = prices | {'apple': 3, 'kiwi': 4}\nprint(updated)" },
    ],
    quiz: [
      { q: "Safest lookup with default:", options: ["d['x']", "d.get('x', 0)", "d.at('x')", "d?.x"], answer: 1 },
      { q: "Which is not a valid dict key?", options: ["'a'", "(1,2)", "[1,2]", "42"], answer: 2, explain: "Lists are mutable and unhashable." },
      { q: "Counter is in module:", options: ["itertools", "collections", "functools", "typing"], answer: 1 },
    ],
  },
  {
    slug: "control-flow",
    title: "Control Flow: if / elif / else",
    minutes: 8,
    summary: "Conditional execution, the walrus operator, and match statements.",
    sections: [
      { heading: "if/elif/else", body: "Indentation defines blocks (typically 4 spaces). No parentheses around conditions; use `and`, `or`, `not`. Ternary: `x if cond else y`." },
      { heading: "match (3.10+)", body: "Structural pattern matching, cleaner than long if/elif chains for shape-based branching." },
      { heading: "Walrus `:=`", body: "Assign inside expression: `if (n := len(items)) > 10: ...`. Use sparingly for readability." },
    ],
    examples: [
      { language: "python", code: "def grade(score):\n    if score >= 90: return 'A'\n    elif score >= 75: return 'B'\n    elif score >= 60: return 'C'\n    return 'F'\n\nmatch (\"circle\", 3):\n    case (\"circle\", r): print(\"area\", 3.14 * r*r)\n    case (\"square\", s): print(\"area\", s*s)" },
    ],
    quiz: [
      { q: "Which forms a block in Python?", options: ["Braces {}", "Indentation", "Keywords begin/end", "Parentheses"], answer: 1 },
      { q: "Ternary syntax is:", options: ["cond ? a : b", "a if cond else b", "if cond then a else b", "a || b"], answer: 1 },
      { q: "match statement was added in:", options: ["3.6", "3.8", "3.10", "3.12"], answer: 2 },
    ],
  },
  {
    slug: "loops",
    title: "Loops: for and while",
    minutes: 10,
    summary: "Iteration idioms, ranges, break/continue, and enumerate/zip.",
    sections: [
      { heading: "for loops", body: "`for x in iterable:` — works with lists, strings, dicts, files, generators. Use `range(n)` for count-controlled loops. Avoid `for i in range(len(list))` — iterate directly or with `enumerate`." },
      { heading: "while loops", body: "Loop while condition is true. Use for input polling or unknown iteration count. Watch for infinite loops." },
      { heading: "break, continue, else", body: "`break` exits; `continue` skips to next iteration. A rare `for/else`: the `else` runs when the loop completes without `break` — handy for search patterns." },
    ],
    examples: [
      { language: "python", code: "for i, ch in enumerate('hello'):\n    print(i, ch)\n\nn = 5\nfor x in range(2, n):\n    if n % x == 0:\n        print('not prime'); break\nelse:\n    print('prime')" },
    ],
    quiz: [
      { q: "`range(3)` yields:", options: ["0,1,2,3", "1,2,3", "0,1,2", "3"], answer: 2 },
      { q: "Best iteration to get index + value:", options: ["range(len(x))", "enumerate(x)", "zip(x)", "iter(x)"], answer: 1 },
      { q: "for/else runs when:", options: ["Loop errors", "Loop finishes without break", "Loop breaks", "Always"], answer: 1 },
    ],
  },
  {
    slug: "functions",
    title: "Functions",
    minutes: 12,
    summary: "Defining functions, arguments, return values, defaults, *args and **kwargs.",
    sections: [
      { heading: "def", body: "`def name(params): ...`. Functions are first-class objects. Return `None` implicitly if no `return`. Use docstrings — the first string in the body — for documentation." },
      { heading: "Arguments", body: "Positional and keyword args. Defaults: `def greet(name='world')`. Never use mutable defaults (`def f(x=[])`) — the default persists across calls. Use `None` and rebind." },
      { heading: "*args & **kwargs", body: "`*args` gathers extra positional args into a tuple; `**kwargs` gathers keyword args into a dict. Useful for wrappers." },
      { heading: "Type hints", body: "`def add(a: int, b: int) -> int:` — checked by tools like mypy, not at runtime, but improve IDE help." },
    ],
    examples: [
      { language: "python", code: "def add(a: int, b: int = 0) -> int:\n    \"\"\"Return the sum.\"\"\"\n    return a + b\n\ndef debug(*args, **kwargs):\n    print('args:', args)\n    print('kwargs:', kwargs)\n\ndebug(1, 2, name='ada', level=3)" },
    ],
    quiz: [
      { q: "Which is dangerous?", options: ["def f(x=0)", "def f(x=None)", "def f(x=[])", "def f(x='a')"], answer: 2 },
      { q: "**kwargs collects:", options: ["Positional args", "Keyword args as dict", "Types", "Nothing"], answer: 1 },
      { q: "A function without `return` returns:", options: ["0", "False", "None", "Nothing at all (error)"], answer: 2 },
    ],
  },
  {
    slug: "scope-and-closures",
    title: "Scope, LEGB & Closures",
    minutes: 10,
    summary: "How Python resolves names and how closures capture variables.",
    sections: [
      { heading: "LEGB rule", body: "Name lookup goes Local → Enclosing → Global → Built-in. Assigning to a name inside a function makes it local unless `global` or `nonlocal` is used." },
      { heading: "Closures", body: "A nested function captures variables from its enclosing scope. Useful for factories, decorators, and callbacks." },
      { heading: "nonlocal & global", body: "Use `nonlocal x` to rebind an enclosing variable; `global x` to rebind a module-level variable. Prefer returning values over globals." },
    ],
    examples: [
      { language: "python", code: "def make_counter():\n    n = 0\n    def inc():\n        nonlocal n\n        n += 1\n        return n\n    return inc\n\ncounter = make_counter()\nprint(counter(), counter(), counter())  # 1 2 3" },
    ],
    quiz: [
      { q: "LEGB stands for:", options: ["Local/Enclosing/Global/Built-in", "Language/Env/Global/Binding", "Loop/Enum/Global/Body", "None of these"], answer: 0 },
      { q: "To rebind an enclosing variable use:", options: ["global", "nonlocal", "outer", "let"], answer: 1 },
      { q: "A closure is:", options: ["A class instance", "A function that remembers its enclosing scope", "A file handle", "A finalized generator"], answer: 1 },
    ],
  },
  {
    slug: "modules-imports",
    title: "Modules, Packages & Imports",
    minutes: 8,
    summary: "Organize code across files with imports and packages.",
    sections: [
      { heading: "Modules", body: "Any `.py` file is a module. Import with `import mymod` or `from mymod import func`. `import x as y` aliases." },
      { heading: "Packages", body: "A directory with an `__init__.py` (optional in 3.3+) is a package. Use dotted paths: `from pkg.sub import util`." },
      { heading: "if __name__ == '__main__'", body: "Guard code that should only run when the file is executed directly, not when imported. Standard pattern for CLIs and scripts." },
    ],
    examples: [
      { language: "python", code: "# tools.py\ndef square(x): return x*x\n\n# main.py\nfrom tools import square\nif __name__ == '__main__':\n    print(square(5))" },
    ],
    quiz: [
      { q: "Standard entry guard:", options: ["if __init__ == '__main__':", "if __name__ == '__main__':", "if main:", "def main():"], answer: 1 },
      { q: "A package is:", options: ["A single file", "A directory of modules", "A pip install", "A class"], answer: 1 },
      { q: "Aliasing an import:", options: ["import x is y", "import x as y", "import x = y", "as x import y"], answer: 1 },
    ],
  },
  {
    slug: "errors-and-exceptions",
    title: "Errors & Exception Handling",
    minutes: 10,
    summary: "try/except/finally, raising custom exceptions, and best practices.",
    sections: [
      { heading: "try/except", body: "Wrap risky code in `try:`; catch specific exception classes. Never bare `except:` — you'll swallow keyboard interrupts. Multiple handlers by tuple: `except (TypeError, ValueError):`." },
      { heading: "else and finally", body: "`else` runs when no exception was raised; `finally` always runs — perfect for cleanup." },
      { heading: "Raising & custom exceptions", body: "`raise ValueError('bad input')`. Subclass `Exception` for domain errors. Preserve context with `raise NewError(...) from original`." },
      { heading: "EAFP vs LBYL", body: "Pythonic style: 'Easier to Ask Forgiveness than Permission' — try the operation and catch, instead of pre-checking." },
    ],
    examples: [
      { language: "python", code: "class InsufficientFunds(Exception):\n    pass\n\ndef withdraw(balance, amount):\n    if amount > balance:\n        raise InsufficientFunds(f\"{amount} > {balance}\")\n    return balance - amount\n\ntry:\n    withdraw(50, 100)\nexcept InsufficientFunds as e:\n    print('blocked:', e)" },
    ],
    quiz: [
      { q: "`finally` runs:", options: ["Only on error", "Only on success", "Always", "When no return"], answer: 2 },
      { q: "Best practice:", options: ["Catch bare except", "Catch specific exceptions", "Never catch", "Always retry"], answer: 1 },
      { q: "Custom exceptions should inherit from:", options: ["object", "BaseException", "Exception", "Error"], answer: 2 },
    ],
  },
  {
    slug: "file-io",
    title: "File I/O and pathlib",
    minutes: 10,
    summary: "Read and write text/binary files safely with context managers.",
    sections: [
      { heading: "open() with context managers", body: "Always use `with open(path) as f:` — the file closes automatically. Modes: `'r'` read, `'w'` write (truncate), `'a'` append, `'b'` binary." },
      { heading: "Reading", body: "`.read()` whole file, `.readlines()` list of lines, or iterate line by line (memory-friendly for big files)." },
      { heading: "pathlib", body: "Modern OO API for filesystem paths. `Path('data') / 'file.txt'`, `.exists()`, `.read_text()`, `.write_text()`. Prefer over `os.path`." },
    ],
    examples: [
      { language: "python", code: "from pathlib import Path\np = Path('notes.txt')\np.write_text('hello\\nworld')\nfor line in p.read_text().splitlines():\n    print('>', line)" },
    ],
    quiz: [
      { q: "Preferred file open pattern:", options: ["open then close", "with open(...)", "os.open", "manual finally"], answer: 1 },
      { q: "Append mode:", options: ["'r'", "'w'", "'a'", "'x'"], answer: 2 },
      { q: "Best modern path API:", options: ["os.path", "pathlib", "sys.path", "shutil"], answer: 1 },
    ],
  },
  {
    slug: "list-comprehensions",
    title: "Comprehensions & Generator Expressions",
    minutes: 10,
    summary: "Concise, expressive transformations of collections.",
    sections: [
      { heading: "List comprehensions", body: "`[expr for x in iterable if cond]`. Faster and more readable than manual loops for simple transformations. Also for sets `{}` and dicts `{k:v}`." },
      { heading: "Nested comps", body: "`[y for row in matrix for y in row]` flattens. Read left to right, top to bottom." },
      { heading: "Generator expressions", body: "Same syntax with parentheses: `(expr for x in it)`. Lazy — good for large data or when piping into `sum`, `any`, `max`." },
    ],
    examples: [
      { language: "python", code: "squares = [x*x for x in range(10) if x % 2 == 0]\nprint(squares)  # [0,4,16,36,64]\n\nlarge_sum = sum(x*x for x in range(10_000_000))  # memory-friendly" },
    ],
    quiz: [
      { q: "Which returns a generator?", options: ["[x for x in r]", "(x for x in r)", "{x for x in r}", "{k:x for x in r}"], answer: 1 },
      { q: "Dict comprehension syntax:", options: ["{k, v ...}", "{k:v for k,v in ...}", "dict[k=v for ...]", "for k,v in ...:{k:v}"], answer: 1 },
      { q: "Comprehensions vs for-loops:", options: ["Always faster", "Often faster and more concise", "Slower", "Same speed"], answer: 1 },
    ],
  },
  {
    slug: "oop-classes",
    title: "OOP: Classes, Instances & Dunder Methods",
    minutes: 15,
    summary: "Model real-world entities: __init__, methods, class vs instance state, and magic methods.",
    sections: [
      { heading: "Defining a class", body: "`class Book:` with `def __init__(self, ...)` as the constructor. `self` is the instance. Methods are functions inside the class." },
      { heading: "Attributes", body: "Instance attributes (`self.x`) are per-object. Class attributes are shared. Prefer instance attributes for mutable state." },
      { heading: "Dunder methods", body: "`__repr__` (debug string), `__str__` (user string), `__eq__`, `__lt__`, `__len__`, `__iter__`. Implement to integrate with `print`, `sorted`, `in`." },
      { heading: "dataclasses", body: "`@dataclass` auto-generates `__init__`, `__repr__`, `__eq__` — cuts boilerplate for record-like classes." },
    ],
    examples: [
      { language: "python", code: "from dataclasses import dataclass\n\n@dataclass\nclass Book:\n    title: str\n    pages: int\n\n    def __str__(self):\n        return f\"{self.title} ({self.pages}p)\"\n\nb = Book(\"Fluent Python\", 792)\nprint(b)" },
    ],
    quiz: [
      { q: "The constructor is:", options: ["__new__", "__init__", "__create__", "constructor"], answer: 1 },
      { q: "What does @dataclass generate?", options: ["__init__ and __repr__ and __eq__", "Only __init__", "Nothing", "Only __repr__"], answer: 0 },
      { q: "print(obj) calls:", options: ["__repr__", "__str__ if defined else __repr__", "__format__", "__print__"], answer: 1 },
    ],
  },
  {
    slug: "inheritance",
    title: "Inheritance, super() & Polymorphism",
    minutes: 10,
    summary: "Extend classes cleanly and know when to prefer composition.",
    sections: [
      { heading: "Extending classes", body: "`class Manager(Employee):` inherits attributes and methods. Call parent constructor with `super().__init__(...)`. Override methods by redefining them." },
      { heading: "Polymorphism", body: "Different classes can respond to the same method name. Duck typing means Python cares about behavior, not type: 'if it quacks like a duck…'." },
      { heading: "Composition > inheritance", body: "Deep hierarchies are fragile. Often better to compose: hold instances of helpers as attributes." },
      { heading: "abstract base classes", body: "`from abc import ABC, abstractmethod` to enforce that subclasses implement required methods." },
    ],
    examples: [
      { language: "python", code: "from abc import ABC, abstractmethod\n\nclass Shape(ABC):\n    @abstractmethod\n    def area(self): ...\n\nclass Circle(Shape):\n    def __init__(self, r): self.r = r\n    def area(self): return 3.14159 * self.r ** 2\n\nprint(Circle(2).area())" },
    ],
    quiz: [
      { q: "Correct call to parent init:", options: ["parent.__init__(self)", "super().__init__()", "Base(self).__init__()", "self.__init__()"], answer: 1 },
      { q: "Duck typing means:", options: ["Strong type checks", "Behavior over type", "Abstract classes", "Only for ducks"], answer: 1 },
      { q: "abstractmethod comes from:", options: ["typing", "abc", "collections", "functools"], answer: 1 },
    ],
  },
  {
    slug: "iterators-generators",
    title: "Iterators & Generators",
    minutes: 10,
    summary: "Lazy iteration for pipelines and infinite streams.",
    sections: [
      { heading: "Iterator protocol", body: "An object is iterable if it has `__iter__` returning an iterator; iterators have `__next__` raising `StopIteration` when exhausted." },
      { heading: "Generators", body: "Functions using `yield` become generators — they pause and resume, producing values lazily. Great for streams, pipelines, big files." },
      { heading: "itertools", body: "`chain`, `islice`, `groupby`, `product`, `combinations` — Swiss-army knife for iteration." },
    ],
    examples: [
      { language: "python", code: "def fib():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\nfrom itertools import islice\nprint(list(islice(fib(), 10)))" },
    ],
    quiz: [
      { q: "A generator function contains:", options: ["return", "yield", "async", "await"], answer: 1 },
      { q: "Iterators end by raising:", options: ["EOFError", "StopIteration", "IndexError", "GeneratorExit"], answer: 1 },
      { q: "islice comes from:", options: ["functools", "itertools", "collections", "operator"], answer: 1 },
    ],
  },
  {
    slug: "decorators",
    title: "Decorators",
    minutes: 12,
    summary: "Wrap functions to add logging, timing, caching, or auth without editing them.",
    sections: [
      { heading: "The @ syntax", body: "`@decorator` above `def f(...)` is equivalent to `f = decorator(f)`. A decorator is any callable returning a callable." },
      { heading: "Preserving metadata", body: "Use `functools.wraps(fn)` in the inner wrapper so the decorated function keeps its name and docstring." },
      { heading: "Practical examples", body: "`@lru_cache` memoization, `@dataclass`, `@staticmethod`, `@classmethod`, `@property`. Frameworks like Flask register routes with decorators." },
    ],
    examples: [
      { language: "python", code: "from functools import wraps\nimport time\n\ndef timeit(fn):\n    @wraps(fn)\n    def wrapper(*a, **kw):\n        start = time.perf_counter()\n        result = fn(*a, **kw)\n        print(f\"{fn.__name__} took {time.perf_counter()-start:.4f}s\")\n        return result\n    return wrapper\n\n@timeit\ndef slow(): time.sleep(0.1)\nslow()" },
    ],
    quiz: [
      { q: "`@dec` above def f: is short for:", options: ["dec(f)", "f = dec(f)", "f(dec)", "dec = f"], answer: 1 },
      { q: "To preserve function metadata inside a decorator:", options: ["@wraps", "@property", "@classmethod", "@lru_cache"], answer: 0 },
      { q: "@lru_cache is used for:", options: ["Auth", "Memoization", "Logging", "Timing"], answer: 1 },
    ],
  },
  {
    slug: "standard-library",
    title: "Standard Library Essentials",
    minutes: 10,
    summary: "Batteries included: datetime, collections, itertools, functools, re.",
    sections: [
      { heading: "datetime", body: "`datetime.now()`, `timedelta`, ISO format with `.isoformat()`. Use `zoneinfo` for timezones. Store timestamps in UTC." },
      { heading: "collections", body: "`defaultdict`, `Counter`, `deque`, `OrderedDict`, `namedtuple`. Solves common patterns in a line or two." },
      { heading: "functools", body: "`partial` fixes arguments, `reduce` folds a sequence, `lru_cache` memoizes." },
      { heading: "re", body: "Regular expressions: `re.search`, `re.findall`, `re.sub`. Prefer raw strings `r'\\d+'` for patterns." },
    ],
    examples: [
      { language: "python", code: "from collections import Counter, deque\nc = Counter('mississippi'); print(c.most_common(2))\nq = deque([1,2,3]); q.appendleft(0); print(q)" },
    ],
    quiz: [
      { q: "Counter is in:", options: ["itertools", "collections", "functools", "operator"], answer: 1 },
      { q: "Deque supports O(1) append on both ends:", options: ["Yes", "No", "Only right", "Only left"], answer: 0 },
      { q: "Raw string prefix:", options: ["b''", "u''", "r''", "f''"], answer: 2 },
    ],
  },
  {
    slug: "json-and-apis",
    title: "JSON, HTTP & APIs",
    minutes: 12,
    summary: "Parse JSON, call REST APIs with requests, and handle errors.",
    sections: [
      { heading: "json module", body: "`json.dumps(obj)` serialize, `json.loads(text)` parse. Round-trips only basic types (dict/list/str/number/bool/None)." },
      { heading: "requests library", body: "`pip install requests`. `r = requests.get(url, params=..., timeout=10)`; check `r.status_code`, `r.json()`. Always set a timeout." },
      { heading: "Error handling", body: "`raise_for_status()` throws on 4xx/5xx. Retry with `tenacity` or `requests`+backoff for transient failures." },
    ],
    examples: [
      { language: "python", code: "import requests, json\nr = requests.get('https://api.github.com/repos/python/cpython', timeout=10)\nr.raise_for_status()\ndata = r.json()\nprint(data['full_name'], data['stargazers_count'])" },
    ],
    quiz: [
      { q: "Serialize dict → JSON string:", options: ["json.parse(d)", "json.load(d)", "json.dumps(d)", "str(d)"], answer: 2 },
      { q: "Always pass to a network call:", options: ["debug=True", "timeout=", "session=", "verify=False"], answer: 1 },
      { q: "raise_for_status() throws on:", options: ["Any request", "1xx", "4xx/5xx", "Only 500"], answer: 2 },
    ],
  },
  {
    slug: "venv-and-pip",
    title: "Virtual Environments & Packaging",
    minutes: 8,
    summary: "Isolate dependencies per project, use pip and requirements files.",
    sections: [
      { heading: "Why venv", body: "System Python packages collide across projects. A venv is a per-project folder with its own Python and site-packages." },
      { heading: "Creating a venv", body: "`python -m venv .venv`, then `source .venv/bin/activate` (macOS/Linux) or `.venv\\Scripts\\activate` (Windows). Deactivate with `deactivate`." },
      { heading: "pip & requirements", body: "`pip install package`. Freeze with `pip freeze > requirements.txt`, restore with `pip install -r requirements.txt`. Consider `uv`, `poetry`, or `pipenv` for lock files." },
    ],
    examples: [
      { language: "bash", code: "python -m venv .venv\nsource .venv/bin/activate\npip install requests pandas\npip freeze > requirements.txt" },
    ],
    quiz: [
      { q: "Create a venv:", options: ["python -m venv .venv", "pip venv new", "virtualenv --new", "conda env"], answer: 0 },
      { q: "Save current deps:", options: ["pip save", "pip freeze > requirements.txt", "pip export", "pip lock"], answer: 1 },
      { q: "A venv provides:", options: ["Faster Python", "Isolated site-packages", "Compiled binaries", "GPU support"], answer: 1 },
    ],
  },
  {
    slug: "cli-todo-project",
    title: "Mini Project: CLI Todo App",
    minutes: 20,
    summary: "Consolidate everything: files, functions, argparse, JSON persistence.",
    sections: [
      { heading: "Requirements", body: "Add, list, complete, delete tasks. Persist to `tasks.json`. Use `argparse` for the CLI." },
      { heading: "Design", body: "Model: list of dicts with id, title, done. Load on startup, save on change. Keep functions small — one job each." },
      { heading: "Extensions", body: "Add priorities, due dates, filtering by status. Add colors with `rich`. Package as a script via `pyproject.toml` entry point." },
    ],
    examples: [
      { language: "python", code: "import argparse, json\nfrom pathlib import Path\nDB = Path('tasks.json')\n\ndef load(): return json.loads(DB.read_text()) if DB.exists() else []\ndef save(t): DB.write_text(json.dumps(t, indent=2))\n\ndef add(title):\n    t = load()\n    t.append({'id': len(t)+1, 'title': title, 'done': False})\n    save(t); print('added', title)\n\ndef ls():\n    for x in load():\n        mark = 'x' if x['done'] else ' '\n        print(f\"[{mark}] {x['id']:>2} {x['title']}\")\n\np = argparse.ArgumentParser()\nsub = p.add_subparsers(dest='cmd', required=True)\na = sub.add_parser('add'); a.add_argument('title')\nsub.add_parser('list')\nargs = p.parse_args()\n{'add': lambda: add(args.title), 'list': ls}[args.cmd]()" },
    ],
    quiz: [
      { q: "Standard-library CLI parser:", options: ["click", "argparse", "typer", "docopt"], answer: 1 },
      { q: "Persist Python objects to disk quickly:", options: ["pickle or json", "csv only", "print", "input"], answer: 0 },
      { q: "argparse subcommands via:", options: ["add_argument", "add_subparsers", "add_group", "add_command"], answer: 1 },
    ],
  },
];

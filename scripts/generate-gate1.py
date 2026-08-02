#!/usr/bin/env python3
"""Generate the source-faithful GATE DA question dataset and question crops."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path

import fitz
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "site" / "gate1"
ASSETS = OUT / "assets" / "questions"
SOURCE_DIR = Path(os.environ.get("GATE_DA_PDF_DIR", Path.home() / "Downloads" / "da"))

PAPERS = [
    {
        "year": 2024,
        "label": "GATE DA 2024",
        "institute": "IISc Bengaluru",
        "paper": SOURCE_DIR / "DA24S1.pdf",
        "key": SOURCE_DIR / "DAFinalAnswerKey.pdf",
    },
    {
        "year": 2025,
        "label": "GATE DA 2025",
        "institute": "IIT Roorkee",
        "paper": SOURCE_DIR / "DA2025.pdf",
        "key": SOURCE_DIR / "DA_Keys (1).pdf",
    },
    {
        "year": 2026,
        "label": "GATE DA 2026",
        "institute": "IIT Guwahati",
        "paper": SOURCE_DIR / "DA.pdf",
        "key": SOURCE_DIR / "DA_Keys.pdf",
    },
]


TOPIC_RULES = [
    ("General Aptitude", "Verbal Ability", ["analogy", "word", "sentence", "passage", "meaning", "grammar", "statement"], True),
    ("General Aptitude", "Spatial and Analytical Aptitude", ["figure", "painted", "dice", "cube", "puzzle", "rectangle", "triangle", "ellipse", "map", "view"], True),
    ("General Aptitude", "Quantitative Aptitude", ["percentage", "votes", "ratio", "digit", "series", "probability", "invest", "number", "average", "speed", "distance"], True),
    ("DBMS", "SQL and Relational Algebra", ["sql", "select ", "relational", "database", " query", " join", "functional depend", "normal form", "er model", "data cube", "warehouse", "olap", "b+ tree index", "primary key", "foreign key"], False),
    ("Programming", "Python and Program Tracing", ["python", "code snippet", "program", "pseudocode", "def ", "print(", "list", "tuple"], False),
    ("Data Structures & Algorithms", "Graphs, Trees and Complexity", ["dfs", "bfs", "binary tree", "heap", "hash", "queue", "stack", "sort", "graph", "shortest path", "complexity", "recurrence", "array", "linked list"], False),
    ("Artificial Intelligence", "Search and Logic", ["a*", "heuristic", "proposition", "tautology", "logic", "search", "minimax", "bayesian network", "conditional independence", "inference"], False),
    ("Machine Learning", "Learning Models and Evaluation", ["classifier", "classification", "regression", "svm", "support vector", "neural", "perceptron", "k-means", "clustering", "pca", "bias-variance", "training error", "test error", "decision tree", "activation function", "loss function", "gradient descent", "ridge", "regularization"], False),
    ("Linear Algebra", "Matrices, Vectors and Eigenvalues", ["matrix", "determinant", "eigen", "vector", "rank", "linear transformation", "singular", "orthogonal", "null space", "system of linear"], False),
    ("Probability & Statistics", "Probability and Random Variables", ["probability", "random variable", "distribution", "bernoulli", "binomial", "normal distribution", "poisson", "expectation", "variance", "density", "covariance", "confidence", "hypothesis", "coin", "dice", "die ", "balls", "sample mean", "standard deviation"], False),
    ("Calculus & Optimization", "Calculus and Optimization", ["limit", "differentia", "derivative", "integral", "maximum", "minimum", "convex", "taylor", "continuous", "optimization", "gradient", "hessian"], False),
]


PLAYBOOKS = {
    "General Aptitude": {
        "concepts": ["Translate the wording precisely", "Eliminate choices using the strongest constraint"],
        "intuition": "Aptitude questions reward a clean reading before calculation. Identify the exact relationship or constraint, then test only the choices that can satisfy it.",
        "approach": "Underline the operative words, convert them into one simple rule, and eliminate options that violate that rule before doing detailed work.",
        "steps": ["Restate the target in plain language.", "Extract the decisive constraint from the prompt.", "Test the options against that constraint.", "Choose the option that survives every condition."],
        "trigger": "Dense aptitude wording",
        "think": "Translate first, calculate second",
        "formula": "\\text{Answer must satisfy every stated constraint}",
        "trap": "Do not solve a nearby question created by overlooking words such as valid, exactly, minimum, or excluding corners.",
        "check": "Does the selected option satisfy every word in the question?",
    },
    "Probability & Statistics": {
        "concepts": ["Identify the random experiment and event", "Use the matching probability or statistical identity"],
        "intuition": "Start with the sample space and dependencies. Once the event and conditioning are explicit, the correct formula is usually short.",
        "approach": "Write the event, mark independence or conditioning, then use the smallest applicable rule: counting, Bayes, expectation, variance, or a named distribution.",
        "steps": ["Define the event or quantity requested.", "Identify independence, conditioning, and the distributional assumptions.", "Substitute into the relevant identity.", "Check bounds, normalization, and units."],
        "trigger": "Random experiment or distribution",
        "think": "Event first, formula second",
        "formula": "P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}",
        "trap": "Do not confuse exactly, at least, and at most, or multiply probabilities without checking independence.",
        "check": "Is the probability between 0 and 1, and did I use the correct conditioning?",
    },
    "Linear Algebra": {
        "concepts": ["Translate the matrix condition into an invariant", "Use rank, eigenvalue, determinant, or subspace structure"],
        "intuition": "Matrix questions become faster when you look for invariants instead of expanding entries. Rank, trace, determinant, and eigenvalues often expose the answer directly.",
        "approach": "Name the matrix property, write its invariant, and test dimensions or special cases before attempting long algebra.",
        "steps": ["Identify the matrix or vector-space property.", "Write the governing identity.", "Apply dimension and rank constraints.", "Verify with a small or boundary case."],
        "trigger": "Matrix property",
        "think": "Look for an invariant",
        "formula": "\\det(A-\\lambda I)=0",
        "trap": "Do not assume symmetry, invertibility, or diagonalizability unless it follows from the prompt.",
        "check": "Are the dimensions consistent and is every assumed property actually given?",
    },
    "Calculus & Optimization": {
        "concepts": ["Identify the local or global condition", "Use derivatives, curvature, or a limit identity"],
        "intuition": "Separate a necessary condition from a sufficient one. A zero derivative finds a candidate; curvature or boundary checks decide what the candidate means.",
        "approach": "Simplify first, differentiate only what matters, and check domain, endpoints, and second-order conditions.",
        "steps": ["State the domain and requested quantity.", "Simplify or apply the relevant limit/derivative identity.", "Solve the necessary condition.", "Check curvature, boundaries, and feasibility."],
        "trigger": "Optimum, limit, or stationary point",
        "think": "Condition plus domain plus verification",
        "formula": "f'(x^*)=0,\\quad f''(x^*)>0\\Rightarrow\\text{local minimum}",
        "trap": "A stationary point is not automatically a minimum, and an algebraic limit step may be invalid outside its domain.",
        "check": "Did I inspect the domain and sufficient condition?",
    },
    "Programming": {
        "concepts": ["Trace state changes exactly", "Respect language evaluation and data-structure semantics"],
        "intuition": "Program-output questions are deterministic bookkeeping. Track only the variables that change and write their values after each critical line.",
        "approach": "Make a compact trace table, expand the loop or recursion only as far as needed, and watch mutation, scope, and index boundaries.",
        "steps": ["List the initial variable states.", "Trace each branch or iteration that changes state.", "Apply the language's mutation and evaluation rules.", "Read the final output or complexity from the trace."],
        "trigger": "Code or pseudocode",
        "think": "Build a state table",
        "formula": "T(n)=\\sum \\text{cost per executed operation}",
        "trap": "Do not evaluate from memory; aliasing, mutation, indexing, and loop bounds cause most errors.",
        "check": "Did I trace the final iteration and every mutation?",
    },
    "Data Structures & Algorithms": {
        "concepts": ["Recognize the algorithmic invariant", "Count operations or maintain the data-structure state"],
        "intuition": "The fastest route is to name the invariant: heap order, traversal frontier, hashing probe sequence, or recurrence structure.",
        "approach": "Identify the operation, maintain the invariant step by step, and use the tightest applicable complexity bound.",
        "steps": ["Identify the data structure or algorithm.", "State its invariant and the operation sequence.", "Trace only the states that can affect the answer.", "Check the result and asymptotic bound."],
        "trigger": "Traversal, update, or complexity",
        "think": "Invariant before simulation",
        "formula": "T(n)=aT(n/b)+f(n)",
        "trap": "Do not mix worst-case, average-case, and amortized bounds or assume a traversal order not fixed by the prompt.",
        "check": "Is the claimed order or complexity tied to the stated implementation?",
    },
    "DBMS": {
        "concepts": ["Track relational semantics precisely", "Apply keys, dependencies, joins, and filters in the right order"],
        "intuition": "Database questions are set questions. Build the intermediate relation mentally: join first when required, then filter, group, and project.",
        "approach": "Mark keys and join predicates, compute the smallest useful intermediate table, then apply filters and aggregation.",
        "steps": ["Write the schema, keys, or dependencies involved.", "Apply joins and selections in logical order.", "Handle duplicates, nulls, and grouping explicitly.", "Verify the final cardinality or normal form."],
        "trigger": "SQL, relation, or dependency",
        "think": "Construct the intermediate relation",
        "formula": "\\sigma_{condition}(R\\bowtie S)",
        "trap": "Do not forget duplicate semantics, null behavior, or accidentally turn an outer join into an inner join with a filter.",
        "check": "Did I apply the join condition before counting or filtering?",
    },
    "Machine Learning": {
        "concepts": ["Identify the model objective and assumptions", "Connect the algorithm to geometry, loss, or generalization"],
        "intuition": "Most ML questions become manageable when you separate training objective, learned representation, and evaluation behavior.",
        "approach": "Write the objective or decision rule, inspect dimensions and assumptions, then reason about the requested prediction or property.",
        "steps": ["Identify the model and its objective.", "Write the decision rule or update equation.", "Apply it to the supplied data or claim.", "Check geometry, dimensions, and edge cases."],
        "trigger": "Model, loss, or dataset",
        "think": "Objective, geometry, generalization",
        "formula": "\\hat{y}=\\arg\\min_y \\mathcal{L}(y, f_\\theta(x))",
        "trap": "Do not confuse training error with test error, or a model's objective with an evaluation metric.",
        "check": "Are the dimensions, labels, and optimization direction correct?",
    },
    "Artificial Intelligence": {
        "concepts": ["Represent the state, logic, or dependency graph", "Apply the correct search or inference rule"],
        "intuition": "AI questions are easiest after drawing the structure: a search frontier, logical implication, or Bayesian graph makes hidden dependencies visible.",
        "approach": "Sketch the state or dependency graph, state the admissibility/logic/inference rule, then eliminate claims that violate it.",
        "steps": ["Represent the states, propositions, or variables.", "State the search, logic, or independence criterion.", "Apply the criterion to each relevant branch or option.", "Verify the surviving answer against the original structure."],
        "trigger": "Search, logic, or Bayesian dependency",
        "think": "Draw structure before inference",
        "formula": "f(n)=g(n)+h(n)",
        "trap": "Do not assume independence from missing edges alone; conditioning and collider structure matter.",
        "check": "Did I apply the rule to the actual graph or logical form?",
    },
}


SPECIAL_NOTES = {
    "2024-1": {
        "concepts": ["Intensity ordering in a word analogy", "Meaning of near-synonyms"],
        "intuition": "The first chain moves from less severe illness to approaching death. The second must similarly move from mildly foolish to strongly foolish; 'vain' is the only semantically compatible middle word among the choices.",
        "approach": "Ignore spelling similarity. Compare meaning and intensity: silly → vain → daft.",
        "steps": ["Read the arrow as increasing intensity.", "Use the first chain to identify the relationship.", "Reject frown, fawn, and vein because they do not express foolishness.", "Select vain, the only meaning-compatible choice."],
        "trigger": "Analogy with an intensity arrow",
        "think": "Match both meaning and direction",
        "trap": "Choosing by similar spelling instead of meaning.",
        "check": "Does the word fit the semantic family and sit between both endpoints?",
    },
    "2024-2": {
        "concepts": ["Planar-map coloring", "Adjacency through shared edges"],
        "intuition": "Treat each region as a vertex and each shared boundary as an edge. Corner contact is explicitly excluded, so it creates no constraint.",
        "approach": "Find a set of mutually constraining regions that proves a lower bound, then construct a valid coloring with four colors to prove sufficiency.",
        "steps": ["Convert shared-boundary adjacency into a graph.", "Ignore regions that meet only at a corner.", "The central and surrounding constraints force at least four colors.", "A consistent four-color assignment exists, so the minimum is four."],
        "trigger": "Paint regions with shared boundaries",
        "think": "Graph coloring; corners do not count",
        "trap": "Treating corner-touching parts as adjacent.",
        "check": "Have I proved both necessity and that four colors are sufficient?",
    },
    "2024-3": {
        "concepts": ["Divisibility rule of 3", "Permutations of distinct digits"],
        "intuition": "Divisibility by 3 depends only on the digit sum. Since four of five digits are used, it is faster to ask which single digit can be omitted.",
        "approach": "The total digit sum is 21. Omitting 3 or 6 leaves a multiple of 3. Each valid four-digit set has 4! arrangements, giving 2 × 24 = 48.",
        "steps": ["Compute 1+3+4+6+7=21.", "For the remaining sum to be divisible by 3, omit a digit divisible by 3: 3 or 6.", "There are two valid digit sets.", "All digits are nonzero and distinct, so each set gives 4!=24 numbers; total 48."],
        "trigger": "Divisible by 3 using n-1 of n digits",
        "think": "Digit sum plus leave-one-out",
        "formula": "2\\times4!=48",
        "trap": "Starting with 5P4 counts arrangements whose digit sum is not divisible by 3.",
        "check": "Are there two valid omitted digits and no leading-zero restriction?",
    },
    "2024-4": {
        "concepts": ["Infinite geometric series", "Splitting interleaved patterns"],
        "intuition": "The denominators are powers of 2 and powers of 3 interleaved. Split them into two geometric series instead of forcing one common pattern.",
        "approach": "Write 2+(1/2+1/4+1/8+⋯)+(1/3+1/9+1/27+⋯)=2+1+1/2=7/2.",
        "steps": ["Separate powers of 2 and powers of 3.", "Sum the first GP: (1/2)/(1-1/2)=1.", "Sum the second GP: (1/3)/(1-1/3)=1/2.", "Add the leading 2 to obtain 7/2."],
        "trigger": "Interleaved reciprocal powers",
        "think": "Split into multiple geometric series",
        "formula": "S_\\infty=\\frac{a}{1-r},\\quad |r|<1",
        "trap": "Treating the mixed sequence as one geometric progression.",
        "check": "The tail is positive and less than 2, so a total of 3.5 is plausible.",
    },
    "2024-5": {
        "concepts": ["Percentage base", "Valid-vote denominator"],
        "intuition": "Every candidate share is expressed as a percentage of valid votes. Invalid votes are outside that denominator and must not enter the comparison.",
        "approach": "Use the candidate percentages directly on the same valid-vote base; compare or difference the shares before converting to counts if needed.",
        "steps": ["Identify valid votes as the common base.", "Translate each candidate share on that base.", "Apply the requested comparison or difference.", "Use total votes only if the question separately supplies the valid-vote fraction."],
        "trigger": "Share of valid votes",
        "think": "Lock the denominator first",
        "trap": "Using total votes when the percentages are of valid votes.",
        "check": "Do all candidate shares use the same denominator?",
    },
}


TOPIC_OVERRIDES = {
    "2024-34": ("Probability & Statistics", "Sample Mean"),
    "2024-48": ("Linear Algebra", "Linear Systems and Rank"),
    "2024-50": ("Calculus & Optimization", "Polynomial Extrema"),
    "2024-53": ("Machine Learning", "Decision Boundaries"),
    "2024-62": ("Machine Learning", "Decision Trees and Information Gain"),
    "2025-13": ("Linear Algebra", "Matrix Polynomials"),
    "2025-22": ("Machine Learning", "Linear Classifiers"),
    "2025-25": ("Linear Algebra", "Orthonormal Bases"),
    "2025-30": ("Machine Learning", "Clustering Linkage"),
    "2025-32": ("Calculus & Optimization", "Limits"),
    "2025-37": ("Linear Algebra", "Eigenvalues and Matrix Polynomials"),
    "2025-43": ("Artificial Intelligence", "Alpha-Beta Pruning"),
    "2025-49": ("Calculus & Optimization", "Function Extrema"),
    "2025-55": ("Machine Learning", "Linear Decision Boundaries"),
    "2025-59": ("Calculus & Optimization", "Function Regularity"),
    "2026-14": ("Artificial Intelligence", "Predicate Logic"),
    "2026-22": ("Linear Algebra", "Subspaces and Geometry"),
    "2026-24": ("Artificial Intelligence", "Logical Entailment"),
    "2026-27": ("Calculus & Optimization", "Polynomial Extrema"),
    "2026-33": ("Probability & Statistics", "Combinatorics"),
    "2026-35": ("Calculus & Optimization", "Infinite Series"),
    "2026-38": ("Artificial Intelligence", "Propositional Logic"),
    "2026-43": ("DBMS", "Data Cubes and Concept Hierarchies"),
    "2026-45": ("Probability & Statistics", "Poisson Distribution"),
    "2026-62": ("Probability & Statistics", "Variance Identity"),
}


def pdf_text(path: Path) -> str:
    doc = fitz.open(path)
    return "\n".join(page.get_text("text", sort=True) for page in doc)


def parse_key(path: Path) -> dict[int, dict]:
    text = pdf_text(path)
    answers: dict[int, dict] = {}
    for raw in text.splitlines():
        line = " ".join(raw.split())
        match = re.match(r"^(\d{1,2})\s+\d+\s+(MCQ|MSQ|NAT)\s+(GA|DA)\s+(.+?)\s+([12])$", line)
        if not match:
            continue
        number, qtype, section, answer, marks = match.groups()
        answers[int(number)] = {
            "type": qtype,
            "section": "General Aptitude" if section == "GA" else "Data Science & AI",
            "answer": answer.replace(";", ","),
            "marks": int(marks),
        }
    if len(answers) != 65:
        raise RuntimeError(f"Expected 65 answers in {path}, found {len(answers)}")
    return answers


def question_locations(doc: fitz.Document) -> list[dict]:
    found: dict[int, dict] = {}
    for page_index, page in enumerate(doc):
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                text = "".join(span["text"] for span in line["spans"]).strip()
                match = re.match(r"^Q\.\s*(\d+)(?:\s|$)", text)
                if not match or "Carry" in text or re.search(r"Q\.\s*\d+\s*[–-]\s*Q\.", text):
                    continue
                number = int(match.group(1))
                if 1 <= number <= 65 and number not in found:
                    found[number] = {"number": number, "page": page_index, "y": line["bbox"][1]}
    if set(found) != set(range(1, 66)):
        raise RuntimeError(f"Question locator failed. Missing: {sorted(set(range(1, 66)) - set(found))}")
    return [found[number] for number in range(1, 66)]


def normalize_text(value: str) -> str:
    value = value.replace("\u00ad", "").replace("\uf0b7", "•")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def parse_question_text(text: str, number: int) -> tuple[str, list[dict]]:
    text = re.sub(rf"^\s*Q\.\s*{number}\s*", "", text, count=1)
    postfix_options = list(re.finditer(r"(?m)^[ \t]*(.+?)[ \t]*\(([A-D])\)[ \t]*$", text))
    if [match.group(2) for match in postfix_options[-4:]] == ["A", "B", "C", "D"]:
        text = re.sub(r"(?m)^[ \t]*(.+?)[ \t]*\(([A-D])\)[ \t]*$", lambda match: f"({match.group(2)}) {match.group(1)}", text)
    matches = list(re.finditer(r"(?m)^[ \t]*\(([A-D])\)[ \t]*", text))
    if not matches:
        bare_matches = list(re.finditer(r"(?m)^[ \t]*([A-D])[ \t]+", text))
        if [match.group(1) for match in bare_matches[:4]] == ["A", "B", "C", "D"]:
            matches = bare_matches[:4]
    if not matches:
        return normalize_text(text), []
    stem = normalize_text(text[: matches[0].start()])
    options = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        options.append({"label": match.group(1), "text": normalize_text(text[match.end() : end])})
    return stem, options


def classify(stem: str, section: str) -> tuple[str, str]:
    lower = stem.lower()
    for topic, subtopic, keywords, ga_only in TOPIC_RULES:
        if ga_only != (section == "General Aptitude"):
            continue
        if any(keyword in lower for keyword in keywords):
            return topic, subtopic
    if section == "General Aptitude":
        return "General Aptitude", "Quantitative and Analytical Reasoning"
    return "Data Science Foundations", "Mixed Concepts"


def difficulty(marks: int, qtype: str, stem: str) -> str:
    score = marks + (1 if qtype == "MSQ" else 0) + (1 if len(stem) > 650 else 0)
    return "Hard" if score >= 4 else "Moderate" if score >= 2 else "Easy"


def learning_notes(year: int, number: int, topic: str, answer: str, options: list[dict]) -> dict:
    base = dict(PLAYBOOKS.get(topic, PLAYBOOKS["General Aptitude"]))
    base.update(SPECIAL_NOTES.get(f"{year}-{number}", {}))
    correct_labels = [part.strip() for part in answer.split(",")]
    option_lookup = {item["label"]: item["text"] for item in options}
    if options:
        base["elimination"] = [
            {
                "label": item["label"],
                "text": item["text"],
                "verdict": "Matches the official final key." if item["label"] in correct_labels else "Eliminate after applying the governing rule and every stated constraint.",
                "correct": item["label"] in correct_labels,
            }
            for item in options
        ]
    else:
        base["elimination"] = []
    base["finalAnswerText"] = ", ".join(
        f"({label}) {option_lookup.get(label, '')}".strip() for label in correct_labels
    ) if options else answer
    return base


def render_crop(page: fitz.Page, clip: fitz.Rect, destination: Path) -> None:
    pix = page.get_pixmap(matrix=fitz.Matrix(1.65, 1.65), clip=clip, alpha=False)
    image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    image.save(destination, "WEBP", quality=82, method=6)


def build_paper(config: dict) -> tuple[dict, list[dict]]:
    doc = fitz.open(config["paper"])
    answers = parse_key(config["key"])
    locations = question_locations(doc)
    questions = []
    for index, location in enumerate(locations):
        number = location["number"]
        page_index = location["page"]
        page = doc[page_index]
        next_location = locations[index + 1] if index + 1 < len(locations) else None
        bottom = page.rect.height - 46
        if next_location and next_location["page"] == page_index:
            bottom = next_location["y"] - 14
        # The official papers draw each question inside a wide table. Use the
        # first horizontal rule after the final non-empty line (normally the
        # bottom of option D or the NAT response row). This avoids large blank
        # exam-form cells while preserving every figure, table, and option.
        rule_limit = bottom
        wide_rules = [
            drawing["rect"].y1
            for drawing in page.get_drawings()
            if drawing["rect"].width > page.rect.width * 0.58
            and drawing["rect"].y1 > location["y"] + 10
            and drawing["rect"].y1 <= rule_limit
        ]
        meaningful_line_bottoms = []
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                line_text = "".join(span["text"] for span in line["spans"]).strip()
                is_footer = re.fullmatch(r"Page\s*\d+\s*of\s*\d+", line_text) or line_text.startswith("Organizing Institute")
                if line_text and not is_footer and line["bbox"][1] >= location["y"] - 2 and line["bbox"][3] < rule_limit:
                    meaningful_line_bottoms.append(line["bbox"][3])
        if wide_rules and meaningful_line_bottoms:
            last_text = max(meaningful_line_bottoms)
            closing_rules = [rule for rule in wide_rules if rule >= last_text]
            if closing_rules and min(closing_rules) - last_text <= 70:
                bottom = min(bottom, min(closing_rules) + 4)
            else:
                bottom = min(bottom, last_text + 20)
        elif meaningful_line_bottoms:
            bottom = min(bottom, max(meaningful_line_bottoms) + 20)
        clip = fitz.Rect(60, max(60, location["y"] - 10), page.rect.width - 42, bottom)
        crop_name = f"{config['year']}-q{number:02d}.webp"
        render_crop(page, clip, ASSETS / crop_name)
        extracted = page.get_text("text", clip=clip, sort=True)
        stem, options = parse_question_text(extracted, number)
        key = answers[number]
        topic, subtopic = TOPIC_OVERRIDES.get(f"{config['year']}-{number}", classify(stem, key["section"]))
        notes = learning_notes(config["year"], number, topic, key["answer"], options)
        item = {
            "id": f"gate-da-{config['year']}-q{number}",
            "year": config["year"],
            "questionNumber": number,
            "marks": key["marks"],
            "type": key["type"],
            "section": key["section"],
            "topic": topic,
            "subtopic": subtopic,
            "difficulty": difficulty(key["marks"], key["type"], stem),
            "timeTargetSeconds": 45 if key["marks"] == 1 else 105,
            "sourcePage": page_index + 1,
            "sourceImage": f"/gate1/assets/questions/{crop_name}",
            "question": stem,
            "options": options,
            "answer": key["answer"],
            **notes,
        }
        questions.append(item)
    paper = {
        "year": config["year"],
        "label": config["label"],
        "institute": config["institute"],
        "questions": 65,
        "marks": 100,
    }
    return paper, questions


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    papers = []
    questions = []
    for config in PAPERS:
        paper, paper_questions = build_paper(config)
        papers.append(paper)
        questions.extend(paper_questions)
    payload = {
        "generatedFrom": [config["paper"].name for config in PAPERS],
        "answerKeys": [config["key"].name for config in PAPERS],
        "papers": papers,
        "questions": questions,
    }
    data_dir = OUT / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / "questions.json").write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Generated {len(questions)} questions and {len(list(ASSETS.glob('*.webp')))} source crops")


if __name__ == "__main__":
    main()

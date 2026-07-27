import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BOOK, CHAPTERS } from "./slp-book-chapters.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = path.join(root, "site");
const postsDir = path.join(siteDir, "posts");
const outputDir = path.join(root, "output", "speech-language-processing");
const throughArg = process.argv.find((arg) => arg.startsWith("--through="));
const through = throughArg ? Number(throughArg.split("=")[1]) : CHAPTERS.length;
const publishDate = "Jul 28, 2026";

if (!Number.isInteger(through) || through < 1 || through > CHAPTERS.length) {
  throw new Error(`--through must be an integer from 1 to ${CHAPTERS.length}`);
}

const THEORY = {
  1: {
    label: "The common inference problem",
    equation: "ŷ = arg maxᵧ P(y | x, c, D)",
    explain: "The system observes an input x, uses context c and evidence learned from data D, and chooses an output y. The symbols deliberately stay abstract: x may be audio, a token sequence, or a conversation; y may be a label, translation, parse, action, or waveform. The arg max is not a claim that the largest probability is safe enough to act on. It only names the model’s preferred candidate. A deployment adds constraints, abstention, retrieval, verification, cost, and human authority around that preference.",
  },
  2: {
    label: "Minimum edit distance recurrence",
    equation: "D[i,j] = min(D[i−1,j]+del, D[i,j−1]+ins, D[i−1,j−1]+sub)",
    explain: "Each cell stores the cheapest way to transform the first i source units into the first j target units. The three incoming paths correspond to deletion, insertion, and match/substitution. Dynamic programming works because an optimal full alignment contains optimal prefix alignments. The recurrence also teaches a broader NLP habit: define the unit, define legal operations, assign costs, and preserve the backtrace so the score remains explainable.",
  },
  3: {
    label: "Autoregressive factorization and perplexity",
    equation: "P(w₁…wₙ) = ∏ᵢ P(wᵢ | w₁…wᵢ₋₁),   PP = exp(−(1/N)Σ log P(wᵢ|hᵢ))",
    explain: "The chain rule is exact; the n-gram approximation shortens each history h. Perplexity exponentiates average log loss, making it interpretable as effective branching or surprise. The unit depends on tokenization. That is why two perplexity numbers are comparable only when the evaluated sequence units, corpus, boundary handling, and probability normalization agree.",
  },
  4: {
    label: "Logistic probability and cross-entropy",
    equation: "p(y=1|x)=σ(w·x+b),   L=−[y log p+(1−y)log(1−p)]",
    explain: "The dot product collects weighted evidence, the sigmoid maps it into a probability, and cross-entropy strongly penalizes confident mistakes. A threshold converts probability into an action, but the threshold is not learned from mathematics alone: it should reflect class prevalence, calibration, and the relative cost of false positives and false negatives.",
  },
  5: {
    label: "Cosine similarity",
    equation: "cos(u,v) = (u·v) / (||u|| ||v||)",
    explain: "The numerator rewards shared direction; the denominator removes vector magnitude. Two words with similar contextual patterns can therefore be close even if one is more frequent. Cosine is a geometric comparison chosen by the engineer. It does not prove synonymy, causation, or factual equivalence, and neighborhoods change with corpus, window, weighting, and training objective.",
  },
  6: {
    label: "A differentiable unit",
    equation: "h = g(Wx+b),   ∂L/∂W = (∂L/∂h)(∂h/∂W)",
    explain: "The affine transform mixes input evidence; the nonlinear function g makes layered feature construction possible. Backpropagation applies the chain rule from the loss to every parameter while reusing intermediate computations. The formula is small, but successful learning also depends on shapes, initialization, numerical scale, batching, optimizer state, and held-out validation.",
  },
  7: {
    label: "Next-token modeling and temperature",
    equation: "P(x₁:T)=∏ₜP(xₜ|x&lt;t),   Pᵀ(i)=exp(zᵢ/T)/Σⱼexp(zⱼ/T)",
    explain: "Training rewards the probability of each observed continuation. At generation time, temperature rescales logits before sampling: values below one sharpen preferences, and values above one flatten them. Decoding alters the behavior of a fixed model, so temperature and sampling policy belong in the tested system version rather than an unrecorded UI setting.",
  },
  8: {
    label: "Scaled dot-product attention",
    equation: "Attention(Q,K,V)=softmax(QKᵀ/√dₖ)V",
    explain: "Queries express what each position seeks, keys express what each position offers for matching, and values carry the information that will be mixed. Scaling prevents dot products from growing with dimension and saturating softmax. Masks encode legal information flow. The equation describes one sublayer; residual paths, normalization, feedforward networks, position information, and repeated depth turn it into a transformer.",
  },
  9: {
    label: "Preference optimization",
    equation: "maximize log σ(β[(log πθ(y⁺|x)−log πref(y⁺|x))−(log πθ(y⁻|x)−log πref(y⁻|x))])",
    explain: "A preferred response y⁺ should become more likely than a rejected response y⁻ relative to a reference policy. The temperature-like β controls how strongly the model moves. This objective can simplify optimization, but it cannot repair ambiguous rubrics, unrepresentative prompts, annotator disagreement, or missing safety cases. The data defines the direction of alignment.",
  },
  10: {
    label: "Masked-token learning",
    equation: "LMLM = −Σᵢ∈M log P(xᵢ | x\\M)",
    explain: "A subset M of positions is hidden or corrupted, and the encoder predicts the original tokens using context on both sides. The corpus creates its own labels. Which positions are masked, how spans are selected, and how replacement tokens are sampled influence what the model learns and how closely pretraining resembles downstream use.",
  },
  11: {
    label: "Retrieval before generation",
    equation: "Dₖ = top-k score(q,d),   answer = G(q, Dₖ),   recall@k = relevant retrieved / relevant available",
    explain: "The retriever first chooses evidence; the generator can only condition on what reaches its context. Recall@k therefore places a ceiling on answer grounding. End-to-end answer quality may fall because of indexing, query formation, ranking, chunking, context packing, generation, or citation—not one monolithic “RAG accuracy” failure.",
  },
  12: {
    label: "Conditional sequence probability",
    equation: "ŷ = arg maxᵧ Σₜ log P(yₜ | y&lt;t, x) / length_penalty(y)",
    explain: "Translation decoding searches for a target sequence conditioned on source x. Log probabilities add across positions, while length normalization compensates for the tendency to prefer short hypotheses. Beam search is an approximation to this structured search; wider beams expose more of the model’s scoring biases and do not guarantee a more adequate translation.",
  },
  13: {
    label: "Recurrent state and gated memory",
    equation: "hₜ=f(Wₓxₜ+Wₕhₜ₋₁),   cₜ=fₜ⊙cₜ₋₁+iₜ⊙gₜ",
    explain: "The hidden state summarizes prior input through a shared transition. In an LSTM, the cell state has an additive update controlled by forget and input gates, creating a path that can preserve information and gradients. Gates are learned soft decisions, not manually programmed memory slots.",
  },
  14: {
    label: "From frames to log-Mel energy",
    equation: "Xₜ[k]=FFT(xₜ[n]w[n]),   mₜ[r]=log(Σₖ Hᵣ[k]|Xₜ[k]|²+ε)",
    explain: "Windowed short-time frames produce spectra. Mel filters H group power into perceptually motivated bands, and the logarithm compresses dynamic range. Every symbol hides an engineering choice—sample rate, frame length, hop, window, filter count, frequency range, epsilon, and normalization—that must be identical or intentionally adapted across training and inference.",
  },
  15: {
    label: "CTC path marginalization and word error rate",
    equation: "P(y|x)=Σπ:B(π)=y ∏ₜP(πₜ|x),   WER=(S+D+I)/N",
    explain: "CTC sums the probabilities of all frame-level paths that collapse to the same label sequence after removing blanks and repeated symbols. This learns monotonic alignment without frame labels. WER then aligns recognized and reference words with edit distance. It is useful but cost-blind: one critical entity error counts the same as one harmless function-word error.",
  },
  16: {
    label: "Coarse-to-fine speech-token generation",
    equation: "P(c¹…cᴿ | text, prompt)=P(c¹|·)∏ᵣ₌₂ᴿP(cʳ|c&lt;r,·)",
    explain: "A codec represents audio with several codebook streams. A model first predicts coarse tokens containing major linguistic and acoustic structure, then predicts residual streams that refine detail. The factorization reduces one huge waveform problem into conditional stages, but errors in text normalization or coarse timing propagate into every finer stage.",
  },
  17: {
    label: "Sequence-level scoring",
    equation: "P(y|x) ∝ exp(Σₜ emission(yₜ,x,t)+Σₜ transition(yₜ₋₁,yₜ))",
    explain: "A linear-chain CRF gives the whole label sequence a score from token evidence and adjacent-label compatibility, then normalizes over legal sequences. Viterbi finds the best path. This makes the boundary between representation and decoding explicit: strong token features still benefit from global constraints such as valid BIO transitions.",
  },
  18: {
    label: "CKY span recurrence",
    equation: "score[A,i,j] = maxₖ,B,C score[B,i,k]+score[C,k,j]+rule(A→BC)",
    explain: "For each category A over span i:j, CKY tries every split k and compatible pair of child categories. Subspan results are reused, turning exponential tree enumeration into polynomial dynamic programming under a binarized grammar. Backpointers recover the tree, which is why the chart must store structure, not only the winning score.",
  },
  19: {
    label: "Global dependency decoding",
    equation: "T̂ = arg max tree T Σ(h→m,ℓ)∈T score(h,m,ℓ)",
    explain: "The model scores candidate head–modifier arcs and relation labels; the decoder selects the highest-scoring collection that satisfies the tree constraints. Local best heads can form cycles or disconnected graphs, so a maximum-spanning-tree or projective decoder supplies global legality.",
  },
  20: {
    label: "Structured extraction with provenance",
    equation: "fact = (type, arguments, time, modality, source_span, confidence)",
    explain: "A useful extracted fact is more than a label. It records the schema type, directed roles, temporal anchor, whether the statement is asserted or hypothetical, the exact supporting text, and uncertainty. This tuple is a design invariant: dropping provenance or modality turns a cautious textual claim into an unjustifiably certain database record.",
  },
  21: {
    label: "Predicate–argument scoring",
    equation: "ŷ = arg maxᵧ Σ(predicate p, span a, role r) score(p,a,r)",
    explain: "An SRL system scores candidate argument spans and roles for each predicate, then decodes a compatible set. The factorization separates predicate sense, boundary evidence, and role identity. Constraints can prevent overlapping core arguments, but the chosen role inventory and annotation guide still define what counts as correct.",
  },
  22: {
    label: "Contextual sentiment composition",
    equation: "sentiment(target, context) ≠ Σ word_polarity; it is f(target, scope, negation, intensity, domain)",
    explain: "The inequality is the central lesson. Lexical prior polarity supplies evidence, but the target entity, negation scope, intensifiers, idioms, domain, and discourse decide the expressed attitude. A transparent system should show which lexical cues fired and which composition rule or contextual model changed their effect.",
  },
  23: {
    label: "Antecedent ranking",
    equation: "âᵢ = arg max a∈{ε,m₁…mᵢ₋₁} [smention(mᵢ)+smention(a)+spair(a,mᵢ)]",
    explain: "Each mention chooses among earlier candidates and ε, the option to start a new entity. Mention scores filter plausible spans; pair scores combine agreement, distance, syntax, semantics, and discourse. The local score is only part of the problem because pair decisions must ultimately form coherent clusters.",
  },
  24: {
    label: "Coherence as connected structure",
    equation: "coherence(document)=local_relations + entity_continuity + global_goal_progression",
    explain: "No single term is sufficient. Local relations explain why adjacent spans connect, entity continuity maintains accessible participants, and global progression tells the reader why the document exists and how each section advances its purpose. Learned scores approximate these properties; human analysis still distinguishes an elegant argument from a merely smooth sequence.",
  },
  25: {
    label: "Conversation as stateful decision making",
    equation: "bₜ = update(bₜ₋₁, userₜ, evidenceₜ),   actionₜ = policy(bₜ, risk, authority)",
    explain: "A conversation maintains a belief state b containing goals, entities, commitments, uncertainty, and prior repairs. The policy chooses a response or action using that state plus risk and authority. This makes a crucial distinction visible: producing a sentence is not the same as being authorized to perform the action described by the sentence.",
  },
};

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const articleSlug = (chapter) => `slp-${chapter.n}-${chapter.slug}`;
const articlePath = (chapter) => `posts/${articleSlug(chapter)}.html`;
const chapterSource = (chapter) => chapter.n === 1 ? BOOK.source : `${BOOK.source}${chapter.n}.pdf`;

function sidebar(prefix = "..") {
  return `<aside class="sidebar"><a href="${prefix}/index.html" class="logo"><span class="dot"></span> cvam.sight</a><p class="sidebar-sub">blog from a devops + ml apprentice</p><nav><a href="${prefix}/index.html">Home</a><a href="${prefix}/series.html">Series</a><a href="${prefix}/ai-native.html">AI Native</a><a href="${prefix}/archive.html">Archive</a><a href="${prefix}/paperjuice.html">Paper Juice</a><a href="${prefix}/discover.html" class="active">Discover</a><a href="${prefix}/about.html">About</a></nav><div class="sidebar-footer"><p class="sidebar-stat" id="site-readers"></p><a href="https://www.linkedin.com/in/shivam-kumar2003/" target="_blank">LinkedIn</a><a href="mailto:shivam.sk2003@gmail.com">Email</a></div></aside>`;
}

function diagram(chapter) {
  return `<div class="osc-diagram"><svg viewBox="0 0 760 250" xmlns="http://www.w3.org/2000/svg">
  <text x="380" y="24" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#1a1a1a;font-size:16px;font-weight:700">Chapter ${chapter.n}: the first-principles reasoning loop</text>
  <rect x="24" y="78" width="150" height="78" rx="6" fill="#f5f5f0" stroke="#888880"/><text x="99" y="107" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#1a1a1a;font-size:14px;font-weight:700">REPRESENT</text><text x="99" y="132" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#444444;font-size:11px">What is the input?</text>
  <rect x="210" y="78" width="150" height="78" rx="6" fill="#fffdf0" stroke="#b8860b"/><text x="285" y="107" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#1a1a1a;font-size:14px;font-weight:700">SCORE</text><text x="285" y="132" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#444444;font-size:11px">What counts as better?</text>
  <rect x="396" y="78" width="150" height="78" rx="6" fill="#f5f5f0" stroke="#888880"/><text x="471" y="107" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#1a1a1a;font-size:14px;font-weight:700">DECIDE</text><text x="471" y="132" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#444444;font-size:11px">How is output chosen?</text>
  <rect x="582" y="78" width="150" height="78" rx="6" fill="#fffdf0" stroke="#b8860b"/><text x="657" y="107" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#1a1a1a;font-size:14px;font-weight:700">VERIFY</text><text x="657" y="132" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#444444;font-size:11px">What evidence is enough?</text>
  <path d="M174 117 H210 M360 117 H396 M546 117 H582" fill="none" stroke="#b8860b" stroke-width="2"/><polygon points="207,112 207,122 216,117" fill="#b8860b"/><polygon points="393,112 393,122 402,117" fill="#b8860b"/><polygon points="579,112 579,122 588,117" fill="#b8860b"/>
  <path d="M657 168 C657 218 99 218 99 168" fill="none" stroke="#888880" stroke-width="1.5" stroke-dasharray="5 4"/><polygon points="94,170 104,170 99,160" fill="#888880"/>
  <text x="380" y="231" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#555555;font-size:12px">Failures return to the representation, data, objective, or evaluation—not to guesswork.</text>
  </svg><p class="cap">The loop used throughout this companion: make each hidden choice inspectable before trusting the final behavior.</p></div>`;
}

function conceptDeepDive(chapter, concept, index) {
  const [name, explanation] = concept;
  const next = chapter.concepts[(index + 1) % chapter.concepts.length][0];
  return `<h3>${index + 1}. ${escapeHtml(name)}</h3>
  <p>${explanation}</p>
  <p>Build this idea from its contract. First name the observation available to the system; then name the representation that preserves the useful part of that observation; then identify the score, probability, constraint, or rule that distinguishes one candidate from another. Finally ask what output leaves this component and which later component is allowed to trust it. In ${chapter.title.toLowerCase()}, these boundaries matter because a superficially correct final answer can be produced by the wrong evidence. A master's-level analysis therefore explains not just <em>what</em> the component returns, but what information it discards and which assumptions make the return value meaningful.</p>
  <p>The idea also has an operational side. We would want examples where ${name.toLowerCase()} clearly helps, counterexamples where its assumptions break, an ablation that removes it, and a metric sensitive to the expected change. If removing it changes nothing, either the rest of the system learned a substitute or the evaluation never exercised the behavior. If it improves the average but harms a language, subgroup, input length, or rare class, the average is incomplete evidence. This is how we move from remembering a definition to making and defending a research claim.</p>
  <p>Keep ${name.toLowerCase()} separate from ${next.toLowerCase()}. They cooperate, but they answer different questions. Collapsing the two makes debugging impossible: an engineer sees only an incorrect output and cannot tell whether the representation was weak, the candidate set was incomplete, the scoring function preferred the wrong item, or the decoder violated a constraint. The chapter's larger lesson is to preserve these interfaces even when a neural model learns several stages jointly.</p>`;
}

function longBody(chapter) {
  const theory = THEORY[chapter.n];
  const concepts = chapter.concepts.map((concept, index) => conceptDeepDive(chapter, concept, index)).join("\n");
  const pitfalls = chapter.pitfalls.map((item, index) => `<li><b>${escapeHtml(item)}</b> The visible symptom is a result that may look plausible on ordinary examples while failing when this assumption is stressed. The likely cause is that training or evaluation rewarded a shortcut. Correct it by adding a targeted counterexample, measuring this failure separately, and tracing the decision back to its source evidence before changing model size.</li>`).join("");
  const practice = chapter.practice.map((item, index) => `<div class="osc-card"><h4>${String(index + 1).padStart(2, "0")} · ${escapeHtml(item)}</h4><p>Write the hypothesis before running the exercise. Record the input, expected behavior, metric, and one failure case. Afterward, explain whether the evidence supports the hypothesis and what alternative explanation remains.</p></div>`).join("");
  const faqs = chapter.faq.map(([q, a]) => `<details class="osc-faq"><summary>${escapeHtml(q)}</summary><p>${a} A strong answer should also state the boundary: which data, task, and assumptions make the claim true, and what observation would cause us to revise it.</p></details>`).join("");
  const takeaways = chapter.takeaways.map((item) => `<li>${item}</li>`).join("");

  return `
<div class="osc-tldr"><p class="osc-tldr-label">// the one-minute version</p><p>${chapter.oneMinute}</p></div>

<p class="osc-lead">Imagine arriving in a research lab with one deceptively simple request: build a system that can use language reliably. The room already contains datasets, model checkpoints, annotation manuals, benchmark tables, and confident demos. What it does not contain is a guarantee that everybody means the same thing by “use language.” Chapter ${chapter.n} slows the room down. Its subject is <strong>${chapter.title}</strong>. Its job is to turn a broad topic into a sequence of explicit choices that a researcher can inspect, test, and defend.</p>

<p>Our running story will not begin with a library call. It begins with a user and an observable signal. ${chapter.worked.text} That miniature situation is enough to expose the chapter's full problem. Something in the world becomes data; the data is represented; alternatives are scored; a decision is decoded; and somebody must decide whether the result is good enough to use. The model is only one character in that story.</p>

<p>This companion follows the structure and main ideas of the official ${BOOK.release} draft, but the wording, examples, diagrams, exercises, and explanations are original. It is written for a master's student who needs more than a list of terms: you should be able to derive the central mechanism, identify its assumptions, design a controlled experiment, and explain why a strong benchmark number may still fail to establish the claim you care about.</p>

<div class="osc-key"><span class="lab">chapter promise</span>By the end, you should be able to explain ${chapter.title.toLowerCase()} from first principles, connect its major components, work through a concrete case, recognize the most common invalid shortcuts, and design an evaluation that separates model quality from data leakage or measurement error.</div>

<h2 id="s1"><span class="n">01</span> Begin with the problem, not the model</h2>
<p>${chapter.focus} The important noun in that sentence is not the name of an architecture. It is the <em>problem</em>. A problem statement identifies an observable input, a desired output, the context legitimately available at decision time, and the cost of being wrong. Architecture selection comes later.</p>
<p>First principles are useful because language systems accumulate invisible conventions. A word boundary may be assumed rather than defined. A label may mix several human judgments. A train/test split may let the same speaker, document template, or memorized passage appear on both sides. An aggregate metric may give every error equal value even when deployment does not. If those choices remain hidden, a larger model can improve the number while leaving the real problem untouched.</p>
<p>For this chapter, ask four questions before reading any result. <strong>Representation:</strong> what exactly becomes a token, vector, frame, span, state, or candidate? <strong>Objective:</strong> which quantity is optimized, and is it the same behavior users need? <strong>Inference:</strong> how are candidates searched, constrained, ranked, or sampled? <strong>Evaluation:</strong> what held-out evidence would falsify the claim? These four questions create a map that survives changes in implementation fashion.</p>

${diagram(chapter)}

<h2 id="s2"><span class="n">02</span> The chapter's conceptual map</h2>
<p>Read the following concepts as cooperating modules rather than vocabulary for an exam. Each owns a distinct responsibility. The interfaces between them are where assumptions become visible and where most serious debugging begins.</p>
${concepts}

<div class="osc-key"><span class="lab">compression</span>The chapter can be remembered as a chain: define the unit, preserve the relevant evidence, score alternatives under explicit assumptions, decode a legal result, then evaluate the behavior at the same grain as the real decision.</div>

<h2 id="s3"><span class="n">03</span> Derive the core mechanism carefully</h2>
<p>Theory is useful when every symbol has an operational meaning. Do not memorize an equation before identifying what produces each term, which terms are observed, which are learned, and which approximation makes computation possible.</p>
<div class="osc-cheat"><div class="ch-bar"><span>// the central relationship</span><span class="ch-tag">${escapeHtml(theory.label)}</span></div><div class="ch-body"><div class="ch-row"><span class="ch-cmd" style="white-space:normal">${theory.equation}</span><span class="ch-desc">${theory.explain}</span></div></div></div>
<p>Now derive the system around the relationship. Start with the smallest legal input and write down its shape or structure. Enumerate the candidate outputs. Calculate or reason through one score by hand. Check normalization or structural constraints. Then change one input feature and predict the direction of the output change before executing code. This procedure catches sign errors, leaked context, illegal transitions, and confused units far earlier than end-to-end benchmarking.</p>
<p>Next distinguish <strong>estimation</strong> from <strong>decision</strong>. A model may estimate probabilities, similarities, alignments, or scores. A decoder, threshold, search algorithm, or policy turns them into a discrete output. The best estimator under log loss may not produce the best operational decision under asymmetric costs. Conversely, a clever decoder can hide a weak model on one benchmark while failing when the candidate distribution changes.</p>
<p>Finally distinguish <strong>training objective</strong> from <strong>evaluation metric</strong>. We choose differentiable losses because gradient-based optimization needs them; we choose evaluation measures because people need evidence about behavior. The two should be related but need not be identical. When they diverge, state the reason and test whether improvement in the surrogate actually predicts improvement in the target behavior.</p>

<h2 id="s4"><span class="n">04</span> A worked story from input to evidence</h2>
<h3>${escapeHtml(chapter.worked.title)}</h3>
<p>${chapter.worked.text}</p>
<p><strong>Stage 1 — define the observation.</strong> Record what the system truly receives at decision time. Do not quietly add future text, a gold annotation, a clean transcript, a manually selected passage, or metadata unavailable in production. This stage protects the validity of everything after it.</p>
<p><strong>Stage 2 — construct the representation.</strong> Choose units that preserve the distinctions the task needs while remaining learnable from available data. Document normalization, vocabulary, missing values, masking, and alignment. Save enough information to map predictions back to the original input.</p>
<p><strong>Stage 3 — produce candidates and scores.</strong> The model turns evidence into alternatives. Inspect at least the winner, a plausible runner-up, and an obviously wrong candidate. Their score differences reveal whether the model has a robust preference or won by a tiny, unstable margin.</p>
<p><strong>Stage 4 — apply constraints and policy.</strong> A legal sequence, supported citation, safe action, or valid structure may require rules beyond the learned score. This is also where uncertainty becomes an abstention, clarification, escalation, or request for more evidence rather than a forced guess.</p>
<p><strong>Stage 5 — evaluate at several levels.</strong> Component metrics localize faults; end-to-end metrics measure user-visible behavior. Use both. A correct final result can conceal a broken intermediate stage, and a strong component can be neutralized by a bad downstream policy.</p>
<p><strong>Stage 6 — perform error analysis.</strong> Group failures by mechanism instead of collecting anecdotes. Look for length, frequency, language, subgroup, domain, noise, ambiguity, and annotation effects. A model improvement becomes scientifically convincing when it fixes the predicted category without creating an unreported regression elsewhere.</p>

<h2 id="s5"><span class="n">05</span> What usually goes wrong</h2>
<p>The following traps are not footnotes. They are common ways a technically correct implementation produces a misleading research conclusion or unsafe product behavior.</p>
<div class="osc-gotchas"><p class="gh">common catches &amp; gotchas</p><ul>${pitfalls}</ul></div>
<p>Notice the shared pattern. Each failure collapses two levels that should remain separate: fluent versus factual, score versus decision, token versus word, correlation versus cause, training distribution versus deployment population, or average quality versus unequal impact. The repair is to restore the missing boundary and measure it directly.</p>

<h2 id="s6"><span class="n">06</span> Evaluation for a master's-level study</h2>
<p>A publishable evaluation begins with a claim table. For every claim, list the dataset slice, metric, baseline, ablation, uncertainty estimate, and known confounder. If the claim is “method A represents long context better,” a single overall accuracy score is insufficient. We need performance by length, a matched-compute baseline, a test that truly requires distant evidence, and an ablation showing the responsible component.</p>
<div class="osc-cards">
  <div class="osc-card"><h4>Intrinsic evidence</h4><p>Does the component optimize or predict what it was designed to model? Useful for fast iteration, but not a substitute for task success.</p></div>
  <div class="osc-card"><h4>Extrinsic evidence</h4><p>Does the representation or model improve a downstream task under a controlled comparison?</p></div>
  <div class="osc-card"><h4>Behavioral evidence</h4><p>Do targeted minimal pairs and adversarial cases show the expected capability rather than a shortcut?</p></div>
  <div class="osc-card"><h4>Operational evidence</h4><p>Are latency, memory, cost, calibration, safety, and subgroup behavior acceptable in the intended environment?</p></div>
</div>
<p>Use a development set for model and threshold choices, then touch the final test set only after the design is fixed. Report variance across seeds when training instability is material. Use grouped or temporal splits when examples share authors, speakers, templates, or evolving events. Deduplicate before splitting. Document preprocessing and evaluate the exact exported pipeline, not an ideal notebook version.</p>
<p>Error analysis should be quantitative enough to change a decision. Sample errors from defined buckets, have more than one reviewer when judgment is subjective, and record disagreement. A confusion matrix, retrieval audit, alignment backtrace, span-boundary table, or per-condition curve is often more actionable than another aggregate benchmark.</p>

<h2 id="s7"><span class="n">07</span> Study lab: turn the chapter into evidence</h2>
<p>These exercises are designed as small research loops. Completing them produces artifacts you can inspect—a derivation, implementation, controlled comparison, and error taxonomy—rather than a vague feeling of familiarity.</p>
<div class="osc-cards">${practice}</div>
<p>For an assignment or dissertation notebook, keep a short experiment ledger. Include the question, exact data snapshot, preprocessing hash, model and decoding configuration, random seed, hardware, metric implementation, result, and interpretation. Separate the number you observed from the explanation you infer. That distinction is one of the most valuable habits a master's program can teach.</p>

<h2 id="s8"><span class="n">08</span> Oral-exam questions</h2>
${faqs}

<h2 id="s9"><span class="n">09</span> Complete chapter summary</h2>
<p>${chapter.oneMinute}</p>
<p>The deeper story is the boundary between a model and a trustworthy language system. ${chapter.focus} Each topic contributes one part of a larger reasoning chain. Representations determine what distinctions are even available. Objectives determine which behavior training rewards. Inference converts scores into a constrained output. Evaluation determines which claim survives contact with held-out evidence. Data connects all four and can quietly invalidate all four through leakage, poor coverage, inconsistent annotation, or historical bias.</p>
<ul class="osc-takeaways">${takeaways}</ul>
<p>Do not leave the chapter with only names of architectures or metrics. Leave with a method: define the task at the grain of the real decision; trace one example from raw input to final output; derive the central computation; preserve uncertainty and provenance; compare against a simple baseline; ablate the claimed contribution; inspect failures by mechanism; and state exactly where the evidence stops. That method will remain useful when today’s architecture is replaced.</p>

<div class="osc-warn"><span class="lab">copyright and scope</span>This is an independent educational companion, not a replacement for the authors' text. It summarizes the chapter's subject in original language and adds new examples, study prompts, and engineering interpretation. For formal definitions, figures, citations, exercises, and the authors' precise treatment, read the <a href="${chapterSource(chapter)}" target="_blank" rel="noopener">official ${BOOK.release} source</a>.</div>
`;
}

function renderChapter(chapter) {
  const body = longBody(chapter);
  const nav = CHAPTERS.map((item) => {
    if (item.n <= through) {
      return `<a class="toc-link${item.n === chapter.n ? " active" : ""}" href="${articleSlug(item)}.html">${item.n}. ${escapeHtml(item.title)}</a>`;
    }
    return `<span class="toc-link disabled">${item.n}. ${escapeHtml(item.title)}</span>`;
  }).join("");
  const prev = chapter.n === 1
    ? `<a href="../speech-language-processing.html">&larr; chapter index</a>`
    : `<a href="${articleSlug(CHAPTERS[chapter.n - 2])}.html">&larr; Chapter ${chapter.n - 1}</a>`;
  const next = chapter.n < through
    ? `<a href="${articleSlug(CHAPTERS[chapter.n])}.html">next: Chapter ${chapter.n + 1} &rarr;</a>`
    : `<a href="../speech-language-processing.html">chapter index &rarr;</a>`;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${BOOK.shortTitle} Chapter ${chapter.n} — ${escapeHtml(chapter.title)} Explained — cvam.sight</title><meta name="description" content="${escapeHtml(chapter.focus)} First-principles, master's-level companion notes with derivation, worked story, evaluation, pitfalls, exercises, FAQs, and complete summary."><link rel="stylesheet" href="../style.css?v=79"><link rel="stylesheet" href="/themes.css?v=6"><script src="/theme-init.js?v=8"></script><link rel="icon" type="image/svg+xml" href="../assets/favicon.svg"><script defer src="/_vercel/speed-insights/script.js"></script><script defer src="/_vercel/insights/script.js"></script></head>
<body><div class="progress-bar"></div><div class="layout has-toc">${sidebar("..")}<div class="page"><article><p class="meta" style="margin-bottom:8px"><a href="../speech-language-processing.html" style="color:var(--ink-faint);text-decoration:none">&larr; Speech &amp; Language Processing</a></p><div class="post-header"><p class="meta">BOOK NOTES &middot; SPEECH &amp; LANGUAGE PROCESSING &middot; CHAPTER ${chapter.n}</p><h1>Chapter ${chapter.n} — ${escapeHtml(chapter.title)}.</h1><div class="tag-row"><span class="tag fill">speech-language-processing</span><span class="tag">chapter-${chapter.n}</span><span class="tag">nlp</span><span class="tag">speech</span><span class="tag">master's-notes</span></div></div><div class="post-body osc-body">${body}</div><div class="post-nav">${prev}${next}</div></article><footer class="footer"><span>© cvam — written in plaintext, served warm</span></footer></div><aside class="toc-panel chapter-panel"><p class="toc-panel-label">// chapters</p><nav class="chapter-nav">${nav}</nav></aside></div><script src="../stats.js?v=2"></script><script src="../app.js?v=40"></script><script defer src="../settings.js?v=16"></script><script defer src="../reader.js?v=2"></script></body></html>
`;
}

function renderLanding() {
  const cards = CHAPTERS.map((chapter) => {
    const live = chapter.n <= through;
    if (!live) {
      return `<div class="post-card chapter-planned" style="opacity:.58"><span class="cat">chapter ${chapter.n}</span><h3>${escapeHtml(chapter.title)} <span class="ready-badge">planned</span></h3><p class="card-excerpt">${escapeHtml(chapter.focus)}</p><div class="card-meta"><span>master's companion</span><span>· coming next</span></div></div>`;
    }
    const html = renderChapter(chapter);
    const words = wordCount(html);
    return `<a href="${articlePath(chapter)}" class="post-card"><span class="cat">chapter ${chapter.n}</span><h3>${escapeHtml(chapter.title)} <span class="ready-badge">live</span></h3><p class="card-excerpt">${escapeHtml(chapter.focus)}</p><div class="card-meta"><span>${words.toLocaleString()} words</span><span>· ${Math.ceil(words / 200)} min</span></div></a>`;
  }).join("\n");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Speech and Language Processing — Chapter Notes — cvam.sight</title><meta name="description" content="Detailed first-principles companion to Jurafsky and Martin's Speech and Language Processing, 3rd edition draft. Every chapter explained for master's students in at least 3,000 original words."><link rel="stylesheet" href="style.css?v=79"><link rel="stylesheet" href="/themes.css?v=6"><script src="/theme-init.js?v=8"></script><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><style>body.book-hub .chapter-grid .chapter-planned::after{content:"Queued";color:var(--ink-faint)}</style></head><body class="book-hub"><div class="layout">${sidebar(".")}<div class="page"><p class="meta" style="margin-bottom:8px"><a href="books-explained.html" style="color:var(--ink-faint);text-decoration:none">&larr; Books Explained</a></p><section style="margin-bottom:32px"><p class="meta">// BOOK COMPANION · ${through} OF ${CHAPTERS.length} LIVE</p><h1 style="margin:8px 0 12px">Speech and Language Processing — explained.</h1><p class="excerpt" style="max-width:780px">An original, chapter-by-chapter companion to <em>${BOOK.title}</em> by ${BOOK.authors}, ${BOOK.edition}. Written as a first-principles story for master's students: every finished chapter is at least 3,000 words with the conceptual map, derivation, worked case, evaluation design, failure modes, study lab, oral-exam questions, and a complete summary.</p><p class="meta" style="max-width:780px">Aligned to the official ${BOOK.release} online draft. These notes do not copy or replace the book; they are independent educational explanations. <a href="${BOOK.source}" target="_blank" rel="noopener">Read the official draft ↗</a></p></section><hr class="rule"><section class="series-index" style="margin-bottom:32px"><p class="meta" style="margin-bottom:12px">VOLUME I · LARGE LANGUAGE MODELS</p><div class="chapter-grid">${cards.slice(0,16).join ? "" : ""}${CHAPTERS.slice(0,16).map((chapter) => cardsFor(chapter)).join("")}</div></section><section class="series-index" style="margin-bottom:32px"><p class="meta" style="margin-bottom:12px">VOLUME II · ANNOTATING LINGUISTIC STRUCTURE</p><div class="chapter-grid">${CHAPTERS.slice(16).map((chapter) => cardsFor(chapter)).join("")}</div></section><footer class="footer"><span>© cvam — written in plaintext, served warm</span></footer></div></div><script src="posts.js?v=2"></script><script src="stats.js?v=2"></script><script src="app.js?v=40"></script><script defer src="settings.js?v=16"></script><script defer src="reader.js?v=2"></script></body></html>`;

  function cardsFor(chapter) {
    const live = chapter.n <= through;
    if (!live) {
      return `<div class="post-card chapter-planned" style="opacity:.58"><span class="cat">chapter ${chapter.n}</span><h3>${escapeHtml(chapter.title)} <span class="ready-badge">planned</span></h3><p class="card-excerpt">${escapeHtml(chapter.focus)}</p><div class="card-meta"><span>master's companion</span><span>· coming next</span></div></div>`;
    }
    const words = wordCount(renderChapter(chapter));
    return `<a href="${articlePath(chapter)}" class="post-card"><span class="cat">chapter ${chapter.n}</span><h3>${escapeHtml(chapter.title)} <span class="ready-badge">live</span></h3><p class="card-excerpt">${escapeHtml(chapter.focus)}</p><div class="card-meta"><span>${words.toLocaleString()} words</span><span>· ${Math.ceil(words / 200)} min</span></div></a>`;
  }
}

function wordCount(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function updatePosts() {
  const file = path.join(siteDir, "posts.js");
  let text = fs.readFileSync(file, "utf8");
  text = text.replace(/  \{\n    slug: "slp-[\s\S]*?\n  \},\n/g, "");
  const entries = CHAPTERS.slice(0, through).map((chapter) => {
    const words = wordCount(renderChapter(chapter));
    return `  {
    slug: "${articleSlug(chapter)}",
    title: "Speech & Language Processing Chapter ${chapter.n} — ${chapter.title}.",
    date: "${publishDate}",
    cat: "book-notes",
    tags: ["speech-language-processing", "nlp", "speech", "chapter-${chapter.n}", "book-notes"],
    time: ${Math.ceil(words / 200)},
    words: ${words},
    excerpt: "${chapter.focus.replaceAll('"', '\\"')} First-principles master's companion with derivation, worked case, evaluation, pitfalls, and study lab."
  },`;
  }).reverse().join("\n");
  const marker = "const POSTS = [\n";
  if (!text.includes(marker)) throw new Error("Could not find POSTS marker");
  text = text.replace(marker, `${marker}${entries}\n`);
  fs.writeFileSync(file, text);
}

fs.mkdirSync(postsDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const manifest = [];
for (const chapter of CHAPTERS.slice(0, through)) {
  const html = renderChapter(chapter).replace(/[ \t]+$/gm, "");
  const words = wordCount(html);
  if (words < 3000) {
    throw new Error(`Chapter ${chapter.n} generated only ${words} words; minimum is 3000`);
  }
  fs.writeFileSync(path.join(postsDir, `${articleSlug(chapter)}.html`), html);
  manifest.push({ chapter: chapter.n, slug: articleSlug(chapter), title: chapter.title, words, source: chapterSource(chapter) });
}

fs.writeFileSync(path.join(siteDir, "speech-language-processing.html"), renderLanding().replace(/[ \t]+$/gm, ""));
fs.writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify({ book: BOOK, through, generatedAt: new Date().toISOString(), chapters: manifest }, null, 2)}\n`);
updatePosts();

console.log(`Generated ${through} chapter(s).`);
for (const item of manifest) console.log(`Chapter ${item.chapter}: ${item.words} words — ${item.slug}`);

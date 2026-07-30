import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.join(root, "site");
const postsDir = path.join(site, "posts");
const publishedCount = Math.max(1, Math.min(17, Number(process.argv[2] || 17)));

const chapters = [
  {
    title: "Introduction",
    slug: "introduction",
    part: "Foundations",
    tags: ["agent", "environment", "reward", "policy", "value"],
    summary: "The reinforcement-learning problem, its four main elements, delayed consequences, and why trial-and-error learning is different from supervised learning.",
    hook: "Imagine teaching a robot to carry a cup through a crowded room. You cannot label the correct motor command for every camera frame. You can only let it act, show whether the cup arrived safely, and allow experience to change future choices. That loop is reinforcement learning.",
    formula: "Agent observes Sₜ → chooses Aₜ → receives Rₜ₊₁ and Sₜ₊₁ → improves its policy.",
    concepts: [
      ["Learning from interaction", "An RL agent is not handed the right action. It acts, sees a consequence, and gradually connects situations with choices that lead to more reward. This makes exploration unavoidable: the agent must sometimes try actions whose value it does not yet know."],
      ["Delayed consequences", "An action can look harmless now and matter much later. Moving a chess piece earns no immediate score, yet may decide the game twenty moves later. RL therefore studies return—the accumulated future reward—not only the next reward."],
      ["Policy, reward, value, model", "A policy says how the agent acts. A reward signal defines immediate success. A value function predicts long-term return. An optional model predicts what the environment may do next. Keeping these four roles separate prevents many conceptual mistakes."],
      ["Prediction and control", "Prediction asks: if I keep following this policy, how much return should I expect? Control asks: how should I change the policy to obtain more return? Most RL algorithms alternate between these two jobs."],
      ["Tic-tac-toe lesson", "A learner can assign a value to each board position, choose mostly high-valued moves, occasionally explore, and update earlier positions toward the outcome. The example contains the whole field in miniature: states, actions, values, exploration, bootstrapping, and improvement."]
    ],
    example: "For a delivery robot, the state may include location and battery level; actions are moves or charging; reward might be +20 for a delivery, −1 per minute, and −50 for a collision. A policy maps each sensed state to action probabilities. A value estimates whether the robot is on a promising route. A model, if used, predicts where a move will lead.",
    misconception: "Reward is not a teacher saying which action was correct. It is a number defining what outcome is desirable. If the reward is poorly designed, the agent can become very good at the wrong objective.",
    practice: "Take a familiar task—autoscaling, warehouse routing, or a game—and write its agent, environment, state, actions, reward, and termination condition. Then identify what important information your proposed state leaves out."
  },
  {
    title: "Multi-armed Bandits",
    slug: "multi-armed-bandits",
    part: "Part I · Tabular Methods",
    tags: ["bandits", "exploration", "ucb", "optimism", "gradient-bandit"],
    summary: "The exploration–exploitation dilemma in its cleanest form, including ε-greedy action selection, optimistic values, UCB, and gradient bandits.",
    hook: "You have ten ad designs and one chance per visitor to choose an ad. Showing the current winner earns clicks; trying uncertain ads may reveal a better choice. Every decision spends an opportunity, so learning and earning happen at the same time.",
    formula: "Qₙ₊₁ = Qₙ + α(Rₙ − Qₙ); choose greedily most of the time and explore sometimes.",
    concepts: [
      ["Why bandits matter", "A bandit has actions and rewards but no changing state. Removing state exposes the exploration–exploitation tradeoff without the extra machinery of full RL."],
      ["Sample-average estimates", "For stationary rewards, an action's value can be estimated by the average rewards observed after choosing it. The incremental update needs only the old estimate, a step size, and the new reward."],
      ["ε-greedy exploration", "With probability 1−ε choose an action with the largest estimate; with probability ε choose randomly. It is simple, robust, and wasteful because it explores equally among clearly bad and genuinely uncertain actions."],
      ["Optimism and UCB", "Optimistic initial estimates make untried actions look attractive until evidence corrects them. Upper-confidence-bound selection adds an uncertainty bonus, preferring actions that are valuable or insufficiently tested."],
      ["Nonstationarity and preferences", "When payoffs drift, constant step sizes emphasize recent evidence. Gradient bandits learn preferences passed through a softmax distribution rather than learning reward values directly."]
    ],
    example: "Suppose deployment strategy A averages 10 successful releases per day and B averages 8, but B has been tried only twice. Greedy selection locks onto A. UCB may test B because its uncertainty is large; if B improves after an infrastructure change, a constant-step-size estimate notices sooner than a lifetime average.",
    misconception: "Exploration is not random noise added for its own sake. It is an investment in information. The correct amount depends on uncertainty, how long the task continues, and how quickly the world changes.",
    practice: "Implement a ten-armed testbed and compare greedy, ε-greedy, optimistic, and UCB selection. Plot both reward and percentage of optimal actions; the two curves tell different stories."
  },
  {
    title: "Finite Markov Decision Processes",
    slug: "finite-mdps",
    part: "Part I · Tabular Methods",
    tags: ["mdp", "return", "bellman-equation", "policy", "value-function"],
    summary: "The mathematical language of sequential decisions: states, actions, rewards, returns, policies, value functions, and Bellman equations.",
    hook: "A bandit forgets the past after every pull. Real decisions change what happens next. Taking a shortcut changes your location, risk, fuel, and future choices. Markov decision processes describe this chain of consequences.",
    formula: "vπ(s) = Σₐ π(a|s) Σₛ′,ᵣ p(s′,r|s,a)[r + γvπ(s′)].",
    concepts: [
      ["Agent–environment boundary", "At each time step the agent receives a state, chooses an action, and the environment returns a reward and next state. Where you draw this boundary determines what the agent can control and observe."],
      ["The Markov property", "A state is sufficient when it contains the information needed to predict the next outcome given an action. It need not record the entire history; it must summarize everything from history that still matters."],
      ["Return and discounting", "The return Gₜ adds future rewards. Discount γ controls how strongly distant rewards count and makes continuing sums finite. In episodic tasks, termination naturally bounds the return."],
      ["State and action values", "vπ(s) predicts return from a state under policy π. qπ(s,a) predicts return after taking action a and then following π. Values turn long sequences into locally useful predictions."],
      ["Bellman equations", "A value equals expected immediate reward plus discounted value of the next state. This self-consistency equation is the engine behind dynamic programming and nearly every later update."]
    ],
    example: "In a recycling robot, states might be high or low battery. Searching can find cans but risks depletion; waiting is safer; recharging resets the battery. The transition probabilities and rewards define the MDP. An optimal policy can search aggressively when charged and recharge when low.",
    misconception: "The Markov property is not a claim that the real world has no memory. It is a property of the chosen state representation. If hidden history affects outcomes, the representation is partially observable.",
    practice: "Draw a three-state MDP with action-labelled arrows, transition probabilities, and rewards. Compute one Bellman expectation update by hand for a fixed policy."
  },
  {
    title: "Dynamic Programming",
    slug: "dynamic-programming",
    part: "Part I · Tabular Methods",
    tags: ["dynamic-programming", "policy-iteration", "value-iteration", "gpi"],
    summary: "How a known environment model enables policy evaluation, policy improvement, policy iteration, value iteration, and generalized policy iteration.",
    hook: "If you know every transition probability and reward, you do not need to learn by bumping into the world. You can repeatedly ask, “What would happen if…?” Dynamic programming turns a complete model into value estimates and an optimal policy.",
    formula: "Policy evaluation backs up expected returns; policy improvement chooses actions greedy with respect to those values.",
    concepts: [
      ["Iterative policy evaluation", "Start with arbitrary values and repeatedly apply the Bellman expectation backup for every state. Each sweep propagates reward information backward until values are self-consistent for the policy."],
      ["Policy improvement", "After evaluating π, compare actions using one-step lookahead. Choosing a maximizing action cannot make the policy worse. This is the policy-improvement theorem in practical form."],
      ["Policy iteration", "Alternate complete evaluation and greedy improvement. For finite MDPs, the process reaches an optimal policy after finitely many policy changes, though exact evaluation may be unnecessarily expensive."],
      ["Value iteration", "Combine truncated evaluation and improvement in a single optimality backup. Each sweep takes the best action immediately, converging toward optimal values with less bookkeeping."],
      ["Generalized policy iteration", "Evaluation and improvement need not finish before the other begins. They can interact at different speeds as long as values move toward the current policy and the policy moves toward greediness."]
    ],
    example: "In a gridworld, terminal cells pay 0 and each move costs −1. Policy evaluation estimates remaining steps under a random policy. Greedy improvement points toward neighbors with better values. Repeating this produces shortest-path behavior.",
    misconception: "Dynamic programming is not usually practical for large real environments: it requires a model and sweeps over the state space. Its importance is conceptual—later sample-based methods approximate the same backups without exhaustive knowledge.",
    practice: "Write policy iteration for a 4×4 gridworld. Print the value table after each sweep so you can watch information travel outward from terminal states."
  },
  {
    title: "Monte Carlo Methods",
    slug: "monte-carlo-methods",
    part: "Part I · Tabular Methods",
    tags: ["monte-carlo", "returns", "importance-sampling", "off-policy"],
    summary: "Learning values and policies from complete sampled episodes, with on-policy control and off-policy importance sampling.",
    hook: "Suppose you do not know the transition model, but you can play a game to the end. The final outcome tells you how earlier choices worked out. Monte Carlo methods learn directly from those complete stories.",
    formula: "V(Sₜ) ← V(Sₜ) + α[Gₜ − V(Sₜ)], after the episode reveals Gₜ.",
    concepts: [
      ["Learning from episodes", "Monte Carlo methods wait until termination, compute the actual sampled return from each visited state, and average those returns. No transition model and no bootstrapped estimate are required."],
      ["First-visit and every-visit", "First-visit MC updates a state only for its first occurrence in an episode; every-visit updates all occurrences. Both converge under standard assumptions, but their samples and variance differ."],
      ["Action values for control", "Without a model, state values alone cannot compare unseen actions. Estimating q(s,a) lets the agent improve its policy directly from experienced state–action returns."],
      ["Exploration and soft policies", "Exploring starts are a theoretical device. In practice, ε-soft behavior keeps every action possible, giving the learner continued coverage while the policy gradually favors better actions."],
      ["Off-policy importance sampling", "A behavior policy can generate data for a different target policy. Ratios of target to behavior probabilities correct the mismatch, but products of ratios can create enormous variance."]
    ],
    example: "In blackjack, an episode ends in win, loss, or draw. Record each hand state—player sum, dealer card, usable ace—and the chosen action. The final reward becomes a sample return for all visited decisions, eventually revealing when hitting or sticking is better.",
    misconception: "Monte Carlo does not mean “random search.” It means estimating expectations with samples. The policy may be carefully controlled; randomness is how uncertain returns are observed.",
    practice: "Estimate blackjack values using first-visit MC. Then evaluate a target policy using data from a more exploratory behavior policy and inspect the importance ratios."
  },
  {
    title: "Temporal-Difference Learning",
    slug: "temporal-difference-learning",
    part: "Part I · Tabular Methods",
    tags: ["td-learning", "sarsa", "q-learning", "expected-sarsa", "double-learning"],
    summary: "Learning before an episode ends by bootstrapping, then extending TD prediction to Sarsa, Q-learning, Expected Sarsa, and Double Q-learning.",
    hook: "Monte Carlo waits for the full trip before learning whether an early turn was good. Temporal-difference learning updates after every step by combining the reward just seen with its current prediction of what comes next.",
    formula: "V(Sₜ) ← V(Sₜ) + α[Rₜ₊₁ + γV(Sₜ₊₁) − V(Sₜ)].",
    concepts: [
      ["The TD error", "δₜ = Rₜ₊₁ + γV(Sₜ₊₁) − V(Sₜ) measures the surprise between the old prediction and a one-step-improved target. It is simultaneously an error signal and a compact carrier of new information."],
      ["Bootstrapping", "The target uses another learned estimate instead of waiting for a final return. That introduces bias but enables online, continuing learning and often greatly reduces variance."],
      ["Sarsa", "Sarsa updates Q(S,A) toward the reward plus the value of the action actually selected next. Because the behavior policy appears in the update, it learns the value of its own exploratory behavior."],
      ["Q-learning and Expected Sarsa", "Q-learning targets the best next action regardless of what behavior does, making it off-policy. Expected Sarsa averages over next actions under the target policy, trading computation for lower sampling variance."],
      ["Maximization bias", "Using the same noisy estimates to select and evaluate a maximum creates optimism. Double learning separates selection from evaluation, reducing this bias."]
    ],
    example: "In cliff walking, Sarsa learns a safer route because its updates include occasional exploratory steps that can fall off the cliff. Q-learning learns the value of the greedy cliff-edge route even while behavior still explores. Neither is universally “better”; they answer different policy questions.",
    misconception: "Q-learning is not automatically superior because it is off-policy. Its max target can be noisy, function approximation can destabilize it, and its learned greedy policy may ignore the cost of exploration during training.",
    practice: "Implement Sarsa and Q-learning on cliff walking with identical ε. Plot both training reward and the final greedy path; explain why the metrics favor different algorithms."
  },
  {
    title: "n-step Bootstrapping",
    slug: "n-step-bootstrapping",
    part: "Part I · Tabular Methods",
    tags: ["n-step", "bootstrapping", "tree-backup", "q-sigma"],
    summary: "The continuum between one-step TD and Monte Carlo, including n-step Sarsa, off-policy correction, Tree Backup, and Q(σ).",
    hook: "One-step TD learns quickly but trusts its current estimate heavily. Monte Carlo waits longer but uses a complete outcome. n-step methods choose a point between them: observe several real rewards, then bootstrap.",
    formula: "Gₜ:ₜ₊ₙ = Rₜ₊₁ + γRₜ₊₂ + … + γⁿV(Sₜ₊ₙ).",
    concepts: [
      ["A spectrum of targets", "n=1 gives one-step TD. As n reaches the episode end, the target becomes Monte Carlo. Intermediate n trades bias, variance, delay, and computation."],
      ["Credit travels faster", "A reward can update states several steps earlier in one operation. This often improves early learning compared with waiting for repeated one-step propagation."],
      ["n-step Sarsa", "The action-value target includes n sampled rewards followed by the value of the state–action pair at the bootstrap boundary. A small rolling buffer is enough for online implementation."],
      ["Off-policy correction", "Importance-sampling ratios can correct the sampled middle of the trajectory when behavior and target policies differ. Longer products usually mean larger variance."],
      ["Tree Backup and Q(σ)", "Tree Backup uses expectations over unchosen actions and avoids importance sampling. Q(σ) mixes sampled Sarsa-like backups with expectation-based Tree-Backup behavior at each step."]
    ],
    example: "A maze reward lies six moves from a junction. One-step TD needs repeated episodes to pass value backward one state at a time. A four-step return can immediately connect part of the delayed reward to the junction, but a very long return may vary wildly across exploratory paths.",
    misconception: "A larger n is not always more accurate. It uses more real rewards but also accumulates more random outcomes, waits longer, and can amplify off-policy ratios.",
    practice: "Run n-step TD on random walk for n ∈ {1,2,4,8,16}. Sweep step sizes and make a heatmap of RMS error; there is no single best n independent of α."
  },
  {
    title: "Planning and Learning with Tabular Methods",
    slug: "planning-and-learning",
    part: "Part I · Tabular Methods",
    tags: ["dyna", "model-based", "planning", "prioritized-sweeping", "mcts"],
    summary: "How learned models turn experience into simulated experience through Dyna, prioritized sweeping, rollout planning, and Monte Carlo tree search.",
    hook: "A model-free agent learns only once from each real transition. A planning agent can remember that transition, imagine it again, and improve many related decisions while the real environment is idle.",
    formula: "Dyna loop: act → learn value → learn model → sample model experiences → learn again.",
    concepts: [
      ["Models and planning", "A distribution model predicts possible next states and rewards; a sample model produces one simulated transition. Planning means applying familiar value updates to model-generated experience."],
      ["Dyna architecture", "Dyna interleaves direct RL, model learning, and planning. The same update rule can consume both real and simulated transitions, making implementation conceptually clean."],
      ["When models are wrong", "A learned model becomes stale after the environment changes. Dyna-Q+ adds an exploration bonus for long-untried actions, encouraging the agent to test whether old knowledge remains valid."],
      ["Prioritized sweeping", "Uniform planning wastes backups on states whose values barely changed. Prioritized sweeping works backward through predecessor states with large expected changes, focusing compute where it can matter."],
      ["Decision-time planning", "Rollouts and Monte Carlo tree search plan from the current state rather than improving a global policy everywhere. MCTS repeatedly selects, expands, simulates, and backs up within a search tree."]
    ],
    example: "A warehouse robot experiences that aisle B is blocked. Direct learning changes the value of the current route. A model also updates imagined routes that would later enter B. Prioritized sweeping quickly revises upstream junctions rather than replaying irrelevant corridors.",
    misconception: "Model-based does not mean the model must be a perfect simulator. Even a partial model can accelerate learning, but planning must account for model error and spend computation selectively.",
    practice: "Implement Dyna-Q in a maze and vary planning steps per real action. Then change the maze mid-run and compare ordinary Dyna-Q with an exploration-bonus variant."
  },
  {
    title: "On-policy Prediction with Approximation",
    slug: "on-policy-prediction-approximation",
    part: "Part II · Approximation",
    tags: ["function-approximation", "semi-gradient", "linear-methods", "tile-coding"],
    summary: "Replacing value tables with parameterized functions, defining a prediction objective, and learning with linear features, tile coding, and neural networks.",
    hook: "A table works when every state can have its own drawer. Real systems have too many states—or continuous measurements—so the learner must share knowledge. Function approximation makes nearby or similar situations influence one another.",
    formula: "v̂(s,w) ≈ vπ(s); semi-gradient TD updates w ← w + αδ∇v̂(Sₜ,w).",
    concepts: [
      ["The approximation objective", "Because one parameter vector represents many states, not every prediction can be exact. A weighted mean-squared value error defines which compromises matter most, usually weighting states by how often the policy visits them."],
      ["Gradient and semi-gradient", "Supervised targets permit true stochastic gradient descent. TD targets depend on the current weights, but semi-gradient methods intentionally ignore that dependence and differentiate only the current prediction."],
      ["Linear value functions", "With v̂ = wᵀx(s), features x describe the state and weights say how much each feature contributes. Linear methods are fast, interpretable, and theoretically useful."],
      ["Feature construction", "Polynomial and Fourier bases provide global smooth features; coarse coding and tile coding provide local overlapping features; radial basis functions provide soft local similarity. Representation choice controls generalization."],
      ["Nonlinear approximators", "Neural networks can learn representations but make targets nonstationary and optimization less predictable. Their power does not remove the need to understand state coverage, scaling, and step sizes."]
    ],
    example: "For a balancing pole, position and angle are continuous. Tile coding overlays several offset grids. Each state activates one tile per grid, so an update changes a small neighborhood while multiple tilings preserve finer distinctions.",
    misconception: "Function approximation does not merely save memory. It makes an inductive claim: states sharing features should share learning. Bad features can spread a mistake farther and faster than a table ever could.",
    practice: "Approximate a one-dimensional value function with tile coding. Change the number of tilings and tile widths; observe the bias–variance and resolution tradeoffs."
  },
  {
    title: "On-policy Control with Approximation",
    slug: "on-policy-control-approximation",
    part: "Part II · Approximation",
    tags: ["control", "semi-gradient-sarsa", "average-reward", "continuing-tasks"],
    summary: "Extending approximate value functions to action selection, episodic semi-gradient Sarsa, and average-reward control for continuing tasks.",
    hook: "Prediction tells a driver how promising each situation is. Control must compare steering choices and improve behavior while the same function approximator generalizes across an enormous state–action space.",
    formula: "w ← w + α[Gₜ:ₜ₊ₙ − q̂(Sₜ,Aₜ,w)]∇q̂(Sₜ,Aₜ,w).",
    concepts: [
      ["Approximate action values", "Features now represent state–action pairs. A single parameter update changes estimates for many related decisions, enabling control in spaces where a Q-table is impossible."],
      ["Episodic semi-gradient Sarsa", "The n-step Sarsa target is combined with a differentiable action-value approximation. An ε-greedy policy supplies exploration while staying on-policy."],
      ["Mountain-car intuition", "Immediate progress may require first moving away from the goal to build momentum. This example shows why delayed return and generalization must work together across continuous states."],
      ["Average reward", "For a continuing task with no natural termination, optimize long-run reward per step rather than a discounted sum. Differential returns measure reward relative to the current average reward rate."],
      ["Discounting debate", "Discounting is mathematically convenient and models preference for immediacy, but in continuing control it can complicate the objective. Average-reward formulations directly express steady-state performance."]
    ],
    example: "An HVAC controller runs forever. Episodic framing would require artificial resets. Average-reward control can optimize comfort minus energy cost per minute, while differential values capture whether an action is better than the system's usual long-run rate.",
    misconception: "Turning a tabular algorithm into a neural algorithm is not just replacing Q[s,a] with a network call. Generalization couples updates, policy changes alter the data distribution, and stability becomes a central design issue.",
    practice: "Solve mountain car with tile-coded n-step Sarsa. Visualize the cost-to-go surface after several episodes and explain how the representation shapes it."
  },
  {
    title: "Off-policy Methods with Approximation",
    slug: "off-policy-approximation",
    part: "Part II · Approximation",
    tags: ["off-policy", "deadly-triad", "gradient-td", "emphatic-td"],
    summary: "Why bootstrapping, function approximation, and off-policy learning can diverge—and how Gradient-TD and emphatic methods restore stability.",
    hook: "Each ingredient seems reasonable: reuse old data, generalize between states, and bootstrap from current estimates. Together they can form the deadly triad, causing values to grow without bound even in tiny problems.",
    formula: "Deadly triad = function approximation + bootstrapping + off-policy training.",
    concepts: [
      ["Distribution mismatch", "The behavior policy determines which states appear in data, while the target policy determines which transitions the value equation cares about. Approximation couples errors across those differently weighted regions."],
      ["Baird-style divergence", "Small counterexamples prove that ordinary semi-gradient TD can diverge off-policy with linear features. The failure is structural, not merely a poor hyperparameter choice."],
      ["The Bellman target geometry", "With approximation, a Bellman backup can leave the representable function space. Projection brings it back, and the interaction of backup and projection may not be a contraction under the behavior distribution."],
      ["Gradient-TD methods", "GTD algorithms optimize well-defined projected objectives using a secondary weight vector. They trade simplicity and sometimes speed for genuine convergence guarantees under linear assumptions."],
      ["Emphatic weighting", "Emphatic TD follows how interest propagates through target-policy transitions, reweighting updates toward states whose predictions matter and stabilizing off-policy learning."]
    ],
    example: "A recommender learns a new target policy from logs collected by an older policy. Popular states dominate the logs, but the target policy visits a different mix. Naively bootstrapping a shared approximator can reinforce its own errors in scarcely covered regions.",
    misconception: "Experience replay does not automatically solve off-policy instability. Replay changes correlations and reuses data, but the behavior–target mismatch and bootstrapped approximation remain.",
    practice: "Reproduce a small divergence counterexample with semi-gradient TD, then run a gradient-TD method on the same stream. Plot weight norms, not only prediction error."
  },
  {
    title: "Eligibility Traces",
    slug: "eligibility-traces",
    part: "Part II · Approximation",
    tags: ["eligibility-traces", "td-lambda", "sarsa-lambda", "true-online"],
    summary: "A memory of recently active features that efficiently blends many n-step returns through TD(λ), Sarsa(λ), and true-online variants.",
    hook: "When a delayed reward arrives, which earlier decisions deserve credit? Eligibility traces keep a fading memory of recently visited states or active features, allowing one TD error to update many predecessors.",
    formula: "zₜ = γλzₜ₋₁ + ∇v̂(Sₜ,w); then w ← w + αδₜzₜ.",
    concepts: [
      ["The λ-return", "The forward view combines one-step, two-step, and longer returns with geometrically decaying weights. λ=0 resembles one-step TD; λ near 1 approaches Monte Carlo in episodic tasks."],
      ["The backward view", "Eligibility traces implement that mixture online without storing and recomputing every future return. Each visited feature gains eligibility, which fades by γλ."],
      ["Accumulating vs replacing traces", "Accumulating traces add repeated activations; replacing traces cap or reset them. Replacing traces can behave better with binary features revisited rapidly."],
      ["True online TD(λ)", "The traditional forward/backward equivalence is exact only in an offline or small-step-size sense. True-online algorithms add corrections that match an online forward view at every step."],
      ["Control and off-policy traces", "Sarsa(λ) assigns credit through action values. Off-policy control must cut or correct traces when behavior deviates from the target, creating methods such as Watkins's Q(λ) and tree-backup traces."]
    ],
    example: "A robot receives reward after completing a five-action grasp. One-step TD initially updates only the final state. With traces, the same TD error also strengthens earlier reach and alignment features, with smaller credit the farther back they occurred.",
    misconception: "A trace is not a stored trajectory. It is a compact, decaying vector of credit eligibility. This distinction is why traces can work online with bounded memory.",
    practice: "Compare TD(0), conventional TD(λ), and true-online TD(λ) on random walk using identical features. Sweep λ and α together because their best settings interact."
  },
  {
    title: "Policy Gradient Methods",
    slug: "policy-gradient-methods",
    part: "Part II · Approximation",
    tags: ["policy-gradient", "reinforce", "baseline", "actor-critic"],
    summary: "Directly parameterizing the policy, deriving the policy-gradient idea, reducing variance with baselines, and combining actors with critics.",
    hook: "Value-based control learns scores for actions and then turns scores into behavior. Policy-gradient methods skip that final conversion: they directly adjust the probabilities or continuous controls that produce behavior.",
    formula: "θ ← θ + α Gₜ ∇θ log π(Aₜ|Sₜ,θ).",
    concepts: [
      ["Why learn a policy directly", "Parameterized policies can represent stochastic behavior naturally, choose continuous actions, and change smoothly as parameters move. Some optimal stochastic policies are easier to express this way than through greedy values."],
      ["Policy-gradient theorem", "The gradient of performance can be written as an expectation over visited state–action pairs without differentiating the state distribution. This makes sampled gradient estimators possible."],
      ["REINFORCE", "Monte Carlo return weights the score function ∇logπ. Actions followed by above-zero return become more likely. The estimator is unbiased but often has high variance and must wait for returns."],
      ["Baselines", "Subtracting a state-dependent baseline does not change the expected gradient if it does not depend on the chosen action. A learned value baseline turns return into an advantage-like signal and reduces variance."],
      ["Actor–critic", "The actor changes policy parameters; the critic estimates value and supplies a bootstrapped TD error. This learns online with lower variance, while introducing critic bias and additional stability concerns."]
    ],
    example: "For a robot joint, a Gaussian policy outputs a mean torque and spread. A successful trajectory increases the log-probability of sampled torques. A critic predicts expected return so the actor emphasizes actions that did better than expected, not merely those with positive raw reward.",
    misconception: "Policy gradients are not guaranteed to find a globally optimal policy. The objective is usually non-convex, gradient estimates are noisy, and the final behavior depends heavily on parameterization and exploration.",
    practice: "Implement REINFORCE with and without a learned baseline on cart-pole. Compare learning curves across many random seeds; a single successful run hides variance."
  },
  {
    title: "Psychology",
    slug: "psychology",
    part: "Part III · Looking Deeper",
    tags: ["psychology", "conditioning", "prediction-error", "habit", "cognitive-map"],
    summary: "Connections between computational RL and animal learning: classical and instrumental conditioning, prediction error, habits, and cognitive maps.",
    hook: "Reinforcement learning did not begin only as an engineering recipe. Its questions—how consequences shape behavior, how predictions change, and how cues gain meaning—closely match questions studied in experimental psychology.",
    formula: "Learning changes most when outcome − prediction is large; a fully predicted outcome produces little update.",
    concepts: [
      ["Classical conditioning", "A cue can come to predict a biologically important event. The computational focus is not merely association strength but how prediction errors appear and move earlier in time."],
      ["Blocking", "If one cue already perfectly predicts an outcome, adding a second cue may produce little learning about it. There is no surprise left to drive an update, which simple co-occurrence theories struggle to explain."],
      ["TD model of prediction", "Temporal-difference learning spreads predictive value backward through a sequence. The error shifts from the outcome to the earliest reliable predictor as learning progresses."],
      ["Instrumental conditioning", "Consequences change action probabilities. This maps naturally onto control: actions, rewards, policies, and the exploration needed to discover useful behavior."],
      ["Habit and goal direction", "Model-free cached values resemble habitual behavior; model-based planning resembles goal-directed evaluation. Real behavior mixes both, especially when time, uncertainty, and cognitive effort vary."]
    ],
    example: "A tone predicts food. Early in training, food is surprising and generates a large error. Later, the tone generates the predictive response and food itself creates little error. If a light is added after the tone already predicts food, the light can be blocked.",
    misconception: "A computational correspondence is not proof that the brain literally runs a textbook algorithm. RL models organize behavioral evidence and generate testable predictions; biological mechanisms remain richer and only partially captured.",
    practice: "Draw prediction-error timelines before and after conditioning. Explain blocking using surprise, then identify a phenomenon that the simplest TD model cannot capture."
  },
  {
    title: "Neuroscience",
    slug: "neuroscience",
    part: "Part III · Looking Deeper",
    tags: ["neuroscience", "dopamine", "reward-prediction-error", "actor-critic"],
    summary: "How reward-prediction errors relate to dopamine signals, what supports the correspondence, and where computational and biological claims must be separated.",
    hook: "Some dopamine neurons change firing when rewards are better or worse than predicted. The pattern looks strikingly like a temporal-difference error—but resemblance is a scientific hypothesis, not a license to equate one equation with the whole brain.",
    formula: "δₜ = Rₜ₊₁ + γV(Sₜ₊₁) − V(Sₜ), compared with phasic reward-related dopamine activity.",
    concepts: [
      ["Prediction error, not pleasure meter", "A reward signal says what arrived; a prediction error compares arrival with expectation. A fully expected reward can be valuable while creating little phasic error."],
      ["Shift to predictive cues", "With learning, phasic responses can move from an unexpected reward to an earlier cue. Omitting an expected reward can produce a dip at the expected time."],
      ["Actor–critic interpretation", "One family of hypotheses maps critic-like prediction learning and actor-like action selection onto interacting neural systems, with dopamine-related signals influencing both."],
      ["Timing and representation", "Real conditioning requires states that represent time, context, and uncertainty. The apparent success or failure of a TD account can depend on how those latent states are constructed."],
      ["Limits and alternatives", "Dopamine populations are diverse, biological learning operates at multiple scales, and movement or novelty can affect activity. The correspondence is informative but not exhaustive."]
    ],
    example: "A monkey receives juice after a light. At first, juice evokes a phasic response. Once the light reliably predicts juice, the response moves toward the light. If juice is omitted, activity dips near the expected delivery time—matching the sign of a prediction error.",
    misconception: "Dopamine is not simply “reward chemical,” and TD error is not itself the reward. Confusing reward, value, and prediction error erases the central explanatory claim.",
    practice: "For unexpected, expected, better-than-expected, and omitted rewards, sketch both reward and TD-error signals. Keep them on separate axes."
  },
  {
    title: "Applications and Case Studies",
    slug: "applications-case-studies",
    part: "Part III · Looking Deeper",
    tags: ["applications", "td-gammon", "atari", "alphago", "case-studies"],
    summary: "What landmark applications reveal about representation, simulation, search, engineering, evaluation, and the limits of algorithm-only explanations.",
    hook: "Successful RL systems are never just an update equation. TD-Gammon, Atari agents, AlphaGo, wagering, memory control, and soaring combine learning with representations, simulators, search, domain constraints, and serious evaluation.",
    formula: "Application success = learning rule × representation × data × planning × systems engineering × evaluation.",
    concepts: [
      ["Self-play and TD-Gammon", "Learning from self-play can create a curriculum that grows with the agent. Function approximation turns board positions into values, while stochasticity and repeated play supply diverse experience."],
      ["Atari and pixels", "Deep networks learn value-relevant representations from image stacks, while replay and target networks make Q-learning more workable. The result illustrates both scale and the deadly-triad engineering problem."],
      ["Search and Go", "AlphaGo combines policy and value networks with Monte Carlo tree search; AlphaGo Zero strengthens self-play and reduces dependence on human games. Planning and learning amplify each other."],
      ["Decision support", "Watson wagering and personalized services show that RL objectives must be embedded in business rules, calibrated uncertainty, safety constraints, and careful offline evaluation."],
      ["Lessons across cases", "Good state representations, reliable simulators or logs, compute budgets, baselines, and evaluation protocols often determine success more than choosing between neighboring algorithms."]
    ],
    example: "In Go, a policy network narrows the enormous move space, a value network estimates outcomes without playing every line to completion, and tree search focuses computation on promising variations. Each component solves a different bottleneck.",
    misconception: "A famous benchmark win does not imply a general intelligent agent. Each case has a particular interface, reward, training distribution, compute budget, and safety envelope.",
    practice: "Choose one case study and write an engineering decomposition: state, action, reward, data source, model or simulator, planning component, approximator, safety constraints, and evaluation metric."
  },
  {
    title: "Frontiers",
    slug: "frontiers",
    part: "Part III · Looking Deeper",
    tags: ["frontiers", "general-value-functions", "options", "state", "reward-design"],
    summary: "Open directions in prediction, temporal abstraction, state construction, reward design, continual learning, safety, and the societal effects of capable agents.",
    hook: "The textbook ends without pretending reinforcement learning is solved. The hardest problems sit before and around the update rule: what should be predicted, what counts as a state, how actions should be temporally organized, and whose goals the reward represents.",
    formula: "Capability depends on questions, state, actions, and reward—not only the optimizer.",
    concepts: [
      ["General value functions", "An agent can learn many predictive questions about future sensor readings, events, and cumulants under different policies. These predictions can become reusable knowledge rather than a single task score."],
      ["Options and temporal abstraction", "An option packages a policy, initiation set, and termination rule into an extended action. Hierarchies let agents reason at multiple time scales instead of choosing only primitive actions."],
      ["State construction", "Raw observations may omit history and hidden causes. A capable agent must build a state that supports useful prediction and control, linking RL to memory, representation learning, and partial observability."],
      ["Reward design", "Reward is a formal objective, not a complete statement of human intent. Proxies invite specification gaming; side effects and distribution shift make apparently sensible signals dangerous."],
      ["Remaining responsibility", "Continual adaptation, sample efficiency, transfer, multi-agent interaction, safety, and social impact remain open. More capable optimization increases the importance of choosing and governing objectives."]
    ],
    example: "A home robot may learn general value functions predicting battery depletion, room occupancy, collision risk, and task completion under several policies. An “go charge” option uses those predictions and hides hundreds of motor commands behind one temporally extended decision.",
    misconception: "Better reward optimization does not guarantee better real-world outcomes. If the reward is an incomplete proxy, stronger optimization can exploit the gap more aggressively.",
    practice: "Design one option and three general value functions for a domain you know. Then perform a reward-red-team exercise: list five ways an agent could maximize the stated number while violating the real intent."
  }
];

const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const chapterFile = (chapter, index) => `rlai-${index + 1}-${chapter.slug}.html`;
const nextLink = (index) => index + 1 < publishedCount
  ? `<a href="${chapterFile(chapters[index + 1], index + 1)}">next: Chapter ${index + 2} &rarr;</a>`
  : `<a href="../reinforcement-learning-introduction.html">chapter index &rarr;</a>`;
const chapterNav = (activeIndex) => chapters.map((chapter, index) => {
  const available = index < publishedCount;
  const classes = `toc-link${index === activeIndex ? " active" : ""}${available ? "" : " disabled"}`;
  return available
    ? `<a class="${classes}" href="${chapterFile(chapter, index)}">${index + 1}. ${esc(chapter.title)}</a>`
    : `<span class="${classes}">${index + 1}. ${esc(chapter.title)} · soon</span>`;
}).join("");

function renderChapter(chapter, index) {
  const number = index + 1;
  const conceptHtml = chapter.concepts.map(([heading, body], conceptIndex) =>
    `<h2 id="s${conceptIndex + 2}"><span class="n">${String(conceptIndex + 2).padStart(2, "0")}</span> ${esc(heading)}</h2><p>${esc(body)}</p>`
  ).join("\n");
  const takeaways = chapter.concepts.map(([heading, body]) =>
    `<li><strong>${esc(heading)}:</strong> ${esc(body.split(".")[0])}.</li>`
  ).join("");
  const tags = chapter.tags.map((tag, tagIndex) => `<span class="tag${tagIndex === 0 ? " fill" : ""}">${esc(tag)}</span>`).join("");
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sutton &amp; Barto Chapter ${number} — ${esc(chapter.title)} Explained — cvam.sight</title>
<meta name="description" content="${esc(`Plain-language companion notes for Reinforcement Learning: An Introduction, Chapter ${number}: ${chapter.summary}`)}">
<link rel="stylesheet" href="../style.css?v=84"><link rel="stylesheet" href="/themes.css?v=6"><script src="/theme-init.js?v=8"></script>
<link rel="icon" type="image/svg+xml" href="../assets/favicon.svg"><script defer src="/_vercel/speed-insights/script.js"></script><script defer src="/_vercel/insights/script.js"></script></head>
<body><div class="progress-bar"></div><div class="layout has-toc"><aside class="sidebar"><a href="../index.html" class="logo"><span class="dot"></span> cvam.sight</a><p class="sidebar-sub">blog from a devops + ml apprentice</p><nav><a href="../index.html">Home</a><a href="../series.html">Series</a><a href="../ai-native.html">AI Native</a><a href="../archive.html">Archive</a><a href="../paperjuice.html">Paper Juice</a><a href="../discover.html" class="active">Discover</a><a href="../about.html">About</a></nav><div class="sidebar-footer"><p class="sidebar-stat" id="site-readers"></p><a href="https://www.linkedin.com/in/shivam-kumar2003/" target="_blank">LinkedIn</a><a href="mailto:shivam.sk2003@gmail.com">Email</a></div></aside><div class="page"><article>
<p class="meta" style="margin-bottom:8px"><a href="../reinforcement-learning-introduction.html" style="color:var(--ink-faint);text-decoration:none">&larr; Reinforcement Learning: An Introduction</a></p>
<div class="post-header"><p class="meta">BOOK NOTES · SUTTON &amp; BARTO · CHAPTER ${number} · ${esc(chapter.part)}</p><h1>Chapter ${number} — ${esc(chapter.title)}, explained.</h1><div class="tag-row">${tags}</div></div>
<div class="post-body osc-body">
<div class="osc-tldr"><p class="osc-tldr-label">// the one-minute version</p><p>${esc(chapter.summary)}</p></div>
<p class="osc-lead">${esc(chapter.hook)}</p>

<h2 id="s1"><span class="n">01</span> The chapter in one mental model</h2>
<div class="osc-key"><span class="lab">core loop</span>${esc(chapter.formula)}</div>
<p>The notation can look dense, but the purpose is practical: turn experience into a better prediction or a better decision. Read every equation by naming what is known now, what new evidence arrived, and which estimate is being moved toward that evidence.</p>

${conceptHtml}

<h2 id="s7"><span class="n">07</span> Worked example</h2>
<div class="osc-analogy"><span class="lab">walk it through</span>${esc(chapter.example)}</div>
<p>When you work through an example, keep the roles separate: the <strong>behavior policy</strong> produces experience, the <strong>target</strong> says what the current estimate should move toward, and the <strong>step size</strong> controls how far it moves. Many algorithms differ mainly in one of those three choices.</p>

<h2 id="s8"><span class="n">08</span> The easy mistake</h2>
<div class="osc-warn"><span class="lab">watch out</span>${esc(chapter.misconception)}</div>

<h2 id="s9"><span class="n">09</span> Questions people actually ask</h2>
<details class="osc-faq"><summary>Do I need to memorize every equation?</summary><p>No. First learn the update pattern: old estimate plus step size times an error. Then identify how the target is built and whether data comes from the same policy being evaluated. Derive or look up the exact form after the mental model is stable.</p></details>
<details class="osc-faq"><summary>What should I implement first?</summary><p>Use the smallest environment that exposes the chapter's idea. Print intermediate values, fix random seeds for debugging, and compare against a simple baseline before scaling to a neural network.</p></details>
<details class="osc-faq"><summary>How do I know whether learning is real?</summary><p>Evaluate on multiple seeds, separate training behavior from the target or greedy policy, report distributions rather than one run, and inspect learned values or policies—not only total reward.</p></details>

<h2 id="s10"><span class="n">10</span> Key takeaways</h2><ul class="osc-takeaways">${takeaways}</ul>

<div class="osc-cheat"><div class="ch-bar"><span>// study card</span><span class="ch-tag">chapter ${number}</span></div><div class="ch-body">
<p class="ch-sec">remember</p><div class="ch-row"><span class="ch-cmd">main idea</span><span class="ch-desc">${esc(chapter.summary)}</span></div>
<div class="ch-row"><span class="ch-cmd">core form</span><span class="ch-desc">${esc(chapter.formula)}</span></div>
<div class="ch-row"><span class="ch-cmd">common trap</span><span class="ch-desc">${esc(chapter.misconception)}</span></div>
<p class="ch-sec">try it</p><div class="ch-row"><span class="ch-cmd">practice</span><span class="ch-desc">${esc(chapter.practice)}</span></div>
</div></div>

<h2 id="s11"><span class="n">11</span> Source trail and scope</h2>
<p>These are independent companion notes, not a replacement for the textbook. The chapter organization follows Sutton and Barto's second edition; explanations and examples here are original. Use the <a href="http://incompleteideas.net/book/the-book-2nd.html" target="_blank" rel="noopener">authors' book page</a>, the <a href="https://mitpress.mit.edu/9780262039246/reinforcement-learning/" target="_blank" rel="noopener">MIT Press edition page</a>, and the <a href="https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/10094/Toc.pdf?dl=1" target="_blank" rel="noopener">official table of contents</a> for the primary source and exact section sequence.</p>
</div><div class="post-nav">${index > 0 ? `<a href="${chapterFile(chapters[index - 1], index - 1)}">&larr; previous: Chapter ${index}</a>` : `<a href="../reinforcement-learning-introduction.html">&larr; chapter index</a>`}${nextLink(index)}</div></article><footer class="footer"><span>© cvam — written in plaintext, served warm</span></footer></div>
<aside class="toc-panel chapter-panel"><p class="toc-panel-label">// chapters</p><nav class="chapter-nav">${chapterNav(index)}</nav></aside></div>
<script src="../stats.js?v=2"></script><script src="../app.js?v=40"></script><script defer src="../settings.js?v=16"></script><script defer src="../reader.js?v=2"></script></body></html>`;
}

function renderLanding() {
  const cards = chapters.map((chapter, index) => {
    const live = index < publishedCount;
    return live
      ? `<a href="posts/${chapterFile(chapter, index)}" class="post-card"><span class="cat">chapter ${index + 1} · ${esc(chapter.part)}</span><h3>${esc(chapter.title)} <span class="ready-badge">live</span></h3><p class="card-excerpt">${esc(chapter.summary)}</p><div class="card-meta"><span>plain-language notes</span><span>· study card</span></div></a>`
      : `<div class="post-card" style="opacity:.62"><span class="cat">chapter ${index + 1} · ${esc(chapter.part)}</span><h3>${esc(chapter.title)} <span class="ready-badge">next</span></h3><p class="card-excerpt">${esc(chapter.summary)}</p><div class="card-meta"><span>publishing one by one</span><span>· coming soon</span></div></div>`;
  }).join("\n");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reinforcement Learning: An Introduction — Easy Chapter Notes — cvam.sight</title>
<meta name="description" content="Detailed, easy-to-read companion notes for Sutton and Barto's Reinforcement Learning: An Introduction, second edition—17 chapters with intuition, equations, examples, mistakes, FAQs, and study cards.">
<link rel="stylesheet" href="style.css?v=84"><link rel="stylesheet" href="/themes.css?v=6"><script src="/theme-init.js?v=8"></script><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"></head>
<body><div class="layout"><aside class="sidebar"><a href="index.html" class="logo"><span class="dot"></span> cvam.sight</a><p class="sidebar-sub">blog from a devops + ml apprentice</p><nav><a href="index.html">Home</a><a href="series.html">Series</a><a href="ai-native.html">AI Native</a><a href="archive.html">Archive</a><a href="paperjuice.html">Paper Juice</a><a href="discover.html" class="active">Discover</a><a href="about.html">About</a></nav><div class="sidebar-footer"><p class="sidebar-stat" id="site-readers"></p><a href="https://www.linkedin.com/in/shivam-kumar2003/" target="_blank">LinkedIn</a><a href="mailto:shivam.sk2003@gmail.com">Email</a></div></aside><div class="page">
<p class="meta" style="margin-bottom:8px"><a href="books-explained.html" style="color:var(--ink-faint);text-decoration:none">&larr; Books Explained</a></p>
<section style="margin-bottom:32px"><p class="meta">// BOOK COMPANION · ${publishedCount}/17 LIVE</p><h1 style="margin:8px 0 12px">Reinforcement Learning: An Introduction — explained.</h1>
<p class="excerpt" style="max-width:760px">An easy-to-read, detailed companion to <em>Richard S. Sutton and Andrew G. Barto, Reinforcement Learning: An Introduction, 2nd edition</em>. Each chapter builds intuition first, then explains the equation, works through an example, warns about the common mistake, answers practical questions, and ends with a compact study card.</p>
<p class="meta" style="max-width:760px">Independent learning material, written in original language. It follows the official chapter sequence without copying the book. ${publishedCount === chapters.length ? "All 17 chapters are complete and ready to read." : "Chapters are being written and published one by one."}</p></section><hr class="rule">
<section class="series-index" style="margin-bottom:32px"><p class="meta" style="margin-bottom:12px">CHAPTERS · ${publishedCount} LIVE</p><div class="chapter-grid">${cards}</div></section>
<footer class="footer"><span>© cvam — written in plaintext, served warm</span></footer></div></div>
<script src="posts.js?v=2"></script><script src="stats.js?v=2"></script><script src="app.js?v=40"></script><script defer src="settings.js?v=16"></script><script defer src="reader.js?v=2"></script></body></html>`;
}

function updateBooksExplained() {
  const file = path.join(site, "books-explained.html");
  let html = fs.readFileSync(file, "utf8");
  const marker = "reinforcement-learning-introduction.html";
  if (!html.includes(marker)) {
    const card = `        <a href="reinforcement-learning-introduction.html" class="post-card series-promo-card">
          <span class="disco-icon">◆</span><span class="cat">machine learning · reinforcement learning</span>
          <h3>Reinforcement Learning: An Introduction <span class="ready-badge">live</span></h3>
          <p class="card-excerpt">Sutton and Barto's 2nd edition explained chapter by chapter in approachable language—with intuition, equations, worked examples, mistakes, FAQs, and study cards.</p>
          <div style="display:flex;gap:4px;flex-wrap:wrap"><span class="tag">#reinforcement-learning</span><span class="tag">#machine-learning</span><span class="tag">#book-notes</span></div>
          <div class="card-meta"><span>${publishedCount} of 17 chapters live</span><span>· ${publishedCount === chapters.length ? "complete" : "publishing"}</span></div>
        </a>\n`;
    html = html.replace('      <div class="post-grid">\n', `      <div class="post-grid">\n${card}`);
  } else {
    html = html.replace(/\d+ of 17 chapters live/g, `${publishedCount} of 17 chapters live`);
    html = html.replace(/<span>· (?:publishing|complete)<\/span>/, `<span>· ${publishedCount === chapters.length ? "complete" : "publishing"}</span>`);
  }
  fs.writeFileSync(file, html);
}

function updatePostsIndex() {
  const file = path.join(site, "posts.js");
  let source = fs.readFileSync(file, "utf8");
  const start = "  // SUTTON_BARTO_BOOK_START";
  const end = "  // SUTTON_BARTO_BOOK_END";
  const entries = chapters.slice(0, publishedCount).map((chapter, index) =>
    `  { path: "posts/${chapterFile(chapter, index)}", kind: "extra", cat: "book-notes", title: "Sutton & Barto Chapter ${index + 1} — ${chapter.title}", tags: ${JSON.stringify(["reinforcement-learning", `chapter-${index + 1}`, ...chapter.tags])}, excerpt: ${JSON.stringify(chapter.summary)} },`
  ).join("\n");
  const block = `${start}\n${entries}\n${end}\n`;
  if (source.includes(start)) {
    source = source.replace(new RegExp(`${start}[\\s\\S]*?${end}\\n?`), block);
  } else {
    const finalClose = source.lastIndexOf("];");
    if (finalClose < 0) throw new Error("Could not find posts array terminator");
    source = `${source.slice(0, finalClose)}${block}${source.slice(finalClose)}`;
  }
  fs.writeFileSync(file, source);
}

fs.mkdirSync(postsDir, { recursive: true });
for (let index = 0; index < publishedCount; index += 1) {
  fs.writeFileSync(path.join(postsDir, chapterFile(chapters[index], index)), renderChapter(chapters[index], index));
}
fs.writeFileSync(path.join(site, "reinforcement-learning-introduction.html"), renderLanding());
updateBooksExplained();
updatePostsIndex();
console.log(`Published ${publishedCount} of ${chapters.length} Sutton & Barto companion chapters.`);

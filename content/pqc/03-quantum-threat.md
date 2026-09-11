---
title: "How Quantum Algorithms Threaten Classical Public-Key Cryptography"
description: "Understand Shor, Grover, resource estimates, and harvest-now-decrypt-later without confusing mathematical algorithms with machines that already exist."
slug: pqc-03-quantum-threat
series: Post-Quantum Cryptography
part: 3
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, security]
difficulty: intermediate
---
# How Quantum Algorithms Threaten Classical Public-Key Cryptography

> The quantum threat is specific. Shor changes the difficulty of factoring and discrete logarithms; Grover improves generic search. Neither statement says that a present-day device can break a production key. This chapter connects the algorithms to their resource assumptions and then to an actionable migration threat model.

## Objectives and prerequisites

Read Part 2 first if key agreement, signatures, or hash security goals are unfamiliar. Here you need only integer arithmetic and the idea of a probability. You will learn enough quantum vocabulary to understand the cryptographic threat, work through a small order-finding reduction, interpret a resource estimate, and build a migration scenario without inventing a quantum arrival date.

Our fictional records service has three concerns: someone may collect its encrypted traffic, forge future updates, or steal a current endpoint key. Quantum cryptanalysis changes the first two in important ways. It does not replace the third with a new problem. A useful assessment keeps these attack paths separate so a quantum migration does not distract from an exposed signing service or an unpatched endpoint.

## A qubit is not an ordinary bit with an unknown value

A classical bit is observed as zero or one. A qubit can have a state described by amplitudes associated with the basis states zero and one. The squared magnitudes of the amplitudes determine measurement probabilities, and their total is one. Amplitudes can carry phase information, which affects how later operations combine them.

For intuition, imagine two paths through an experiment whose contributions can reinforce or cancel. That is more useful than imagining a database containing readable answers to every question. A superposition is manipulated by operations on the whole state. When measured, it produces an outcome distributed according to the resulting probabilities, not a printout of all the amplitudes.

Multiple qubits allow a joint state with many basis possibilities. This large mathematical description does not itself prove an exponential computational advantage for every task. A useful algorithm needs structure that makes desired information survive interference and measurement. Preparing inputs, performing operations, extracting a result, and repeating when necessary all contribute to its cost. Shor and Grover exploit different kinds of structure.

The practical lesson is to distrust the slogan “a quantum computer tries every key at once.” It omits the part that determines whether the computation is useful: how the algorithm makes a measurement reveal the needed answer with adequate probability. That omission leads directly to incorrect claims about symmetric keys and to confusion between qubit count and cryptanalytic capability.

## Reversible computation and the cost of an oracle

A quantum algorithm is commonly described using gates and oracle calls. An oracle is an operation that computes or marks a property of an input in the required model. It is an abstraction for analysis, not a magic service that already exists for free. A cryptographic oracle may require a reversible implementation of a block cipher, modular arithmetic, or a verification function.

Reversible computation must manage intermediate information. Temporary workspace can require additional qubits, and clearing it may require uncomputing earlier steps. A design can trade space against depth or repeat work to reduce memory. These tradeoffs are why a count of abstract oracle queries is not directly a count of wall-clock seconds.

Error correction adds another layer. A long computation must maintain a sufficiently low total probability of failure, not merely demonstrate one successful physical operation. A logical qubit is an error-protected computational object; its physical realization can involve many noisy physical qubits and supporting operations. The ratio depends on the architecture, error rates, code, and reliability target. There is no universal conversion constant.

## Factoring becomes order finding

RSA exposes a modulus built from large factors whose recovery undermines its security. Shor's factoring method connects that task to finding the period of modular exponentiation. The quantum subroutine addresses the period; classical arithmetic performs the surrounding reduction and checks the result. [Shor](https://arxiv.org/abs/quant-ph/9508027)

Let N be the integer to factor and choose an integer a relatively prime to N. The order r of a modulo N is the smallest positive exponent satisfying a^r = 1 modulo N. If r is even and a^(r/2) is not −1 modulo N, greatest-common-divisor calculations can reveal nontrivial factors. Some choices fail the needed conditions, so the algorithm includes repetition.

For a tiny example, N = 15 and a = 2 produce the residues 2, 4, 8, 1. The order is four. Then a^(r/2) = 4, and gcd(4 − 1, 15) = 3 while gcd(4 + 1, 15) = 5. We have recovered both factors. This example demonstrates the reduction, not quantum speed: anyone can enumerate four residues on paper.

```text
Choose a and check gcd(a, N)
             |
Find the period of a^x mod N
             |
Recover and verify a candidate order r
             |
Check r is even and the reduction conditions hold
             |
Compute gcd(a^(r/2) - 1, N) and gcd(a^(r/2) + 1, N)
             |
Verify factors; otherwise retry
```

The distinction between “period finding is useful” and “a machine executed the full attack at cryptographic scale” matters. A compiled demonstration for a tiny known integer can remove much of the work a general attack must perform. Its educational value can be real without constituting evidence of RSA-2048 compromise.

## Why discrete logarithms are affected too

Diffie–Hellman publishes group elements derived from secret exponents. Recovering a discrete logarithm means finding the secret exponent corresponding to a public element. The quantum approach exploits periodic structure in an appropriate algebraic formulation. The broader hidden-subgroup perspective helps connect these problems, but not every hidden-subgroup problem automatically has an efficient known quantum solution.

Finite-field DH and elliptic-curve systems use different groups, arithmetic, and concrete resource profiles. Both nevertheless face a structural quantum threat to their discrete-logarithm foundation. A smaller elliptic-curve key is not evidence of quantum safety, nor should an estimate for one group be copied as an estimate for another. Algorithm families, parameters, and implementation costs need separate analysis.

For signatures, a successful recovery of the relevant secret can allow future forgery. For recorded key agreement, recovering an ephemeral secret can reveal a recorded session's established material. These are different effects of attacking related mathematical assumptions. Whether a specific protocol transcript exposes enough information, and how the recovered value feeds its key schedule, must be checked at the protocol level.

This chapter uses Shor's original result as the algorithmic anchor. It does not infer a concrete elliptic-curve attack runtime from an RSA factoring paper. Resource estimates are conditional constructions with defined targets, not universal scores assigned to all classical public-key cryptography.

## Grover through four possibilities

Grover's algorithm amplifies the probability of a marked solution in an unstructured search. Its ideal query complexity for one marked item among N possibilities is order √N. The algorithm alternates an operation marking the desired state with an operation that changes amplitudes so the solution becomes more likely to appear when measured. [Grover](https://arxiv.org/abs/quant-ph/9605043)

A four-item toy example makes the arithmetic visible. Start with amplitude 1/2 on each item, so each has probability 1/4. Mark one target by changing its amplitude to −1/2. The mean amplitude is now 1/4. Reflecting each amplitude about that mean maps the target to 1 and each other item to 0. In this ideal special case, measuring after one iteration returns the target.

This is not a recipe for breaking a real cipher with four arithmetic operations. The oracle must recognize a correct candidate, the input space is enormous, and the implementation has physical costs. The example explains amplification while deliberately omitting those engineering details. It also shows why merely creating an initial uniform state is not the entire algorithm.

For key search, the oracle may test a candidate key against known input/output relationships. The complete attack has to implement that test coherently, manage workspace, and sustain the required sequence of operations. Extra observations may be necessary to identify a unique key. A single successful match in a simplified model does not establish that every real cryptanalytic task has the same structure.

## Interpreting symmetric-key security responsibly

The informal expression “k-bit keys become k/2-bit secure” is a rough ideal-query shorthand for generic search. It is not an unconditional estimate of time, energy, or hardware. Parallel quantum search does not give the same simple scaling story as dividing classical exhaustive search into independent chunks. Realistic depth limits can materially change the useful tradeoff.

A practical migration discussion therefore distinguishes three statements: the generic quantum algorithm exists; a concrete reversible implementation has an estimated cost; and an adversary has a machine capable of paying that cost. The first is established mathematics. The second is a model-based estimate. The third requires evidence about actual capability. Moving between these levels without saying so creates false certainty.

NIST's PQC FAQ discusses why symmetric-parameter decisions should not be reduced to a simplistic quantum multiplier. It also separates the urgency of replacing vulnerable public-key schemes from the continued usefulness of symmetric cryptography. The right question is which construction, security goal, and usage limits apply—not whether the word “quantum” makes all existing cryptography obsolete. [NIST FAQ](https://csrc.nist.gov/projects/post-quantum-cryptography/faqs)

## Why SHA-256 does not suddenly become useless

A hash can appear in very different roles: identifying an artifact, building a MAC, compressing a transcript, deriving a challenge, or contributing to a hash-based signature. Each role calls for a specific property. Finding any collision is not the same as finding a preimage for a fixed target. Security conclusions must follow the property actually needed by the construction.

Even a generic quantum speedup does not turn a hash digest into reversible encryption. It changes the resources for a search problem. A password hash can remain weak because its input is predictable, while a cryptographic construction using the same underlying hash can have a very different security argument. Input entropy, output length, domain separation, and query model all matter.

For the records service, replacing a certificate algorithm does not imply removing SHA-256 from every build manifest. Instead, inventory how hashes are used and what trusts their values. A digest cannot independently authenticate an untrusted publisher today, with or without a future quantum computer. Preserving that elementary distinction prevents a quantum review from overlooking an existing classical design error.

## Reading resource estimates as estimates

Gidney and Ekerå's work estimates a construction for factoring RSA-2048 using twenty million noisy qubits in eight hours under specified physical assumptions. It models error correction and other overheads rather than equating logical gates with physical execution. Its publication is a research result about a possible construction, not a report of such a machine operating. [Gidney and Ekerå](https://arxiv.org/abs/1905.09749)

Gidney's 2025 paper estimates fewer than one million noisy qubits with a runtime below a week under stated assumptions, including a 0.1% gate error rate, a one-microsecond surface-code cycle, and a ten-microsecond control reaction time. The changed space/time tradeoff illustrates why estimates evolve with algorithm and architecture choices. It is not a calendar prediction. [Gidney, 2025](https://arxiv.org/abs/2505.15917)

| Question for a resource paper | Why the answer matters |
| --- | --- |
| What exact cryptographic target and key size? | Different groups and parameters require different arithmetic |
| Logical or physical qubits? | Error correction and supporting machinery change the count |
| Which error rates and connectivity? | Hardware assumptions determine whether the schedule is feasible |
| Which depth, gate count, and runtime? | Space alone does not describe the full attack cost |
| What success probability and repetitions? | A reliable result can require more than one execution |
| Which costs are omitted? | Control, routing, factories, and storage may matter materially |
| Measured, simulated, or analytically estimated? | These are different forms of evidence |

The table is a reading aid, not a checklist that makes every estimate comparable. Two papers may optimize different objectives. A smaller qubit count paired with a longer runtime is not a contradiction. A responsible summary preserves enough assumptions to explain the comparison instead of extracting the most dramatic number from each abstract.

## What a cryptographically relevant quantum computer means

The term CRQC describes capability relative to a cryptographic target. It is not a single qubit-count threshold applicable to every problem. A device must support the required operations, reliability, connectivity, computation length, and control to execute an attack at the needed scale. Different targets may cross a practical threshold at different times.

No authoritative evidence reviewed for this chapter establishes an operational CRQC capable of breaking the deployed public-key examples discussed here. That is a statement about the evidence used, not a promise that the situation cannot change. Current threat planning should remain sensitive to credible developments without treating every quantum benchmark as a cryptanalytic milestone. [NIST's future-threat framing](https://csrc.nist.gov/projects/post-quantum-cryptography)

The engineering response does not need a precise prediction. It needs a defensible inventory, a migration lead-time estimate, and an update process for the assumptions. If a new paper changes an attack-cost estimate, teams should be able to revise priorities without discovering that their systems have no algorithm-update mechanism at all.

## A threat model for the records service

| Asset and adversary action | Classical boundary | Quantum concern | Additional controls |
| --- | --- | --- | --- |
| Collect public-network traffic | Ephemeral classical DH/ECDH | Later recovery of recorded session material | Standardized PQ/hybrid establishment; protect endpoints |
| Forge an update in the future | Classical signature trust | Future private-key recovery or forgery capability | PQ signatures, trusted update channels, rollback policy |
| Read encrypted backups | Data key and its wrapping/storage | Depends on vulnerable public-key protection in the chain | Inventory key wrapping, retention, and access |
| Steal today's process memory | Endpoint isolation and key lifecycle | Does not require quantum computation | Patch, isolate, minimize privileges, erase secrets |
| Replay a valid old command | Protocol freshness checks | Not repaired by changing signature family | Authenticate context and enforce freshness |

Forward secrecy against later compromise of a long-term signing key does not imply resistance to solving the original ephemeral key agreement from a stored transcript. Similarly, stronger authentication does not retroactively repair old captured ciphertext. These temporal distinctions should appear in an assessment, not be hidden behind a single compliance field.

## Worked migration scenario

Assume, purely for planning, that records require twelve years of confidentiality. A gateway can be upgraded in six months, but the slowest relevant client dependency takes three years. Evaluate attack-capability horizons of five, ten, and twenty years as scenarios, without assigning them probabilities. The combined secrecy-and-migration duration is fifteen years for the slow path.

Under the five- and ten-year scenarios, delaying that slow path leaves an obvious concern under the S + M > Q heuristic. Under the twenty-year scenario, the inequality does not hold for these particular inputs, but it does not prove zero risk. The model omits uncertainty in implementation quality, supply-chain delays, hidden dependencies, and collection reach. [Mosca](https://eprint.iacr.org/2015/1075)

Next split the path. A gateway change might reduce exposure for updated clients quickly, while a legacy export channel remains vulnerable. Record the fraction and sensitivity of traffic still using that channel, but do not call a partial deployment complete. Revisit the data classification too: some records may need a longer lifetime than the default, and copies in downstream systems may outlive the original retention policy.

This scenario produces an actionable question: which dependency makes the largest sensitive exposure persist longest? It is more useful than asking for a single organizational “quantum readiness percentage.” Part 16 will turn the same idea into inventory fields, ownership, milestones, and telemetry.

## A small verification exercise

Use Python 3 to verify the classical arithmetic and the ideal four-item amplification. This is not quantum simulation at cryptographic scale and does not measure a quantum attack.

```python
from math import gcd
assert [pow(2, r, 15) for r in range(1, 5)] == [2, 4, 8, 1]
assert (gcd(4 - 1, 15), gcd(4 + 1, 15)) == (3, 5)
amplitudes = [-0.5, 0.5, 0.5, 0.5]
mean = sum(amplitudes) / len(amplitudes)
after = [2 * mean - a for a in amplitudes]
assert after == [1.0, 0.0, 0.0, 0.0]
assert sum(a * a for a in after) == 1.0
print('Toy arithmetic checks passed')
```

The exercise tests two claims that are small enough to reproduce exactly. It cannot validate the hardware assumptions of a resource paper. Keeping those forms of evidence distinct is part of learning to read cryptographic research critically.

## Knowledge check and next step

**Why does a superposition not reveal every candidate key?** Measurement returns an outcome. The algorithm must arrange useful interference and amplification before that measurement.

**Why can an estimate with fewer qubits take longer?** Space, parallel resources, and operation depth trade against one another. The objective and assumptions determine the comparison.

**Does replacing classical signatures protect old recorded TLS sessions?** Not by itself. Recorded confidentiality depends on the key-establishment and key-protection path used for those sessions.

The quantum threat is neither a reason to panic nor a reason to ignore migration until a machine is demonstrated. It is a reason to replace vulnerable assumptions through a controlled process. Part 4 builds the mathematical vocabulary needed to understand the alternative assumptions and the security definitions used to analyze them.

---
title: "Mathematics Primer for Post-Quantum Cryptography"
description: "Small worked examples of modular arithmetic, vectors, noise, polynomial rings, coding theory, and modern cryptographic security games."
slug: pqc-04-mathematics
series: Post-Quantum Cryptography
part: 4
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, security]
difficulty: intermediate
---
# Mathematics Primer for Post-Quantum Cryptography

> PQC notation becomes manageable when each symbol represents an operation you have already performed on a small example. This chapter builds that vocabulary from remainders to polynomial arithmetic, then explains what cryptographers mean by hardness and security. Every numerical example is educational, not a secure parameter choice.

## Objectives and prerequisites

You need integer arithmetic and the cryptographic roles from Part 2. You do not need calculus or a mathematics degree. The goal is to read expressions such as t = As + e modulo q and understand what each object is, how to compute it, and which part of its security is an assumption rather than an arithmetic identity.

The examples use tiny spaces so their behavior is visible. Tiny spaces are also easy to enumerate, which makes them unsuitable for security. A successful calculation below demonstrates correctness of arithmetic only. It does not demonstrate that recovering a secret is difficult. The [ML-KEM standard](https://csrc.nist.gov/pubs/fips/203/final) supplies the actual algorithm and parameters; these examples are preparation for reading it.

## Modular arithmetic: working with remainders

Arithmetic modulo q identifies integers that differ by a multiple of q. For q = 7, the numbers 3, 10, and −4 represent the same residue. We can choose representatives from 0 through 6, so 10 mod 7 = 3 and −4 mod 7 = 3. Addition and multiplication are followed by reduction to a representative.

Compute 5 + 6 modulo 7: the ordinary sum is 11, which reduces to 4. Compute 5 × 6: the product 30 reduces to 2. Reduction can also occur during a calculation because it preserves these operations. This is useful in software, where allowing an intermediate integer to grow without bounds may overflow its machine representation.

Subtraction often makes a negative representative natural. The residue 6 modulo 7 can also be written −1. A centered representation chooses values near zero, which is useful when discussing small errors. The residue has not changed; the chosen integer representative has. Confusing a residue with its unsigned storage value can make a genuinely small error appear large.

## Division requires an inverse

Dividing by a nonzero element means multiplying by its multiplicative inverse, when one exists. Modulo 7, the inverse of 3 is 5 because 3 × 5 = 15 = 1 mod 7. Thus dividing 2 by 3 in this field gives 2 × 5 = 3 mod 7. It does not mean ordinary real-number division followed by truncation.

Not every nonzero residue has an inverse for every modulus. Modulo 8, 2 has no multiplicative inverse: multiplying it by any integer remains even and cannot give 1 modulo 8. More generally, an integer has an inverse modulo q exactly when it is relatively prime to q. The extended Euclidean algorithm computes such inverses.

When q is prime, the residues form a finite field: every nonzero element is invertible. This explains why a prime modulus is convenient, but it does not imply that every structure built from that field is itself a field. Polynomial quotient rings introduce another condition. That distinction becomes important when interpreting the arithmetic used by lattice schemes.

## Vectors and dot products

A vector is an ordered list. Let a = (1, 2) and s = (2, 1). Their dot product multiplies corresponding entries and sums the products: 1×2 + 2×1 = 4. Modulo 7, the result remains 4. Order matters because it tells us which entries are paired.

A vector is not necessarily a point in ordinary physical space. It may encode coefficients, samples, or algebraic objects. In a module-lattice construction, a vector entry can itself be a polynomial. Keeping track of the type of each entry prevents a common mistake: treating a vector of polynomials as a vector of single integers and losing a dimension of the construction.

The transpose symbol changes rows into columns. A row vector times a column vector produces a scalar dot product. A column vector times a row vector produces a matrix. These operations look similar on paper but return different objects. When reading pseudocode, write the dimensions beside a matrix multiplication before trying to optimize or simplify it.

## Matrices as many equations at once

Let A have rows (1, 2) and (3, 4), and let s = (2, 1). Multiplication produces As = (4, 10), or (4, 3) modulo 7. Each row of A defines one dot product with s. The compact matrix notation simply collects the equations.

Now add e = (1, −1). We obtain t = As + e = (5, 2) modulo 7. A is public in this toy example, s is the value we imagine hiding, and e is the small disturbance. Without the disturbance, a suitable invertible system can be solved by ordinary linear algebra. With it, the observed equations are no longer exact equations for s alone.

```text
A = [1 2]       s = [2]       e = [ 1]
    [3 4]           [1]           [-1]

A*s = [ 4]      A*s + e mod 7 = [5]
      [10]                      [2]
```

This is only the shape of a noisy-linear-system example. Real LWE assumptions depend on dimensions, sample counts, distributions, modulus, and attack model. Adding an arbitrary perturbation to a small invertible matrix does not create a secure cryptosystem. Regev's foundational work connects carefully specified learning problems to lattice problems under explicit conditions. [Regev](https://arxiv.org/abs/2401.03703)

## Norms: more than one meaning of small

A norm measures vector size. For v = (−2, 1, 2), the one-norm is |−2| + |1| + |2| = 5. The Euclidean norm is √(4 + 1 + 4) = 3. The infinity-norm is the largest absolute coordinate, which is 2. These values answer different questions about the same vector.

A bound on every coefficient is naturally expressed with the infinity-norm. Geometric distance often uses the Euclidean norm. A proof or rejection condition using one must not be silently replaced by the other. Dimension changes the relationship between them, so even a seemingly conservative substitution can change a correctness or security condition.

For modular values, the representative convention matters again. In modulo-7 arithmetic, a stored coefficient 6 may represent centered value −1. Measuring 6 when the specification intends the centered value can reject valid objects or admit invalid ones. Exact definitions of reduction, rounding, and norm are implementation requirements, not stylistic preferences.

## Probability distributions and sampling

A distribution assigns probabilities to possible outcomes. A uniform distribution on seven residues gives each probability 1/7. A distribution concentrated near zero behaves differently: zero may be common while large magnitudes are rare or impossible. In cryptography, the distribution is part of the scheme's definition.

One small example comes from four independent fair bits. Add the first two and subtract the last two. The possible results are −2, −1, 0, 1, and 2, with respective counts 1, 4, 6, 4, and 1 among sixteen equally likely bit strings. The distribution is centered and bounded. This illustrates a centered-binomial shape without claiming those four bits describe every sampler in every lattice scheme.

Replacing a specified sampler with “something approximately similar” changes the distribution an attacker sees. Bias, correlations, insufficient randomness, or a variable-time implementation can invalidate assumptions even when sampled values look reasonable in a histogram. Statistical tests are useful for catching defects, but passing them does not prove that a generator is unpredictable or that a cryptographic reduction applies.

## Polynomials as structured vectors

The polynomial a(x) = 1 + 2x + 3x² can be stored as coefficient vector (1, 2, 3). Adding polynomials adds corresponding coefficients. Multiplication combines every coefficient of one polynomial with every coefficient of the other according to powers of x.

For example, (1 + 2x)(3 + x) = 3 + 7x + 2x². Modulo 7, its coefficient vector becomes (3, 0, 2). The middle coefficient receives two contributions: 1×1 and 2×3. This combining of shifted products is convolution.

The symbol x is formal here. We are not evaluating the polynomial at a particular real number. It records how coefficients shift and combine. Thinking of multiplication as structured convolution makes it easier to understand why lattice implementations spend time on polynomial multiplication and why transforms can accelerate it.

## Quotient rings: a rule for folding powers back

A polynomial quotient ring adds a reduction rule. In R = F₁₇[x]/(x⁴ + 1), coefficients are reduced modulo 17 and powers are reduced using x⁴ = −1. Therefore x⁵ = −x, x⁶ = −x², and x⁷ = −x³. Every element can be represented using at most four coefficients.

Multiply a = 1 + 2x³ by b = 3 + x. Ordinary multiplication gives 3 + x + 6x³ + 2x⁴. Folding x⁴ to −1 changes the constant coefficient from 3 to 1, producing 1 + x + 6x³. The final coefficient vector is (1, 1, 0, 6).

The negative sign makes this **negacyclic** convolution. A quotient by x⁴ − 1 would instead use x⁴ = 1 and produce a different result. Confusing cyclic and negacyclic multiplication is not a small numerical error; it means computing in the wrong algebraic structure.

There are two independent reductions: coefficient reduction modulo 17 and polynomial reduction modulo x⁴ + 1. The former bounds coefficient representatives; the latter bounds polynomial degree. Many intimidating expressions in PQC are just compact ways of naming both rules at once.

## A quotient ring need not be a field

Although F₁₇ is a field, F₁₇[x]/(x⁴ + 1) is not automatically one. A polynomial quotient over a field is a field when the polynomial defining the quotient is irreducible. Otherwise, nonzero elements may fail to have inverses. This is why “all coefficients are modulo a prime” is insufficient to justify dividing by every nonzero polynomial.

Algorithms can intentionally work in rings without needing arbitrary division. Polynomial addition and multiplication may be enough for the required operations. An engineer should follow the operations a specification actually defines rather than importing an assumption from familiar real-number algebra.

For ML-KEM, the ring uses q = 3329 and degree 256 with modulus polynomial x²⁵⁶ + 1. Its transform structure is tailored to those parameters. Our degree-four example explains the reduction rule only; it is not the exact NTT used by ML-KEM. [FIPS 203](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf)

## Coding-theory bridge: bits, distance, and syndromes

A binary vector uses entries in F₂, where addition is XOR. The Hamming weight counts nonzero entries. The Hamming distance between two vectors counts positions where they differ. For 1011 and 1000, the distance is two. This describes errors by their locations rather than by Euclidean length.

A code adds redundancy so a receiver can distinguish likely original messages from corrupted observations. A parity-check matrix H gives a syndrome Hc for a received vector c, using arithmetic in the relevant field. Valid codewords satisfy the code's parity-check equations; an error changes the syndrome. Decoding tries to infer a suitable codeword or error under a model.

For a tiny parity check, H = (1, 1, 1) and c = (1, 0, 1) give syndrome 0. Flipping the middle bit yields (1, 1, 1) with syndrome 1. This detects an odd number of flips but cannot identify which single bit changed. More structure is needed for correction, and cryptographic code-based schemes pose carefully chosen decoding problems rather than using this toy parity bit as security.

## Why noise can help—and hurt

In ordinary engineering, noise is often something to remove. In LWE-style constructions, carefully controlled uncertainty helps separate public observations from a secret. The legitimate computation uses relationships designed to cancel large terms, leaving a small residual that can be decoded. An attacker lacks the same secret information.

Noise must fit a correctness budget. Too little can weaken the intended hiding problem; too much can make honest decoding fail. Compression can add another bounded approximation error. These effects must be analyzed together instead of describing noise as an unlimited security improvement. Part 6 develops the cancellation intuition before Part 7 follows the exact ML-KEM operations.

This tradeoff explains why seemingly harmless implementation changes can be cryptographic changes. Altering a rounding rule, distribution, or acceptance bound can affect both correctness and what an attacker learns. Performance work has to preserve the specified mathematical object, not merely make a random sample of successful exchanges pass.

## Hardness is a statement with parameters

A problem is computationally hard only relative to a model, parameter growth, and available algorithms. “There are many possible secrets” is not enough: structure can let an attacker avoid enumerating all of them. Conversely, exhibiting an expensive known attack does not prove that no cheaper attack exists.

A security reduction connects an adversary against a construction to an algorithm for another problem. It supplies a conditional argument. Its assumptions, loss factors, and model matter when interpreting concrete parameters. A worst-case-to-average-case connection is valuable evidence, but it should not be paraphrased as an unconditional proof that a specific compiled binary cannot leak its key.

Asymptotic statements study a security parameter λ growing without bound. Concrete security studies actual sizes and attack resources. Both are useful. The distinction resembles the difference between an algorithm's big-O complexity and its measured runtime on a particular machine, except cryptographic comparisons also depend on the adversary's capabilities and success probability.

## Negligible probability

A function is negligible if it eventually becomes smaller than the inverse of every positive polynomial in the security parameter. An exponentially decreasing function such as 2^(−λ) is negligible. The function 1/λ¹⁰⁰ is very small for many practical values but is not negligible under this definition: it is still inverse-polynomial.

This definition should not be confused with a universal operational acceptance threshold. A fleet executing enormous numbers of operations must consider aggregate risk, and a proof's negligible bound still requires concrete interpretation. The union bound gives a simple conservative tool: the probability of any of several events is at most the sum of their individual probabilities, without requiring independence.

For an illustration, if each of a million operations has failure probability at most 10^(−12), the union bound gives at most 10^(−6) for at least one failure. These are invented numbers to explain the calculation, not failure-rate claims for any standardized algorithm. Security arguments need the actual bound and the correct event definition.

## Three security games engineers should recognize

**IND-CPA** concerns indistinguishability under chosen-plaintext attack. Informally, an adversary chooses two equal-length messages and receives an encryption of one selected by a hidden bit. Its task is to guess which. Encryption should not reveal the choice beyond permitted information. The exact experiment defines what other queries are allowed.

**IND-CCA** strengthens the setting by giving access to decryption under restrictions, notably preventing a trivial query on the challenge itself. This models an attacker manipulating ciphertexts and observing a decryption interface. A KEM uses a related real-versus-random shared-secret experiment with a decapsulation interface. It should not be described as merely the same plaintext game with different function names.

**EUF-CMA** concerns existential unforgeability under chosen-message attack. The attacker can obtain signatures on chosen messages and then tries to produce a valid signature on a new message. This differs from stronger notions that also forbid producing a new signature on an already signed message. Knowing the exact goal prevents overstating what a scheme proves.

For full definitions and constructions, use [Boneh and Shoup](https://crypto.stanford.edu/~dabo/cryptobook/) and the security discussion in [SP 800-227](https://csrc.nist.gov/pubs/sp/800/227/final). The descriptions above are intuition, not substitutes for the complete experiments or quantum-query models used by particular proofs.

## Reproduce the arithmetic

The following Python 3 checks cover the examples independently of any cryptographic library. Their deliberately straightforward multiplication is for learning, not constant-time production code.

```python
from itertools import product
from collections import Counter
assert (5 + 6) % 7 == 4
assert (5 * 6) % 7 == 2
assert (3 * 5) % 7 == 1
A, s, e = [[1, 2], [3, 4]], [2, 1], [1, -1]
assert [(sum(a*b for a, b in zip(row, s)) + z) % 7
        for row, z in zip(A, e)] == [5, 2]
counts = Counter(a+b-c-d for a,b,c,d in product([0,1], repeat=4))
assert [counts[i] for i in range(-2,3)] == [1,4,6,4,1]
a, b, out = [1,0,0,2], [3,1,0,0], [0]*4
for i in range(4):
    for j in range(4):
        k = i+j
        out[k % 4] += a[i]*b[j] * (1 if k < 4 else -1)
assert [v % 17 for v in out] == [1,1,0,6]
print('Mathematics examples passed')
```

## Knowledge check and next step

| Question | Explanation |
| --- | --- |
| Why is −1 sometimes represented as q−1? | They are the same residue; centered and nonnegative representatives serve different purposes |
| Does a prime coefficient modulus make every quotient ring a field? | No; the polynomial modulus must satisfy the relevant irreducibility condition |
| Why can more noise reduce reliability? | Honest decoding has a finite margin, and residual error must fit inside it |
| Is a tiny passing example evidence of security? | It demonstrates arithmetic correctness; the tiny secret space can still be searched |
| Does IND-CCA authenticate a peer's identity? | No; it is a confidentiality-style primitive security notion, not a complete authenticated protocol |

You now have the vocabulary to separate algebra, probability, hardness assumptions, and protocol goals. Part 5 uses that vocabulary to compare the major PQC families; Part 6 then develops lattice cryptography in enough detail to make ML-KEM and ML-DSA approachable.

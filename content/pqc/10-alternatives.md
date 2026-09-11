---
title: "FN-DSA, HQC, and Algorithms Beyond the First Three Standards"
description: "Evaluate Falcon's compact lattice signatures, HQC's code-based diversity, Classic McEliece, and the additional-signature process without confusing candidates with final standards."
slug: pqc-10-alternatives
series: Post-Quantum Cryptography
part: 10
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, security]
difficulty: advanced
---
# FN-DSA, HQC, and Algorithms Beyond the First Three Standards

> A cryptographic portfolio needs both usable standards and credible alternatives. The alternatives deserve serious study, but research maturity, standardization status, implementation assurance, and protocol readiness must be assessed independently.

## What this part adds

Parts 7–9 covered the three finalized NIST PQC algorithms: ML-KEM, ML-DSA, and SLH-DSA. This part explains why work continues beyond them. You will learn the design motivations behind Falcon-derived FN-DSA, the code-based KEM HQC, and several additional-signature families. You will also practice reading selection reports without treating selection as completed standardization.

The checkpoint is September 11, 2026. NIST's [PQC project material](https://csrc.nist.gov/csrc/media/presentations/2026/mpts2026-3b1/images-media/mpts2026-3b1-slides-nist-pqc-moody.pdf) describes FN-DSA/FIPS 206 as under development and HQC as selected with a draft underway. The current sources checked for this article do not establish a final FIPS 206 or final HQC standard. Consequently, no submission-era number below is presented as a final encoding requirement.

A standard number appearing on a conference agenda is not itself a publication. A planned finalization year is not a guarantee. Likewise, a maintained experimental implementation can be valuable without implying that a particular TLS group, certificate profile, or validated cryptographic module is ready for deployment.

## A status map with explicit boundaries

| Construction | Purpose and foundation | Status at this checkpoint | Engineering interpretation |
|---|---|---|---|
| FN-DSA, derived from Falcon | Compact signatures over NTRU lattices | Selected; FIPS 206 under development | Study sampling and bandwidth tradeoffs; track final specification |
| HQC | Code-based key encapsulation | Selected March 2025; standardization underway | Potential KEM-family diversity; do not assume final wire format |
| Classic McEliece | Code-based key encapsulation | Not selected in NIST's fourth-round decision | Important conservative reference with large public keys |
| Additional-signature candidates | Several mathematical families | Ongoing evaluation | Research candidates, not approved replacements as a group |
| HAWK | Lattice signature candidate | Withdrawn from additional-signature process | Do not count it as an active candidate merely from an old roster |

The [fourth-round report, NIST IR 8545](https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8545.pdf), documents the selection reasoning. It is more informative than a popularity ranking because it considers security confidence, performance, implementation characteristics, and the needs of the existing portfolio. A decision not to select an algorithm is not automatically a declaration that it is broken.

## Falcon's objective: a short signature with a trapdoor

Falcon follows a hash-and-sign approach over NTRU lattices, using the trapdoor-sampling framework associated with Gentry, Peikert, and Vaikuntanathan. A public relation defines many possible vectors associated with a hashed message. The private key provides special information for sampling an appropriately short vector efficiently. Without that trapdoor, finding a suitable short preimage should be hard.

In a schematic ring relation, a public polynomial h and message-derived target c are associated with a short pair (s₁, s₂) satisfying s₁ + s₂h = c modulo q. Verification checks the relation and a norm bound. The private key enables generating such short pairs with the required distribution, while the public key does not reveal the useful short basis.

For an insecure scalar illustration, take q = 17, h = 5, and c = 9. The pair (−1, 2) satisfies −1 + 2·5 = 9 and has squared Euclidean norm 5. Many larger pairs satisfy a modular equation; the shortness requirement is what gives the verification condition substance. Real Falcon uses high-dimensional polynomial structure and carefully selected bounds.

NTRU structure gives a compact representation of a lattice and its trapdoor. It does not make every algorithm bearing the NTRU name identical. Encryption schemes, KEMs, and signatures can use related mathematical structures while having different security goals, parameters, and implementation requirements.

## Why sampling is the difficult part

A naive signer might choose the closest convenient lattice point using its secret basis. The resulting signatures can reveal statistical information about that basis over repeated observations. A secure trapdoor sampler must produce the specified distribution so that the output does not disclose the trapdoor through subtle biases.

Falcon uses fast Fourier sampling. Fourier-domain calculations exploit polynomial structure to make the recursive sampling process efficient. The FFT here involves numerical representations used in sampling; it should not be conflated with the finite-field NTT arithmetic introduced for ML-KEM and ML-DSA. Both are transforms, but their correctness and implementation concerns differ.

Floating-point operations can introduce issues involving rounding, precision, exceptional values, compiler transformations, and timing on different targets. A distribution that appears visually Gaussian is not sufficient evidence that the implementation samples correctly. The acceptable numerical behavior must be justified against the algorithm's requirements and tested across supported architectures.

This is an implementation challenge rather than a blanket claim that floating-point cryptography is impossible. Specialist implementations can control arithmetic behavior, and research explores constant-time techniques and alternative representations. The [Falcon specification](https://falcon-sign.info/falcon.pdf) and the authors' implementation references are the appropriate starting points for understanding those choices.

## Compactness is real; benchmark portability is limited

The [Falcon project page](https://falcon-sign.info/) reports submission-era public-key/signature sizes of 897/666 bytes for Falcon-512 and 1,793/1,280 bytes for Falcon-1024. These illustrate the bandwidth motivation. They are not asserted here as the final FN-DSA wire sizes, and Falcon's encodings and signature-format choices must be understood before comparing byte counts.

The same page reports performance for a specified Intel Core i5-8259U system with TurboBoost disabled. Those measurements describe that implementation and environment. They cannot be combined with an ARM laptop measurement of ML-DSA to conclude a universal speed ratio. Compiler, CPU features, key representation, operation boundaries, and benchmark date all affect the comparison.

A constrained verifier may value compact signatures and fast verification while delegating signing to a powerful protected service. Another device may need to sign locally without suitable arithmetic support. The same algorithm can fit the first role and be difficult in the second. Evaluate the signer and verifier separately rather than assigning one “embedded suitability” label.

A security review should examine Gaussian sampling, secret-dependent control flow, memory accesses, fault responses, and key-generation behavior. Review also needs to cover serialization and API initialization. The Falcon project's historical API advisory illustrates that bugs can occur outside the central mathematical algorithm, even when standardization test vectors exercise another interface correctly.

## Coding theory: recovering a message from controlled errors

Error-correcting codes add redundancy so a receiver can recover data after some bits change. Let a codeword be c and an error vector e; the received word is r = c + e over a finite field. In the binary case, addition is XOR. A decoder uses the code structure to recover c when the error pattern falls within its supported region.

For a toy repetition code, encode bit 0 as 000 and bit 1 as 111. Receiving 101 is one bit away from 111, so majority decoding returns 1. Receiving 001 instead returns 0; too many errors can cross the decision boundary. This code is trivial to decode and provides no public-key security. It only demonstrates correctness under a bounded error model.

Cryptographic code-based constructions arrange for legitimate recovery while an attacker faces a hard decoding-related problem. The public structure, secret information, error distribution, and transformation into a KEM determine the security claim. “Decoding is hard” must always be qualified: some codes and error ranges are intentionally easy, while the attacked instances are chosen to resist known methods.

A parity-check matrix H gives another useful representation. A valid codeword satisfies Hcᵀ = 0. The syndrome of r is Hrᵀ = Heᵀ, so it depends on the errors. Finding a low-weight error with a given syndrome is the syndrome-decoding viewpoint. The weight counts nonzero positions, unlike the Euclidean norms used in the Falcon example.

## HQC's role in the portfolio

HQC stands for Hamming Quasi-Cyclic. Its construction uses binary polynomial operations, sparse vectors, and error-correcting codes. Quasi-cyclic structure gives a compact way to represent certain linear operations. The legitimate decryption path cancels shared terms and decodes a message with remaining noise; the surrounding KEM transformation supplies the stronger chosen-ciphertext-oriented construction.

The code used to correct errors is not simply a hidden efficient decoder in the same architectural sense as Classic McEliece. HQC combines a public decoding component with a noisy algebraic construction whose security relies on structured decoding assumptions. This distinction matters when comparing families: shared coding terminology does not imply identical secret-key structure or failure analysis.

NIST [selected HQC in March 2025](https://www.nist.gov/news-events/news/2025/03/nist-selects-hqc-fifth-algorithm-post-quantum-encryption) to complement ML-KEM with a different mathematical foundation. The announcement described a final standard expected in 2027. That is a published plan, not a current finalization claim or a reason to postpone migration work that can use finalized standards today.

Algorithmic diversity reduces dependence on one set of assumptions, but it does not guarantee independent failures. Implementations may share hash code, random generators, memory allocators, providers, and deployment infrastructure. A robust portfolio identifies which dependencies are actually different and which remain common across alternatives.

## HQC sizes and implementation questions

The [HQC project site](https://pqc-hqc.org/), retrieved for this article, lists current project encodings of 2,241-byte public key and 4,433-byte ciphertext for HQC-1, 4,514 and 8,978 for HQC-3, and 7,237 and 14,421 for HQC-5. These are project snapshots, not finalized NIST parameter tables. Version-pin any experiment because specifications and encodings can change during standardization.

These sizes show why bandwidth and buffering deserve attention. A protocol designed around a roughly one-kilobyte KEM ciphertext may need larger handshake buffers, different fragmentation behavior, or more expensive retransmissions for an alternate construction. That does not make the alternative unsuitable; it makes the transport budget a measurable design constraint.

Decryption-failure behavior requires particular scrutiny in code-based schemes. Correctness probability, decoder timing, chosen-ciphertext handling, and error reporting interact. A decoder that leaks information through variable work or unusual failures can undermine an otherwise well-studied primitive. Study the complete KEM and its current analysis rather than extracting the encryption core for application use.

The project publishes performance figures for a specified AVX2-capable Intel platform. Use them as a documented reference point, not as a prediction for a microcontroller or this course's ARM64 host. This article does not claim to have benchmarked HQC locally. A reproducible study should pin the source revision, build flags, test vectors, and serialization variant before reporting results.

## Classic McEliece as a reference point

Classic McEliece builds on a long-studied code-based lineage using binary Goppa codes and a secret decoding capability. Its major practical tradeoff is a very large public key relative to many modern KEMs, paired with compact ciphertexts. That asymmetry can be attractive when a key is provisioned once and reused for many exchanges, but difficult in protocols that transmit fresh keys frequently.

NIST IR 8545 explains why HQC was selected from the fourth round and why Classic McEliece was not selected in that decision. The outcome should not be paraphrased as “all code-based alternatives lost” or “McEliece was broken.” Selection is a portfolio and deployment decision made after evaluating multiple factors.

For engineering study, compare two scenarios: an embedded device provisioned at manufacture with a large static public key, and a web handshake transporting an ephemeral public key over a lossy network. The same public-key size has very different operational consequences. Key lifetime and forward-secrecy requirements further change the suitability of those architectures.

## Additional signatures: a continuing evaluation

NIST's [round-three additional-signature page](https://csrc.nist.gov/projects/pqc-dig-sig/round-3-additional-signatures) groups candidates by construction. It still carries a heading referring to nine selected candidates, while explicitly marking HAWK withdrawn. A careful status table must preserve the withdrawal instead of repeating the headline as a count of currently active submissions.

The roster includes multivariate schemes such as MAYO, QR-UOV, SNOVA, and UOV; MPC-in-the-head approaches such as MQOM and SDitH; isogeny-based SQIsign; and symmetric-primitive-oriented FAEST. These categories explore different combinations of public-key size, signature size, computational cost, and assumptions. Their presence in a round is an invitation to continued analysis, not a general deployment endorsement.

MPC-in-the-head signatures derive noninteractive proofs from simulated multiparty computations. Multivariate signatures use systems of polynomial equations with special secret structure. SQIsign uses isogeny-based mathematics in a signature construction distinct from the broken SIDH/SIKE key-exchange design. The [SQIsign project](https://sqisign.org/) provides its current papers and specifications for specialist study.

The SIKE break remains a useful lesson: a concrete construction can fail even when a broader mathematical area remains active. Conversely, the survival of another isogeny construction does not repair SIKE. Track exact assumptions, leaked auxiliary information, and protocol design rather than treating a family name as either a guarantee or a permanent disqualification.

## Diversity needs a failure model

Suppose a service supports ML-KEM and a future standardized HQC profile. If it chooses exactly one mechanism per connection, the portfolio offers migration flexibility, but each connection depends on the chosen mechanism. If a reviewed hybrid construction combines both, the security claim can be different. Supporting two names in configuration is not equivalent to combining their secrets securely.

The same distinction applies to signatures. Accepting either of two signatures can improve compatibility while leaving an attacker free to target the weaker accepted path. Requiring both signatures can strengthen a particular acceptance policy but increases availability and interoperability requirements. The binding between the signed message, algorithm identifiers, and both public keys must be specified; attaching two unrelated signature files does not automatically achieve a robust composite construction.

These decisions should be made through a reviewed protocol profile. An emergency migration plan can identify a supported alternate implementation, a compatible key-distribution path, and a tested policy switch without designing a new cryptographic combiner. That is useful agility even before simultaneous hybrid use is appropriate.

## Moving an experiment toward a deployable component

A laboratory evaluation should first establish deterministic inputs for official test-vector reproduction and independent randomized functional tests. Then test malformed encodings, cross-implementation exchange, memory limits, and failure handling. Record whether the implementation targets a submission version, a draft, or a final standard; the distinction belongs in the test report and artifact name.

The next stage tests the actual protocol binding and operational environment. Can every intended verifier parse the algorithm identifier? Can a key-management service generate, protect, back up, and retire the key? Can observability identify the selected mechanism without exposing secret material? Can a version upgrade distinguish an old experimental encoding from the standardized one?

Only after those questions have evidence should throughput or compactness drive a deployment decision. A fast primitive behind an unsupported certificate profile is not an interoperable identity system. Conversely, an algorithm that is not yet ready for production can still be an excellent research exercise when the scope and status are explicit.

## A practical evaluation exercise

Create a candidate record with fields for purpose, exact specification version, status source and date, claimed category, key and message sizes, supported implementations, known analysis, and protocol bindings. Add a separate field for unresolved questions. This structure prevents a benchmark table from silently becoming an approval list.

For FN-DSA, investigate sampler assurance and final encoding status. For HQC, investigate current KEM transformation, decoder behavior, and transport cost. For Classic McEliece, investigate public-key provisioning and key lifetime. For a round-three signature candidate, identify the latest submission and official comments before copying numbers from an older paper.

The deliverable is an evidence-backed decision record, not an invented winner. An organization may sensibly deploy finalized algorithms now while maintaining reproducible experiments for alternatives. The next part moves from primitive selection to protocol composition: standardized hybrid key establishment in TLS 1.3.

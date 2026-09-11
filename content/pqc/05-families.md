---
title: "The Map of Post-Quantum Cryptographic Families"
description: "Compare lattices, codes, hash-based signatures, multivariate systems, proof-derived signatures, and isogenies by assumptions and engineering tradeoffs."
slug: pqc-05-families
series: Post-Quantum Cryptography
part: 5
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, security]
difficulty: intermediate
---
# The Map of Post-Quantum Cryptographic Families

> A family is a way to organize mathematical assumptions, not a product recommendation. Different constructions within a family can have different security arguments, wire costs, and implementation risks. This chapter builds a comparison that preserves those differences and explains why a diverse portfolio can be useful.

## Objectives and prerequisites

Part 4 introduced vectors, polynomial rings, noise, and security games. Here we use that vocabulary to understand the major construction families. You will learn to compare algorithms within the same cryptographic role, distinguish family-level intuition from a concrete assumption, and interpret both successful standardization and failed candidates without drawing conclusions broader than the evidence.

Our fictional records service needs both key establishment and update signatures. It cannot replace a KEM with a signature just because the signature has fewer bytes. Its public gateway, a constrained device, and an offline signing service also have different workloads. A sensible family map starts with those roles before discussing mathematical elegance or a performance ranking.

## Start with the job, then the assumption

A KEM establishes shared secret material. A signature authenticates a message under a verification key. Hashes and symmetric encryption continue to support both. Comparing a KEM ciphertext with a signature size without naming their roles is like comparing the size of a door key with the length of a shipping receipt: both are numbers, but the numbers answer different questions.

Within a role, compare security category, implementation, and workload. The same family can support multiple roles, while some families are mainly used for signatures in current standardization. A shared label such as “lattice-based” does not make two interfaces interchangeable. An application's serialization, key storage, protocol profile, and error handling all bind it to a concrete construction.

NIST's portfolio includes final ML-KEM, ML-DSA, and SLH-DSA standards, continuing Falcon/FN-DSA and HQC work, and a separate additional-signature process. These are different maturity levels. The family comparison below is dated September 11, 2026 and does not assign final-standard status to every named scheme. [NIST overview](https://csrc.nist.gov/projects/post-quantum-cryptography)

## Lattice-based cryptography

A lattice can be viewed as the set of integer combinations of basis vectors. In high dimensions, finding suitably short vectors or recovering structure from noisy observations can be difficult. Cryptographic constructions turn carefully defined lattice-related problems into key establishment or signatures. Part 6 will derive the geometry and arithmetic rather than leaving “high-dimensional grid” as the entire explanation.

ML-KEM uses Module-LWE-related structure: public noisy polynomial equations connect to secret values. ML-DSA uses module-lattice assumptions in a signature construction with challenges, bounded responses, and rejection conditions. Both benefit from structured polynomial arithmetic, but their operations, moduli, distributions, and security arguments differ. Shared implementation vocabulary does not justify copying a parameter from one into the other. [FIPS 203](https://csrc.nist.gov/pubs/fips/203/final), [FIPS 204](https://csrc.nist.gov/pubs/fips/204/final)

Structure helps reduce representations and accelerate multiplication. It also defines a more specific assumption than a completely unstructured lattice problem. Security analysis must account for that structure. A reduction under certain conditions and the best known concrete attacks provide complementary evidence; neither can be replaced by the slogan that all lattice problems are hard.

From an engineering perspective, lattice implementations require careful sampling, modular arithmetic, encoding, and constant-time handling of secrets. Fast vectorized code can be attractive but must preserve the exact arithmetic and leakage requirements. A mathematical construction can remain sound while a particular compiled implementation exposes information through timing.

## Falcon shows diversity within lattices

Falcon's design uses NTRU lattices and a trapdoor sampling approach, with fast Fourier techniques supporting signing. Its compact signatures illustrate a different point in the lattice tradeoff space from ML-DSA. The benefit comes with a more demanding sampling implementation and numerical considerations. A label shared with ML-DSA does not make their signers equally easy to implement. [Falcon project](https://falcon-sign.info/)

The project page provides submission-era specifications and implementation results. Those are valuable for learning the design, but final FN-DSA requirements must come from the final standard when available. The current NIST record describes the standardization work as ongoing. This course therefore distinguishes Falcon design details from any claim about a finalized FIPS 206.

For an update-signing system, a smaller signature may matter when millions of constrained devices download it. The signing service might be able to tolerate more complexity if it is centralized and carefully controlled. Another system signs every interactive request and has different priorities. The same algorithm characteristic can be an advantage in one workload and irrelevant in another.

## Code-based cryptography

Error-correcting codes add structure so a legitimate receiver can recover information despite errors. Code-based cryptography uses decoding problems as a source of hardness, with constructions designed so that secret information enables an operation an attacker cannot efficiently reproduce. The distinction between a code used for communication reliability and a code used in a cryptographic assumption is essential.

HQC's stated foundation involves quasi-cyclic syndrome decoding. It is a code-based KEM selected as an additional option beyond ML-KEM. Its mathematical diversity is one reason to study it even if another construction performs better for a particular benchmark. NIST's selection report discusses a portfolio decision, not a universal victory on every engineering axis. [HQC project](https://pqc-hqc.org/), [NIST fourth-round report](https://csrc.nist.gov/pubs/ir/8545/final)

Classic McEliece is an important reference point for the family. Its design history and public-key size tradeoff help explain why a scheme can attract substantial cryptanalytic confidence yet face deployment constraints. NIST's fourth-round decision did not select it for standardization. That outcome should not be paraphrased as a mathematical break. Selection can involve deployment fit and portfolio priorities as well as security analysis. [NIST report](https://csrc.nist.gov/pubs/ir/8545/final)

The engineering work includes efficient binary operations, error sampling, decoding, and careful failure behavior. Large objects can affect memory, transport, and storage independently of operation time. A system that distributes a public key once and performs many encapsulations has a different amortization opportunity from one that transmits a fresh key for every short interaction.

## Hash-based signatures

Hash-based signatures build authentication from carefully composed hash operations. A one-time signature can expose selected secret values whose hashes are already committed in a public key. Merkle trees connect many such commitments to a compact root. More elaborate constructions combine layers to provide practical signing interfaces.

SLH-DSA descends from SPHINCS+ and combines FORS with a hypertree of one-time-signature structures. Its small public keys come with substantially larger signatures than the most compact lattice choices. The SHA2/SHAKE and small/fast parameter variants expose explicit size-versus-work tradeoffs. “Based on hashes” does not reduce the full argument to one generic collision-resistance claim. [FIPS 205](https://csrc.nist.gov/pubs/fips/205/final), [SPHINCS+ framework](https://eprint.iacr.org/2019/1086)

Stateful hash-based signatures are a separate operational category. Schemes covered by SP 800-208 require correct state management to avoid reusing one-time signing material. Restoring an old snapshot or running unsynchronized replicas can violate that requirement. A replicated signing service must treat state as security-critical, not merely as a recoverable performance cache. [SP 800-208](https://csrc.nist.gov/pubs/sp/800/208/final)

Statelessness removes that particular state-maintenance contract, but not every lifetime or usage bound. The draft SP 800-230 limited-use SLH-DSA parameters make this especially visible: their proposed size/verification tradeoff comes with a signature-count limit. We will study the tree structures and the state-versus-count distinction in Part 9. [Draft SP 800-230](https://csrc.nist.gov/pubs/sp/800/230/ipd)

## Multivariate approaches

Multivariate public-key constructions work with systems of polynomial equations over finite fields. A public map can be evaluated efficiently while the secret structure supports an operation such as finding a suitable preimage. The hoped-for asymmetry is not simply that polynomial equations look complicated; the public system must avoid revealing exploitable structure.

A trapdoor that makes signing efficient can also leave relationships that cryptanalysis exploits. Therefore the hardness of a generic random equation system does not automatically prove the security of a structured public key produced by a specific scheme. Public keys, transformation layers, and the exact distribution of equations all belong in the analysis.

The additional-signature process is the appropriate place to inspect current candidate-specific status and documentation. This chapter does not assign a single size or performance number to the entire family. Some constructions spend many bytes on public keys while others use different compression or structural choices. A useful table points to a versioned candidate rather than inventing an average “multivariate signature.” [NIST candidate records](https://csrc.nist.gov/projects/pqc-dig-sig/round-3-additional-signatures)

## MPC-in-the-head and proof-derived signatures

Another route begins with proving knowledge of a secret. Imagine a computation that checks a public statement using a hidden witness. A proof system can let a prover convince a verifier without directly revealing that witness. Turning a suitable interactive protocol into a noninteractive signature requires a carefully analyzed challenge-generation transformation and message binding.

MPC-in-the-head is an intuition for constructing such proofs: the prover simulates parties jointly evaluating a computation, commits to their views, and reveals a challenge-selected subset so the verifier can check consistency without learning the entire secret. Repetition and soundness parameters affect how convincing the proof is and how much data must be transmitted.

This is a high-level family description, not a complete signature scheme. The commitment construction, challenge distribution, transcript encoding, witness relation, and security model determine the actual result. Using a hash to generate a challenge does not automatically make an arbitrary interactive protocol into a secure signature, especially when considering quantum adversaries and their allowed queries.

The engineering profile often involves many hash, commitment, and verification operations and potentially large transcripts. Different candidates make different tradeoffs. NIST's additional-signature records provide the controlling candidate versions; they should be checked before quoting key sizes or performance. These approaches are valuable for algorithmic diversity, not a license to treat experimental schemes as deployment standards.

## Isogenies: a lesson in precise conclusions

An isogeny is a structure-preserving map between elliptic curves. Isogeny-based constructions explore problems different from the discrete logarithm on a fixed curve. Sharing elliptic-curve vocabulary with classical ECC does not make the assumptions identical. It also does not make every isogeny construction interchangeable.

The SIDH construction underlying SIKE suffered a classical key-recovery attack. Castryck and Decru's work exploited information made available by that construction, including additional point information. The correct conclusion concerns SIDH/SIKE and the relevant public data. It is not a theorem that all isogeny-based cryptography is broken. [Attack paper](https://eprint.iacr.org/2022/975)

The distinction is visible in current research: SQIsign appears in NIST's Round 3 additional-signature roster. Its compact objects and complex signing procedure represent another set of tradeoffs, and it remains a candidate rather than a final NIST signature standard. Discussing it requires its own assumptions and analysis, not an inference from either SIKE's failure or classical ECC's maturity. [SQIsign](https://sqisign.org/), [NIST roster](https://csrc.nist.gov/projects/pqc-dig-sig/round-3-additional-signatures)

## A comparison that keeps its units

The following table uses representative constructions and qualitative size profiles. These are not equal-security benchmark results. Exact standardized encodings appear in the algorithm chapters, where public keys, private keys, ciphertexts, and signatures are kept in separate columns.

| Family and representative | Main assumption or construction | Use | Object-size profile | Performance work to examine | Maturity/status |
| --- | --- | --- | --- | --- | --- |
| Module lattices: ML-KEM | Module-LWE-related construction | KEM | Public keys and ciphertexts around kilobyte scale | Polynomial arithmetic, sampling, validation | FIPS 203 final |
| Module lattices: ML-DSA | Module-lattice signature assumptions | Signature | Keys and signatures in kilobyte ranges | Rejection sampling, NTT, verification | FIPS 204 final |
| Hash-based: SLH-DSA | Domain-separated hash constructions | Signature | Tiny public keys; much larger signatures | Many hash evaluations; small/fast variants | FIPS 205 final |
| NTRU lattices: Falcon | Trapdoor sampling over NTRU lattices | Signature | Compact signatures relative to ML-DSA | Sampling and numerical/constant-time behavior | FN-DSA standardization ongoing |
| Codes: HQC | Quasi-cyclic syndrome decoding | KEM | Multi-kilobyte keys and ciphertexts | Binary arithmetic, decoding, sampling | Selected; standardization ongoing |
| Multivariate candidates | Structured polynomial equation systems | Mainly signatures here | Candidate-specific; public-key cost can dominate | Evaluation, inversion with trapdoor, encoding | Research/candidate status varies |
| Proof-derived candidates | Witness knowledge, commitments, challenge transforms | Signatures | Candidate-specific transcript and key tradeoffs | Hashing, commitments, repetitions | Research/candidate status varies |
| Isogenies: SQIsign | Isogeny-related signature construction | Signature | Compact keys and signatures | Complex signing and target-specific arithmetic | Additional-signature candidate |

The final-standard rows are grounded in FIPS 203–205, the Falcon/HQC/SQIsign rows in their project specifications, and the candidate rows in NIST's current process records cited above. A broad size profile is useful for orientation but insufficient to dimension a packet buffer or choose a certificate format.

## Diversity is not the same as redundancy

If two components share an assumption, an unexpected attack on that assumption may affect both. A portfolio spanning different foundations can reduce dependence on one line of analysis. But adding an algorithm also adds code, interfaces, tests, operational procedures, and possible implementation defects. Diversity has costs that must be justified by the threat model.

A hybrid construction is one way to combine components, but composition needs a security argument. Merely storing two keys or selecting whichever algorithm is fastest does not give “secure if either survives” behavior. The combiner, authentication, negotiation policy, and error handling determine whether that goal is achieved.

Likewise, two libraries implementing the same standard can help differential testing without providing mathematical diversity. They may share source code, design assumptions, or bugs. Conversely, two independent mathematical families may still depend on the same flawed random generator. A dependency graph should distinguish mathematical, implementation, and operational common causes.

## Worked selection discussion

Suppose the records service has an online API and a firmware-release signer. For the API, a standardized hybrid TLS group may provide an interoperable key-establishment path through a maintained library. The team should measure actual negotiated groups, handshake expansion, and failure rates. It should not replace its TLS stack with a novel KEM merely because a candidate has an attractive paper benchmark.

For firmware signing, the team should count verification operations, signature distribution frequency, bootloader memory, trust-anchor update capability, and recovery requirements. A larger signature may be acceptable if updates are infrequent. A stateful scheme may be unsuitable if the signing key is replicated without a proven state-management design. A compact experimental signature may still be unacceptable if the device cannot safely migrate when its specification changes.

Now add diversity as a requirement. The team might evaluate a hash-based option alongside a lattice signature rather than choosing two lattice implementations and calling the result assumption diversity. Whether it deploys both depends on the verifier policy and the system's supported profiles. The selection document should say which failure scenario the second option addresses.

No new benchmark is required to reason about these qualitative differences. A benchmark becomes necessary when the decision depends on CPU, memory, bandwidth, or latency limits. Part 14 will define a fair methodology and explain why comparing results from different hardware can obscure the very tradeoff being investigated.

## Learning exercise: classify before you compare

Take a proposed cryptographic dependency and fill in six fields: role, exact scheme/version, assumption, standardization state, implementation provenance, and operational constraints. If one field is unknown, record it as unknown rather than inferring it from another. A repository calling a feature “post-quantum” does not fill all six fields.

Then write a sentence beginning, “This component protects … against … provided that ….” For example, a KEM contributes to confidentiality under specified assumptions when its public key and surrounding protocol are correctly handled. That sentence exposes missing authentication and key-lifecycle conditions much more effectively than an algorithm-name checklist.

Finally, identify the evidence that could change the decision: a new standard, a cryptanalytic result, a side-channel finding, an interoperability test, or a workload measurement. This turns algorithm selection into a reviewable engineering decision rather than a permanent preference for a mathematical family.

## Knowledge check and next step

**Does the SIKE break mean every isogeny signature is broken?** No. Conclusions must follow the attacked construction and information exposed by it.

**Do two independent ML-KEM libraries provide different hardness assumptions?** No. They can provide implementation diversity, but both implement the same mathematical construction.

**Why can a larger signature be acceptable?** Distribution frequency, verifier constraints, security requirements, and implementation maturity may matter more than minimizing one object.

**Is candidate selection equivalent to a final interoperable standard?** No. Specifications and integration profiles can still change.

The map now has enough detail to choose a learning path without collapsing all PQC into one category. Part 6 zooms into lattices, following noisy equations through polynomial arithmetic and transforms so the standardized algorithms can be understood from their operations.

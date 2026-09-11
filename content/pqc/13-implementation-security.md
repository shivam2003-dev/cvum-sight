---
title: "Secure PQC Implementations: Side Channels, Faults, Randomness, and Verification"
description: "Build an assurance argument across constant-time code, decapsulation behavior, physical attacks, randomness, memory safety, test vectors, fuzzing, and scoped formal verification."
slug: pqc-13-implementation-security
series: Post-Quantum Cryptography
part: 13
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, security]
difficulty: advanced
---
# Secure PQC Implementations: Side Channels, Faults, Randomness, and Verification

> A standard defines the algorithm's behavior. A deployed implementation must also preserve its secrets while executing that behavior on a real compiler, processor, operating system, and application boundary.

## Objectives and evidence boundaries

Parts 7–9 explained the standardized algorithms; this article examines how an implementation can violate their assumptions without changing their mathematical descriptions. You will learn to distinguish timing leakage, physical leakage, fault attacks, randomness failures, memory defects, and integration errors, then assemble evidence appropriate to each threat.

The source checkpoint is September 11, 2026. The finalized algorithm specifications remain [FIPS 203](https://csrc.nist.gov/pubs/fips/203/final), [FIPS 204](https://csrc.nist.gov/pubs/fips/204/final), and [FIPS 205](https://csrc.nist.gov/pubs/fips/205/final), with current potential errata consulted where relevant. Implementation assurance is a separate claim from implementing those standards.

This is a defensive review framework, not a production cryptographic implementation. The patterns below are deliberately schematic. Replacing a maintained library's internals with a short example would remove the testing, architecture review, and assurance work that this article argues for preserving.

## Start with the attacker and the boundary

A remote client can submit chosen ciphertexts or signatures and measure response times. A colocated process may observe shared caches or other microarchitectural effects. An attacker holding a device may measure power or electromagnetic emissions, manipulate voltage or clock behavior, or access debug interfaces. These are different capabilities and require different evaluations.

Name the protected assets: long-term private keys, regenerating seeds, ephemeral secrets, internal rejection decisions, and derived session material. Name the observable outputs: return codes, timing, packet sizes, logs, crashes, power traces, and fault responses. An assurance claim is meaningful only after identifying what must remain independent of the secrets.

| Threat | Typical observation | Useful evidence | Important limitation |
|---|---|---|---|
| Remote timing | Request latency distributions | Constant-time review and targeted timing tests | Network noise can hide leakage |
| Cache leakage | Secret-dependent memory behavior | Access-pattern analysis and target-specific review | Timing proofs may model only selected effects |
| Power or EM | Physical traces | Masking assessment and laboratory evaluation | Branchless code alone is insufficient |
| Fault injection | Corrupted computations or skipped checks | Fault-model analysis and countermeasure testing | Functional tests do not reproduce physical faults |
| Memory defects | Crashes or unintended reads/writes | Sanitizers, fuzzing, memory-safety proofs | A safe buffer can still contain a leaked secret |

A cloud KEM service and a smart-meter firmware signer should not inherit identical review checklists without considering their environments. Conversely, excluding physical attacks should be an explicit scope decision, not an assumption inferred from passing remote tests.

## What constant-time programming means

In the usual software leakage model, control flow, memory addresses, and variable-latency operations should not depend on secrets. “Constant time” does not mean every request takes exactly the same wall-clock duration. Scheduling, caches affected by public inputs, and other environmental effects can vary while the sensitive computation preserves its intended independence.

A comparison that returns at the first unequal byte can reveal how long a prefix matched. A table indexed by a secret coefficient can reveal cache-line access. A division instruction may have operand-dependent latency on a target processor even when the source contains no branch. Review must therefore examine operations and generated code, not only search for if statements.

The [KyberSlash paper](https://eprint.iacr.org/2024/1049) documents exploitable secret-dependent division timing in implementations of the Kyber family. It is an implementation lesson, not evidence that every ML-KEM implementation is broken. The authors describe affected implementations, platforms, disclosure, and fixes; those details matter when assessing whether a particular deployed binary is affected.

A safer engineering pattern is to use the library's reviewed constant-time arithmetic and comparison primitives, preserve their documented input ranges, and inspect the target build. Copying a bit trick from another project without its range assumptions can introduce overflow or compiler behavior that defeats the intended property.

## Bad and safer patterns at the API boundary

```text
Unsafe design idea:
    if internal_ciphertext_check_failed:
        log recovered_message
        return a special authentication error immediately

Safer responsibility split:
    library performs the specified decapsulation and implicit rejection
    application checks public API errors and expected output length
    protocol performs its normal transcript/key-confirmation checks
    telemetry records public failure categories without secret intermediates
```

The second pattern is not complete code. It assigns sensitive decisions to a reviewed primitive and keeps the application from turning internal validity into an oracle. Public malformed-length rejection remains legitimate where specified; hiding every error indiscriminately is not the goal.

Another unsafe idea is indexing a lookup table with secret data because it is “faster than arithmetic.” A safer candidate may use a documented constant-time implementation whose memory pattern is independent of the secret. Whether that candidate is actually safe depends on the target architecture and compiler, so the label must be supported by evidence.

Likewise, a constant-time selection primitive must receive a properly formed mask and valid buffers. Converting a secret condition into a mask through an ordinary branch can reintroduce the leak before the selection occurs. Review the entire data path rather than approving one line in isolation.

## Decapsulation failures and chosen ciphertexts

ML-KEM decapsulation processes attacker-controlled ciphertexts together with secret key material. Its reencryption check and fallback-secret selection must preserve implicit rejection. A correct-length invalid ciphertext normally yields alternate secret material without exposing the internal check; later protocol authentication fails because the peers derived different keys.

Length errors, malformed keys, provider failures, and failed final authentication are distinct events. Tests should exercise all of them through supported interfaces. An application that assumes every nonempty secret output means authenticated peer success misunderstands the KEM contract. An application that logs the internal validity flag undermines the construction for the sake of diagnostics.

Rate limiting and abuse controls can reduce attack opportunities, but they do not repair an oracle. An attacker may distribute requests or exploit a low-noise local path. Use operational controls as defense in depth while fixing the sensitive behavior itself.

The Part 7 lab checked agreement, same-length corruption, and truncation. Those tests establish a few functional outcomes for one binary. They do not establish that the two same-length paths have indistinguishable timing, nor that faulted reencryption behaves safely. Each stronger claim requires additional analysis.

## Power, electromagnetic leakage, and faults

A processor can execute the same instructions and memory addresses while consuming data-dependent power. Physical leakage therefore requires a different model from ordinary constant-time software. Masking splits sensitive values into shares so individual intermediates reveal less, but the implementation must preserve the masking assumptions through arithmetic, randomness, and compiler transformations.

Masking is not achieved by XORing a secret with one random value and forgetting how subsequent operations combine it. Nonlinear functions and share interactions require specialized techniques. Evaluation must consider the order of leakage, quality of masks, reuse, glitches in hardware, and how traces are collected. This is specialist implementation work.

Fault injection can skip checks, corrupt sampled values, alter addresses, or damage a signature computation. A faulty signature can expose information in some constructions even if ordinary signatures are secure. Countermeasures may include redundancy, consistency checks, protected control flow, or verifying a generated signature before release, depending on the algorithm and fault model.

No single countermeasure covers every fault. A fault that bypasses both computation and its check defeats naive duplication. A secure-device evaluation should state the assumed attacker capabilities and test the actual hardware/firmware combination. A software unit test that flips one buffer byte is useful fault simulation, but it is not equivalent to a physical fault campaign.

## Randomness: entropy, DRBGs, and failure handling

An entropy source supplies unpredictable input; a deterministic random-bit generator expands suitable seed material into a pseudorandom stream. These roles are distinct. NIST's [SP 800-90B](https://csrc.nist.gov/pubs/sp/800/90/b/final) addresses entropy sources, while [SP 800-90A Revision 1](https://csrc.nist.gov/pubs/sp/800/90/a/r1/final) specifies DRBG mechanisms. A statistical-looking byte sequence alone does not prove adequate entropy.

Use the maintained library's random-generation interface and check failure returns. Do not replace unavailable randomness with a timestamp, process identifier, fixed seed, or a retry that silently reuses previous output. Cloned virtual machines, early boot, process forks, and device manufacturing can create repeated-state risks that ordinary desktop tests miss.

ML-KEM key generation and encapsulation need fresh random inputs. ML-DSA supports hedged and deterministic signing, but both require secure key generation, and deterministic mode does not make every implementation attack disappear. SLH-DSA also derives sensitive material from seeds whose protection is fundamental. Algorithm-specific requirements should guide the randomness interface.

Test randomness failure through controlled dependency injection in a test build. Confirm that key generation or signing fails safely, outputs are not treated as usable, and the application does not continue with stale buffers. Never ship a test-entropy override enabled in production merely because it makes failures reproducible.

## Memory safety and secret lifecycle

Bounds checks, integer ranges, aliasing requirements, and ownership rules matter in polynomial arithmetic and serialization. A buffer overflow can reveal keys even if the cryptographic operation is mathematically correct. An integer overflow can change a distribution or norm check without an obvious crash. Sanitizers and static analysis help expose these defects under tested paths.

Memory-safe languages reduce classes of accidental memory corruption, but foreign-function interfaces, unsafe blocks, assembly, and secret-dependent behavior still need review. A safe slice API does not prove constant-time execution. Conversely, a formally reviewed arithmetic backend can be undermined by an unsafe wrapper or an incorrect output-length assumption.

Zeroization aims to remove secrets when their lifetime ends. Ordinary dead-store elimination can remove a naive clearing loop if the compiler concludes the buffer is never read again. Use documented clearing mechanisms supplied by the language runtime or cryptographic library, and understand their limits regarding copies, registers, swap, crash dumps, and persistent storage.

Key custody extends beyond the live process. Private-key seeds in backups, container layers, debug attachments, or CI artifacts remain usable secrets. Define which process can obtain raw key material, which operations a signing service authorizes, and how key retirement reaches replicas and recovery copies. Cryptographic code cannot enforce a lifecycle that the surrounding system ignores.

## Compiler and vector-backend changes are security changes

A compiler upgrade can transform arithmetic, introduce branches, or select instructions with different latency characteristics. Link-time optimization and architecture flags can change the generated path. Therefore, the reviewed source file is not the entire release identity: retain compiler version, flags, target architecture, and the actual binary or reproducible build reference.

Vectorized implementations introduce lane ordering, alignment, packing, and target-dispatch concerns. AVX2, NEON, and other backends should be tested against the same known-answer and negative cases. A runtime CPU-feature check must not dispatch to unsupported instructions, and a fallback path should not quietly lose required security properties.

Performance optimizations can also change stack size or register pressure, creating spills of sensitive intermediates. An optimization should include functional, memory, and leakage review appropriate to its scope. A faster benchmark is insufficient justification for replacing a reviewed constant-time operation with a target-specific shortcut.

## Tests establish different kinds of evidence

Known-answer tests reproduce exact outputs for fixed test inputs, often including controlled randomness. They detect implementation disagreement with vectors but do not cover all inputs. Randomized functional tests explore additional cases and should include key agreement, sign/verify, wrong keys, altered messages, and malformed inputs.

NIST's [ACVP server repository](https://github.com/usnistgov/ACVP-Server) publishes material supporting algorithm testing. Pin the vector release and algorithm revision. Passing locally downloaded vectors is useful engineering evidence; it is not the same as obtaining an official validation certificate through the relevant process.

Fuzzing exercises parsers and APIs with generated or mutated inputs. Use sanitizers, resource limits, and minimized regression cases. Differential testing compares independent implementations on equivalent inputs; agreement increases confidence, but two implementations can share the same bug or interpretation. Disagreement is a starting point for investigation, not automatic proof that one specific side is correct.

Statistical timing tools such as [dudect](https://github.com/oreparaz/dudect) compare timing distributions for selected input classes. A detected difference warrants investigation. Failure to detect a difference does not prove constant-time behavior across all secrets, devices, compilers, or attack models. Test design, noise, sample count, and class selection determine what the result can reveal.

## Formal verification: read the scope before the headline

The maintained [mlkem-native project](https://github.com/pq-code-package/mlkem-native) is a useful implementation-study example. Its documentation describes memory and type-safety proofs for specified C code and functional-correctness, memory-safety, and secret-independent timing proofs for its AArch64 and x86_64 assembly. Those are scoped claims about identified components and models.

The same documentation explicitly excludes other attack classes, including power/EM, some microarchitectural effects, and fault injection, from its timing-resistance target. This is good assurance communication: it lets an integrator understand what evidence exists and what remains outside the model. Do not expand a component claim into “the whole application is formally secure.”

Review the proof's trusted computing base, specification, architecture model, assumptions about callers, and correspondence to the shipped revision. Replacing a hash backend, changing a compiler path, or modifying an interface can move the deployment outside the established proof boundary. The project's soundness documentation is as important as its performance chart.

## Standardization, algorithm testing, and module validation

FIPS 203/204/205 define algorithms. Algorithm testing evaluates conformity to specified operations. The [Cryptographic Module Validation Program](https://csrc.nist.gov/projects/cryptographic-module-validation-program) evaluates cryptographic modules under a separate framework, including an identified module boundary and operational conditions. These are related but distinct statements.

A product using a standardized algorithm is not automatically a validated module. A module certificate does not automatically cover every version, platform, provider configuration, or application integration. Check the actual certificate and security policy when validation is required, and record the approved operating conditions rather than relying on a marketing phrase.

Likewise, enabling a provider named FIPS does not establish that the entire application uses only approved operations correctly. Key import, protocol composition, entropy, configuration, and boundary conditions matter. Compliance evidence should identify the concrete module and deployment, while security review continues to examine the complete system.

## Release evidence must survive upgrades

Keep the assurance record alongside the dependency update process. A library patch may fix a timing issue while changing supported providers, encodings, or performance. The release owner should identify which tests need rerunning and which proof claims still match the shipped source and object code.

An emergency rollback also needs scrutiny. Returning to a version with a known side-channel flaw can restore availability while reopening the original vulnerability. Prefer a documented mitigation or corrected build when possible, and record the residual exposure when an operational exception is unavoidable. The important artifact is a traceable decision tied to exact versions, not a permanent green security badge.

## A review exercise with a useful deliverable

Choose one KEM or signature integration and draw its boundary from untrusted input to final authorization decision. Mark parsing, random generation, private-key access, cryptographic operation, output handling, logging, and cleanup. For each boundary, identify a test, review, or proof that supports its behavior and an explicit limitation.

Then simulate three failures: unavailable randomness, malformed public input, and a cryptographic verification failure. Confirm that no stale output becomes a success and no secret material reaches logs. These are application-level tests and can be performed without writing a new primitive or exposing internal rejection flags.

Your deliverable is an assurance record: exact versions, threat model, covered components, test results, proof scope, residual risks, and the changes that require reevaluation. Part 14 applies the same discipline to performance claims, where measurement boundaries and reproducibility are equally important.

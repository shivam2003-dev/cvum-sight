---
title: "PQC Performance Engineering"
description: "Measure post-quantum operations and complete handshakes honestly: exact wire sizes, local OpenSSL observations, CPU and memory boundaries, concurrency, and reproducible benchmark design."
slug: pqc-14-performance
series: Post-Quantum Cryptography
part: 14
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, performance, security]
difficulty: advanced
---
# PQC Performance Engineering

> Performance is a property of an operation in an environment. A signature size comes from a format; signatures per second come from a particular implementation and workload. Keeping those claims separate is the first step toward a useful comparison.

## The questions worth answering

This part turns the algorithms and protocol flows from earlier articles into a measurement plan. You will separate fixed byte counts from implementation costs, distinguish primitive throughput from service latency, and interpret a small executed OpenSSL benchmark without promoting it into a universal ranking.

The source checkpoint is September 11, 2026. Final ML-KEM, ML-DSA, and SLH-DSA sizes come from FIPS 203, 204, and 205. FN-DSA and HQC remain under standardization in the sources checked for this course, so submission-era characteristics are labelled accordingly. Performance numbers for an experimental implementation cannot establish the eventual standard's exact format or deployment behavior.

Start with a concrete question: can a firmware verifier fit its stack budget, can a gateway sustain its fresh-handshake rate, or can an offline authority finish a release-signing batch within a maintenance window? Each question emphasizes different measurements. “Which PQC algorithm is fastest?” is incomplete without naming the purpose and operation.

## Separate bytes, work, and elapsed time

A raw public key, ciphertext, or signature has a defined encoding length for the finalized parameter set. DER and PEM add framing or representation overhead. A certificate chain adds signatures, keys, names, extensions, and constraints. A TLS handshake adds protocol framing and other messages. Network traffic adds retransmissions and transport headers.

CPU cycles measure processor work under a specified counter model. Elapsed time includes scheduling and waits. Throughput measures completed operations per unit time under a workload. Tail latency describes slow requests, which can matter even when average throughput is acceptable. None of these is interchangeable with another.

Memory has several dimensions too: serialized key size, expanded key state, peak stack, heap allocation, working set, and concurrent per-request buffers. A 64-byte private-key encoding does not imply a 64-byte signing workspace. Hash-tree construction and polynomial arithmetic can require substantial temporary state.

| Measurement | Appropriate unit | Main question |
|---|---|---|
| Encoded object | bytes | Does the format fit storage and transport limits? |
| Primitive operation | cycles or microseconds | What does the selected implementation cost? |
| Service capacity | operations or handshakes per second | How much work can the service sustain? |
| User-visible latency | median and tail milliseconds | What does the caller experience? |
| Working memory | peak stack/heap bytes | Does the implementation fit the target? |
| Energy | joules per operation | What does repeated use cost on a battery? |

## A size comparison with purpose preserved

ML-KEM-768 has a 1,184-byte public key and 1,088-byte ciphertext. ML-DSA-65 has a 1,952-byte public key and 3,309-byte signature. SLH-DSA-SHA2-128s has a 32-byte public key and 7,856-byte signature. These are different purposes and categories; placing them in one table does not make them substitutes for each other. See the exact tables in Parts 7–9 and the [NIST standards project](https://csrc.nist.gov/projects/post-quantum-cryptography).

For finalized TLS X25519MLKEM768, the client share is 1,216 bytes and server share 1,120 bytes under [RFC 10024](https://www.rfc-editor.org/rfc/rfc10024.html). Compared with two 32-byte X25519 shares, the share payload grows by 2,272 bytes across both directions. This excludes all other handshake and network overhead.

The [Falcon project](https://falcon-sign.info/) reports compact submission-era signatures, including 666 bytes for its Falcon-512 figure. The [HQC project](https://pqc-hqc.org/) reports larger KEM key/ciphertext payloads than ML-KEM for its current encodings. Those observations motivate bandwidth studies, but the final FN-DSA and HQC profiles must be checked when available.

Do not compare a cached server public key with an ephemeral client key sent every connection without accounting for reuse. A large once-provisioned key can be inexpensive per transaction, while a smaller key repeatedly transmitted may dominate aggregate traffic. The protocol's key lifetime determines how the format cost is amortized.

## A reproducible local observation

The course ran OpenSSL 3.5.8 on an Apple M4 Pro with macOS 26.6.2, using the native default provider and a darwin64-arm64 build with the compiler's O3 optimization. The host was an ordinary active workstation: CPU affinity, fixed frequency, thermal state, and background activity were not controlled. The experiment is an exploratory measurement, not a publication-grade benchmark.

The command below uses the [official speed interface](https://docs.openssl.org/3.5/man1/openssl-speed/). The one-second duration is per measured operation, not for the whole command. The elapsed option uses wall-clock time. Three runs were collected; the table shows the first run explicitly rather than presenting a small sample as a stable population estimate.

```bash
OPENSSL=/path/to/openssl-3.5.8/bin/openssl
"$OPENSSL" version -a
for run in 1 2 3; do
  "$OPENSSL" speed -elapsed -seconds 1 \
    ML-KEM-768 ML-DSA-65 \
    SLH-DSA-SHA2-128s SLH-DSA-SHA2-128f \
    > "speed-$run.txt" 2>&1
done
```

| Algorithm | Key generation/s | Encapsulation or signing/s | Decapsulation or verification/s |
|---|---|---|---|
| ML-KEM-768 | 43,525.0 | 76,567.0 encapsulations | 52,587.0 decapsulations |
| ML-DSA-65 | 8,042.0 | 1,633.7 signatures | 9,200.0 verifications |
| SLH-DSA-SHA2-128s | 38.2 | 5.1 signatures | 4,878.0 verifications |
| SLH-DSA-SHA2-128f | 2,483.2 | 105.0 signatures | 1,691.0 verifications |

These results are not a category-matched security ranking: ML-DSA-65 and the category-1 SLH variants have different parameter goals. They illustrate operation asymmetry and the s/f tradeoff in this binary. The small-signature SLH variant was slower to sign but faster to verify in this run; “fast” in the parameter name does not mean every operation wins.

The raw outputs and host description are retained in the [course benchmark artifacts](https://github.com/shivam2003-dev/cvum-sight/tree/main/labs/pqc/results). No local FN-DSA or HQC benchmark is claimed. Their project measurements use different implementations and machines and should remain separate until a controlled comparison is performed.

## What the benchmark excludes

OpenSSL speed repeatedly exercises library operations inside a process. It does not measure a complete certificate-authority request, a network handshake, an HSM round trip, or application authorization. The reported rate should not be multiplied directly into a service-capacity promise without profiling those additional components.

The benchmark also does not establish latency percentiles for individual requests. A one-second aggregate can hide signing retries, scheduler interruptions, or occasional allocations. For latency analysis, use a harness that records per-operation durations, warms up deliberately, and reports a distribution with enough independent samples to support the desired conclusion.

Message hashing and representation must be specified when comparing signature implementations. A benchmark's built-in message workload is not the same as signing a multi-gigabyte artifact. A system that hashes a canonical manifest before a remote signing request has different boundaries from one that streams the entire file through a signing API.

Inspect the benchmark source or documentation for key parsing, key generation, context setup, validation, and caching behavior. The [mlkem-native benchmark page](https://pq-code-package.github.io/mlkem-native/dev/bench/) explicitly notes packed-key validation and the difference when applications retain expanded private material. Such details can explain a performance difference without any algorithmic change.

## A simple capacity calculation

Suppose a hypothetical service spends 0.2 milliseconds of CPU on a new cryptographic operation and receives 5,000 such operations per second. Multiplying gives one CPU-second of work per second, before other service costs. This is a utilization estimate, not proof that one core can meet latency objectives at that rate.

As utilization approaches capacity, queueing can increase sharply. Bursts, uneven worker scheduling, and slow dependencies produce tail latency even when long-run averages appear manageable. Provision headroom based on the complete workload and reliability target, not only the primitive's average execution time.

For bandwidth, an assumed extra 2,272 share bytes across 10,000 fresh handshakes per second gives about 22.72 million additional bytes per second before framing and retransmissions. This calculated scenario illustrates scaling; it is not a measured production rate. Resumption and connection reuse can change the number of fresh exchanges substantially.

A performance plan should therefore include connection lifetime, fresh-handshake fraction, request concurrency, and burstiness. An HTTP service with long-lived pooled connections may pay a small PQC cost per request, while a short-lived connection workload pays it repeatedly. Optimizing connection behavior can matter as much as optimizing polynomial multiplication.

## Network latency and handshake expansion

Larger ClientHello and certificate messages can change segmentation, retransmission cost, and middlebox behavior. The penalty depends on path latency, loss, congestion control, and the placement of handshake bytes in flights. A packet-count estimate based only on Ethernet MTU is insufficient for a heterogeneous Internet path.

HelloRetryRequest adds a round trip when the initial share does not match the selected group. If a change improves CPU time but increases retry frequency, user-visible latency can worsen. Measure group selection and retries together with handshake duration to locate the cause.

Compare complete handshakes with the same certificate chain, trust checks, resumption configuration, and network conditions. Otherwise, a larger certificate or disabled session cache can be mistaken for a KEM regression. Record both client and server versions, since negotiation is a two-party behavior.

For mobile and edge links, add loss and constrained bandwidth using a controlled test network or emulator. Report the emulator settings and verify that the impairment actually applied. A loopback benchmark is valuable for functionality but does not represent radio latency, energy, or packet-loss behavior.

## Memory, caches, and concurrency

Expanded polynomial matrices and intermediate vectors can reduce repeated computation at the cost of memory. A cached key may improve single-operation speed while increasing the service's working set. Under high concurrency, cache pressure and memory bandwidth can change the ranking seen in an isolated warm benchmark.

Measure peak stack on constrained devices, not just heap usage. Interrupt handlers and RTOS task stacks share a finite memory budget, and a cryptographic function that works in a desktop process can overflow a small task stack. Include worst-case paths and the compiler configuration actually used in firmware.

Concurrent verification can improve throughput when requests are independent, but it is distinct from an algorithm-specific batch-verification scheme. Do not assume a generic batch API exists for every PQ signature. Any mathematical batching method requires a reviewed construction with sound invalid-signature handling; ordinary worker pools simply process individual verifications in parallel.

Memory allocation and key parsing can be moved out of hot paths where the library supports safe reuse. Preserve tenant isolation, key rotation, and thread-safety rules when caching. A shared mutable cryptographic context can introduce correctness or security bugs that outweigh its small allocation savings.

## Hardware acceleration and portability

AVX2 and AVX-512 can accelerate suitable operations on supported x86 processors; ARM NEON and RISC-V vector extensions enable other optimized backends. Availability of an instruction set does not prove that the chosen library uses it, nor that it accelerates every phase of a KEM or signature equally.

Polynomial arithmetic, SHA-2, SHA-3/SHAKE, sampling, and encoding stress different hardware resources. A platform with fast SHA-2 instructions can behave differently from one with an optimized SHAKE implementation. Wider vectors can also affect frequency, register pressure, or code size. Measure the actual dispatch path and retain a safe fallback.

The [pqm4 project](https://github.com/mupq/pqm4) provides a research framework for Cortex-M4 measurements, while maintained PQ Code Package implementations expose architecture-specific backends and benchmark tooling. Their results are useful when the platform and measurement conditions match the question. Do not translate desktop operations per second into microcontroller feasibility by clock-frequency scaling alone.

Hardware accelerators and HSMs add queueing, interface overhead, and key-access policy. A device may have high bulk throughput but poor latency for small isolated requests. Measure end-to-end request behavior through the intended API, including failures and concurrent clients, rather than reporting only the accelerator's internal operation count.

## A benchmark protocol for defensible comparisons

First freeze the experiment: algorithm and parameter set, source revision, compiler, flags, provider, CPU model, operating system, power mode, and whether keys are packed or expanded. State exactly which work is inside the timer. Validate outputs before trusting speed results, including negative cases where relevant.

Then separate warmup from measurement, collect repeated runs, and randomize or alternate test order to reduce drift from temperature and background activity. Report the distribution and sample count. If you use cycle counters, document counter access, frequency behavior, virtualization, and whether the counter represents core cycles or another clock.

For regression testing, compare against a baseline built and measured under equivalent conditions. Set thresholds that reflect observed noise and the practical service budget. A one-percent change on a noisy shared runner may be inconclusive, while a large increase in stack usage can be decisive for an embedded target.

Finally retain raw data and scripts. A chart without the command, revision, and measurement boundary is difficult to reproduce. Distinguish observed results from calculated scenarios and from numbers copied from a primary project source. This discipline makes future upgrades easier to evaluate and prevents accidental marketing claims.

## Common misleading comparisons

Comparing ML-KEM encapsulation with signature generation is comparing different tasks. Comparing ML-DSA category 3 with SLH-DSA category 1 without labelling the categories hides a security-policy difference. Comparing a packed-key API against a preexpanded-key API can measure serialization and setup rather than core arithmetic.

Comparing process-per-operation shell commands with in-process library loops overstates the primitive's cost. Comparing local verification with remote HSM signing confounds transport and authorization. Comparing only successful requests ignores malformed-input denial-of-service behavior. A useful report names these differences instead of burying them in a footnote.

Faster code must still meet the implementation-security requirements from Part 13. Disabling validation or constant-time protections to win a benchmark changes the product being measured. Any optimization should preserve the security contract and pass relevant correctness, memory, and leakage checks.

## Energy and lifecycle costs deserve their own experiment

A battery-powered device may perform cryptography infrequently but pay a large cost to wake a radio and transmit an expanded object. Another device may remain connected while signing sensor data repeatedly. In the first case, transport energy can dominate; in the second, repeated computation and memory traffic may matter more. A CPU timing table cannot resolve that distinction.

Measure energy over a defined operation boundary that includes the relevant wakeup, computation, transmission, and return to idle. Subtract or report the idle baseline consistently, retain the instrument setup, and repeat enough times to distinguish the operation from measurement noise. State whether the result represents a development board or the final hardware.

Lifecycle costs also include firmware size, update bandwidth, key provisioning, and verification support over many years. An optimized backend that saves milliseconds but prevents deployment on a large installed fleet may be the wrong system choice. A slower portable implementation can provide useful compatibility while selected devices receive optimized paths.

These considerations belong in the same decision record as the throughput results, but they should not be collapsed into an arbitrary single score. Preserve the constraints that actually determine feasibility and document which measurements remain unknown.

## Exercises and the next lab

Recalculate the hybrid share overhead and identify which handshake fields it excludes. Explain why the SLH f variant can sign faster while verifying slower in the local observation. Design a benchmark for an offline firmware signer and another for a high-volume API gateway; list the measurements that differ.

The next part combines the executed primitive, certificate, and TLS experiments into a reproducible engineering lab with a pinned build, automated checks, and CI. Its purpose is to make the evidence repeatable, while keeping exploratory timing separate from production capacity planning.

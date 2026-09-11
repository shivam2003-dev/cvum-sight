---
title: "Post-Quantum Cryptography in the Current Landscape"
description: "The quantum threat, the standards that are final, the protocols still changing, and an engineering map for an 18-part PQC course."
slug: pqc-01-current-landscape
series: Post-Quantum Cryptography
part: 1
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, security]
difficulty: beginner
---
# Post-Quantum Cryptography in the Current Landscape

> Post-quantum cryptography changes how systems establish secrets and authenticate information. Understanding the migration means separating mathematical assumptions, standardized algorithms, protocol support, implementation quality, and operational readiness. This first chapter builds that map before the course enters the mathematics.

## What you will learn

You will be able to explain why migration can be urgent before a cryptographically relevant quantum computer exists; distinguish key establishment from signatures and symmetric encryption; read a standards announcement without confusing selection with finalization; and identify which layer of a real system a PQC change actually protects. No quantum mechanics or advanced mathematics is required. Familiarity with an HTTPS connection, a public key, and a software dependency is enough.

The course uses the September 11, 2026 landscape as its initial checkpoint. Current-state statements have primary sources. A software feature is not a benchmark, an announced rollout is not universal deployment, and a standardized algorithm is not a guarantee about every implementation. Those distinctions will recur because they determine whether an engineering decision is justified.

## Start with an ordinary connection

Imagine a service that accepts sensitive customer records over HTTPS and stores them in encrypted backups. It also distributes signed client updates. Three different security jobs appear in that short description: protecting traffic, protecting stored data, and identifying authorized software. They may share libraries, but they do not share exactly the same cryptographic exposure.

A captured network handshake can contain information that eventually allows a sufficiently capable attacker to reconstruct a session secret. A backup might instead depend on how its encryption key was generated, wrapped, and stored. A forged update signature could authorize new malicious code even if no old ciphertext is decrypted. Asking whether the service “uses quantum-safe encryption” compresses these separate questions into one label and loses the useful detail.

Our recurring example is this fictional records service. We will use it to reason about key lifetimes, certificates, deployment boundaries, and benchmarks. Its numbers are illustrative. Nothing in this example is a measurement of an actual organization, and the course does not assume that a change at its public gateway automatically protects its database, backups, or update-signing infrastructure.

## What post-quantum cryptography is

PQC consists of cryptographic constructions intended to resist attacks by both classical and quantum computers. They run on ordinary processors and communicate through ordinary networks. Their mathematical assumptions differ from the factoring and discrete-logarithm assumptions underlying widely deployed public-key systems. A laptop can execute ML-KEM without possessing a quantum processor. [NIST overview](https://csrc.nist.gov/projects/post-quantum-cryptography)

Quantum key distribution, or QKD, is different. It uses physical quantum communication to support key establishment, with its own equipment, channel, authentication, and operational requirements. PQC is the software-oriented subject of this course. Neither approach removes the need to authenticate endpoints, protect keys, or implement applications securely. A compromised process can read a plaintext record after perfectly sound cryptography has delivered it.

The phrase “post-quantum” describes the attacker model, not an assertion that quantum computers have already defeated deployed cryptography. Nor does it mean a scheme is unbreakable. Confidence comes from public analysis, explicit security assumptions, conservative parameters, careful composition, and implementation evidence. Future cryptanalysis can revise that confidence. Engineering therefore needs an update path as well as an initial algorithm choice.

## Why Shor and Grover have different consequences

Shor's work gives quantum algorithms for factoring integers and computing discrete logarithms. On an appropriate machine, these change the asymptotic difficulty of the problems used by RSA and Diffie–Hellman-style systems. Elliptic-curve cryptography relies on a discrete-logarithm problem too; its small keys do not remove this structural vulnerability. [Shor's paper](https://arxiv.org/abs/quant-ph/9508027)

Consider the difference between replacing a weak door and making the same weak door thicker. Increasing a classical public-key parameter may increase the resources of a concrete attack, but it does not remove the algorithmic reason for migration. Replacing the underlying construction addresses a different problem. This is why “use a much larger RSA key” is not the general long-term PQC strategy.

Grover's algorithm is a generic search speedup. Searching an unstructured space of N possibilities takes order √N oracle queries in its ideal model. For a uniform k-bit secret, that becomes order 2^(k/2) queries. But a query is not a free CPU instruction: implementing the cryptographic check reversibly, keeping the computation reliable, and managing depth and parallelism all matter. [Grover's paper](https://arxiv.org/abs/quant-ph/9605043)

Consequently, symmetric cryptography does not undergo the same replacement story as RSA. Symmetric encryption, authenticated encryption, hashes, HMAC, and key derivation remain essential components. Their parameters and security goals still deserve review. Hash preimage resistance and collision resistance are different problems, and neither is explained adequately by saying “quantum computers halve all security.” Part 3 will unpack the resource model; Part 2 first explains what each primitive promises.

## Harvest now, decrypt later

An attacker does not have to read intercepted data immediately to benefit from collecting it. If a transcript remains useful for many years, a later improvement in cryptanalysis can be valuable. The immediate engineering question is whether today's protection covers the entire period during which the information must remain confidential.

A useful planning model compares three durations: S, the remaining secrecy lifetime of information; M, the time needed to migrate the systems protecting it; and Q, the uncertain time until the relevant attack capability exists. The warning condition is S + M > Q. This is a heuristic for exposure, not a forecast or a probability distribution. [Mosca's migration argument](https://eprint.iacr.org/2015/1075)

Suppose our illustrative records must remain confidential for ten years and replacing every affected dependency will take four years. The organization has a fourteen-year combined horizon to reason about. It does not follow that a relevant machine will exist in fourteen years. It follows that uncertainty about the machine cannot be isolated from data retention and migration lead time. Waiting for certainty can itself consume the available response time.

Now compare a public weather response that loses sensitivity almost immediately with a long-lived private record. Both might traverse the same protocol, but their collection risks differ. A useful inventory therefore attaches information lifetime and exposure to dependencies. Counting vulnerable certificates alone does not rank all confidentiality risks, and counting encrypted disks does not explain their key-wrapping exposure.

## A KEM is not a signature

A key-encapsulation mechanism has three conceptual operations. Key generation produces an encapsulation key that may be public and a private decapsulation key. Encapsulation uses the public key to create a ciphertext and secret material. Decapsulation uses the private key and ciphertext to recover corresponding secret material. A surrounding protocol derives appropriate keys and uses symmetric protection. [SP 800-227](https://csrc.nist.gov/pubs/sp/800/227/final)

```text
Recipient                              Sender
create public ek and private dk
                 ek ------------------>
                                  encapsulate(ek)
                                  -> ciphertext c, secret K
                  <------------------ c
 decapsulate(dk, c) -> secret K'

Protocol binds identities and context; derives traffic keys.
Authenticated encryption protects application records.
```

This is a conceptual flow, not a complete authenticated protocol. If an attacker substitutes their own public key and the sender accepts it, the mathematics of encapsulation does not somehow authenticate the intended recipient. Key distribution and authentication are separate obligations. Part 7 makes the ML-KEM interface exact; Part 11 shows its role inside a standardized hybrid TLS exchange.

A signature instead connects a message with a signing key and a corresponding verification key. A verifier checks whether a signature is valid under that key. It must also decide whether the key is trusted for the claimed purpose. A valid signature from an unknown attacker's key is not a trusted software release. Certificates, trust stores, policies, and signed metadata provide the context in which mathematical verification becomes useful.

This separation explains a common deployment surprise: hybrid key establishment can protect captured traffic while a certificate chain still uses classical signatures. That is an intentional intermediate architecture with a particular threat boundary. It should not be described as complete post-quantum authentication. Migrating identity also means replacing trust anchors, issuers, hardware interfaces, and relying-party behavior.

## The standardization timeline

NIST's public PQC process began in 2016. Its 2022 selections included the predecessors of the first three published algorithms and Falcon for additional signature work. In August 2024, NIST published FIPS 203, 204, and 205. HQC was selected in March 2025 as an additional KEM using a different mathematical family. [NIST project history](https://csrc.nist.gov/projects/pqc-dig-sig), [HQC selection report](https://csrc.nist.gov/pubs/ir/8545/final)

The chronology matters because old names remain in papers, code, configuration, and packet captures. ML-KEM derives from CRYSTALS-Kyber, but a pre-standard Kyber implementation is not automatically an implementation of the final standard. Likewise, ML-DSA derives from CRYSTALS-Dilithium without making every earlier Dilithium variant interchangeable. Version and encoding are part of an interoperability contract, not cosmetic naming.

| Algorithm or document | Role | Status at this checkpoint |
| --- | --- | --- |
| FIPS 203 / ML-KEM | Module-lattice KEM | Final, August 13, 2024; consult linked potential errata |
| FIPS 204 / ML-DSA | Module-lattice signatures | Final, August 13, 2024; consult linked potential errata |
| FIPS 205 / SLH-DSA | Stateless hash-based signatures | Final, August 13, 2024 |
| Falcon / FN-DSA, planned FIPS 206 | Compact lattice signatures | Selected; ongoing standardization |
| HQC | Code-based KEM | Selected; ongoing standardization |

The first three rows are governed by [FIPS 203](https://csrc.nist.gov/pubs/fips/203/final), [FIPS 204](https://csrc.nist.gov/pubs/fips/204/final), and [FIPS 205](https://csrc.nist.gov/pubs/fips/205/final). The current [NIST overview](https://csrc.nist.gov/projects/post-quantum-cryptography) describes Falcon and HQC work as ongoing. Selection, draft release, final publication, implementation support, and module validation are different milestones.

## What is still changing

The additional-signature process entered Round 3 in May 2026. Its current roster includes different mathematical approaches and marks HAWK withdrawn. That is a reminder to inspect candidate-specific status rather than repeat an earlier cohort count. A candidate's withdrawal does not establish that every scheme in a broad family has failed. [NIST Round 3 record](https://csrc.nist.gov/projects/pqc-dig-sig/round-3-additional-signatures)

Hash-based work is also evolving. The April 2026 initial draft of SP 800-230 proposes additional limited-use SLH-DSA parameters with a limit of 2^24 signatures per signing key. These are draft, constrained-use parameters, not an unrestricted replacement for the FIPS 205 families. A stateless algorithm can still have a lifetime-use bound that an operation must respect. [SP 800-230 draft](https://csrc.nist.gov/pubs/sp/800/230/ipd)

Guidance has its own lifecycle. SP 800-227 is final KEM guidance. NIST's crypto-agility paper has a June 2026 update, while the inspected IR 8547 transition publication is still labeled an initial public draft. An engineer should retain those labels when translating documents into plans. A draft proposal is not a universal legal deadline. [SP 800-227](https://csrc.nist.gov/pubs/sp/800/227/final), [CSWP 39upd1](https://csrc.nist.gov/pubs/cswp/39/upd1/considerations-for-achieving-crypto-agility/final), [IR 8547](https://csrc.nist.gov/pubs/ir/8547/ipd)

## Protocol support is a separate layer

TLS 1.3's current base specification is RFC 9846, which obsoletes RFC 8446. RFC 9954 explains hybrid key exchange as an Informational document. RFC 10024 is Standards Track and specifies X25519MLKEM768, SecP256r1MLKEM768, and SecP384r1MLKEM1024. These names identify precise constructions; they do not invite arbitrary concatenation of whatever secrets an application happens to have. [RFC 9846](https://www.rfc-editor.org/info/rfc9846/), [RFC 9954](https://www.rfc-editor.org/info/rfc9954/), [RFC 10024](https://www.rfc-editor.org/info/rfc10024/)

A hybrid aims to retain security if a component remains secure under the construction's assumptions. The protocol must specify ordering, encoding, validation, key derivation, transcript binding, and negotiation behavior. Its larger shares can affect handshake transport and middleboxes. Observability must record the group actually negotiated, not merely a server configuration option or the list of algorithms compiled into a library.

For identity, RFC 9881 defines ML-DSA representation in X.509. That does not alone settle live TLS authentication support: the inspected ML-DSA TLS document remains an Internet-Draft, even though its publication process has advanced. Certificate encoding, handshake signatures, CA issuance, and relying-party policy have to meet. [RFC 9881](https://www.rfc-editor.org/info/rfc9881/), [TLS authentication work](https://datatracker.ietf.org/doc/draft-ietf-tls-mldsa/)

## What engineers can run today

OpenSSL provides a useful native learning path. The release page lists 4.0.2 as the latest stable release and 3.5.8 on the 3.5 LTS branch at this checkpoint; 4.1.0-alpha1 is a prerelease. The versioned 3.5 documentation includes ML-KEM, ML-DSA, and SLH-DSA in the default provider, with pkeyutl examples for their operations. [Downloads](https://openssl-library.org/source/), [provider documentation](https://docs.openssl.org/3.5/man7/OSSL_PROVIDER-default/), [command documentation](https://docs.openssl.org/3.5/man1/openssl-pkeyutl/)

Later labs inspect the installed executable and providers first. They use isolated files and explicit versions; they do not overwrite system cryptographic libraries. The presence of an algorithm in a provider does not demonstrate that a complete application uses it, that its module has a particular validation, or that its remote peer interoperates. Each of those needs a different observation.

Open Quantum Safe's liboqs remains useful for prototyping and experiments. PQ Code Package's mlkem-native is useful for studying a maintained implementation and its stated assurance coverage. Neither project's name substitutes for checking the exact release, target, configuration, and threat model. Formal verification also has a scope: a proof about arithmetic or memory safety does not automatically cover an application's authentication policy. [liboqs](https://github.com/open-quantum-safe/liboqs), [mlkem-native](https://github.com/pq-code-package/mlkem-native)

## Deployment lessons before the labs

Google's account of moving Chrome from preliminary Kyber to ML-KEM shows why client/server coordination matters. Signal's SPQR work shows that protecting the beginning of a conversation and recovering security during a continuing conversation are different goals. Apple's PQ3 account supplies another example of ongoing rekeying and protocol analysis. These are engineering accounts with dates, not a global completion certificate. [Google](https://security.googleblog.com/2024/09/a-new-path-for-kyber-on-web.html), [Signal](https://signal.org/blog/spqr/), [Apple](https://security.apple.com/blog/imessage-pq3/)

For our records service, the first useful deliverable is a boundary map. Identify where TLS terminates, where it starts again, how database and backup keys are protected, and who signs client releases. Attach an owner and update mechanism to each boundary. A gateway upgrade can be a valuable milestone while several other boundaries remain classical. Accurate scope makes that progress easier to evaluate rather than less impressive.

## Your route through the course

Parts 2–4 build the vocabulary: cryptographic primitives, the quantum threat, and small mathematical examples. Parts 5–6 map the families and derive lattice intuition. Parts 7–10 study ML-KEM, ML-DSA, SLH-DSA, and the alternatives. Parts 11–12 move those primitives into TLS and digital trust. Parts 13–15 examine implementation security, performance, and a reproducible lab. Parts 16–18 turn that knowledge into migration, deployment analysis, and a sustained learning plan.

Read the [course index](../series-pqc.html) for the complete sequence. The goal is not to memorize acronyms. By the end, you should be able to explain a flow, inspect an implementation assumption, reproduce a measurement, and distinguish what a security claim establishes from what remains untested.

## Knowledge check

**A service negotiates X25519MLKEM768 but uses an ECDSA certificate. Is it fully post-quantum authenticated?** No. The group concerns key establishment; the certificate and authentication path must be evaluated separately. This can still be meaningful protection against passive collection.

**Does a new library version prove that a connection used PQC?** No. The application may load another library, disable a provider, or negotiate another group. Inspect the actual process and handshake.

**Should migration wait until Q is known precisely?** No. The uncertainty is real, but secrecy lifetime and migration duration still determine exposure. Use explicit scenarios rather than pretending to know a quantum deadline.

## Key takeaways and next step

Separate the cryptographic job from its algorithm, implementation, protocol, and deployment evidence. Use finalized specifications for interoperable behavior and label ongoing work clearly. Part 2 now builds the cryptographic foundations needed to read those specifications without treating their interfaces as magic.

| Problem | Classical mechanism | PQ replacement or strategy | Current status |
| --- | --- | --- | --- |
| Establish traffic secrets | RSA transport, finite-field DH, ECDH | ML-KEM in a specified protocol; standardized hybrid TLS where appropriate | ML-KEM final; RFC 10024 final |
| Authenticate software or messages | RSA/ECDSA/EdDSA signatures | ML-DSA or SLH-DSA with trusted key distribution and suitable profiles | Algorithms final; ecosystem support varies |
| Preserve compact-signature alternatives | Classical signatures | Evaluate FN-DSA when its specification and implementations meet requirements | Ongoing standardization |
| Diversify KEM assumptions | Classical agreement or lattice-only migration | Track code-based HQC | Selected; ongoing standardization |
| Protect application bytes | Symmetric authenticated encryption | Retain sound AEAD and review parameters, keys, nonces, and usage limits | Remains a necessary layer |
| Protect long-lived information | Vulnerable key establishment or wrapping | Inventory collection exposure and migrate relevant boundaries | Operational work, not one algorithm switch |
| Distribute identity and trust | Classical PKI and trust stores | Plan certificate, issuer, hardware, and relying-party changes | ML-DSA X.509 RFC final; other integration work varies |

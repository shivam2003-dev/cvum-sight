---
title: "ML-DSA / FIPS 204 Deep Dive"
description: "Understand Fiat–Shamir with aborts, ML-DSA parameter sizes, message contexts, hedged signing, and a reproducible sign-and-verify experiment."
slug: pqc-08-ml-dsa
series: Post-Quantum Cryptography
part: 8
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, security]
difficulty: advanced
---
# ML-DSA / FIPS 204 Deep Dive

> A signature makes a statement about exact message bytes under a particular public key. A trustworthy system must also establish who controls that key, what the statement authorizes, and whether the verifier is interpreting the same message as the signer.

## The goal and the prerequisites

ML-DSA is the module-lattice digital-signature algorithm standardized in [FIPS 204](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf). It is derived from CRYSTALS-Dilithium, but standardized ML-DSA and earlier Dilithium variants are not interchangeable names for every encoding or interface. Applications should select the standardized algorithm explicitly and use a library that documents that implementation.

Read Parts 2, 4, and 6 first if signatures, modular polynomial vectors, and short-vector problems are unfamiliar. This article develops the signing relationship, explains why candidates are rejected during signing, distinguishes hedged and deterministic behavior, and tests context binding with native OpenSSL. It does not attempt to reconstruct the complete reference implementation from illustrative algebra.

The status checkpoint is September 11, 2026. FIPS 204 is final, dated August 13, 2024. The [publication page](https://csrc.nist.gov/pubs/fips/204/final) carries a July 31, 2026 potential-errata update covering several explanatory, notation, and loop-estimate issues. Read it alongside the standard, particularly before implementing arithmetic or interpreting rejection-loop limits.

## Signatures are public evidence, not encryption

KeyGen creates a private signing key and corresponding public verification key. Sign takes the private key, message, and context, returning a signature. Verify takes the public key, message, context, and signature, returning acceptance or rejection. Anyone with the authenticated public key can verify; verification does not require sharing the signing secret.

The core security objective is resistance to forgery even when an attacker has obtained signatures on chosen messages. The attacker should not be able to produce a valid new forgery within the relevant security model. This is a computational property, separate from the operational question of whether a signing service should have authorized a particular request.

A compromised release pipeline can ask a perfectly implemented signer to sign malicious software. A verifier can accept the resulting authentic signature while the release is unsafe. Key isolation, authorization policy, review controls, provenance, and artifact identity remain necessary. Replacing ECDSA with ML-DSA changes the cryptographic primitive, not the whole software-supply-chain trust model.

Similarly, signatures do not conceal messages and do not inherently prevent replay. A signed command needs a defined audience, version, expiry or freshness mechanism, and canonical encoding if those properties matter. The signature establishes integrity of the bytes it covers; application policy determines whether those bytes should be acted upon now.

## Parameters and exact sizes

FIPS 204 defines the following raw expanded key and signature encodings. A library may additionally support a compact seed representation for private-key storage, and PEM or DER containers introduce their own overhead. Do not compare container file sizes directly with this table.

| Parameter set | NIST category | Public key | Expanded private key | Signature |
|---|---|---|---|---|
| ML-DSA-44 | 2 | 1,312 bytes | 2,560 bytes | 2,420 bytes |
| ML-DSA-65 | 3 | 1,952 bytes | 4,032 bytes | 3,309 bytes |
| ML-DSA-87 | 5 | 2,592 bytes | 4,896 bytes | 4,627 bytes |

The suffixes encode the module dimensions: (k, ℓ) equals (4, 4), (6, 5), or (8, 7). They are not security-bit counts or signature lengths. All sets use degree-256 polynomials and modulus q = 8,380,417. This modulus differs from ML-KEM's 3,329, even though both algorithms use module-lattice arithmetic and transforms.

The public key contains a 32-byte matrix seed and a compressed high-part vector. For ML-DSA-44, four polynomials with 256 coefficients represented using 10 bits each occupy 1,280 bytes; adding the seed gives 1,312 bytes. The arithmetic explains the representation, while security depends on all parameters, including bounds, challenge weight, and hash-output lengths.

Choose a set through the protocol profile and threat model. A larger category can increase transmission and computation costs, but category labels alone do not rank complete systems. A protected category-2 signer may be a more appropriate deployed component than an exposed category-5 key in an unrestricted build job. Cryptographic strength and operational protection answer different questions.

## The public relation and the secret witness

Key generation samples short vectors s₁ and s₂, expands a public matrix A from a seed, and computes t = A s₁ + s₂. The public key retains a rounded high part t₁; a low part t₀ is kept in the private representation along with other signing material. Rounding is part of the construction, not lossy storage added afterward.

The noisy relation supplies the Module-LWE intuition: public information should not reveal the short secrets. Forgery analysis also involves finding short algebraic relations of the kind studied through Module-SIS and related variants. Saying only “it uses lattices” loses the distinction between hiding the secret and preventing a new valid short response.

The polynomial ring is again defined modulo X²⁵⁶ + 1, but ML-DSA's modulus supports its own full transform structure. Implementations can multiply transformed coefficients efficiently. The pending errata clarify an explanatory NTT formula that accidentally described evaluating a polynomial twice. An implementer should follow the precise algorithms and corrections rather than transcribing ambiguous prose literally.

No practical security follows from a tiny numeric example, but a scalar relationship exposes the cancellation. Let q = 97, A = 7, s = 3, and t = As = 21. Choose y = 4 and challenge c = 2. Then z = y + cs = 10, and Az − ct = 70 − 42 = 28 = Ay modulo 97. ML-DSA develops a carefully bounded, noisy, rounded module analogue of this relationship.

## From identification to Fiat–Shamir

Imagine an interactive identification protocol. A prover first commits to a fresh masked value derived from y. A verifier chooses a challenge c. The prover replies with a response z that combines y and the secret. The verifier checks an equation showing consistency with the public key without receiving the secret itself.

Fiat–Shamir replaces the interactive challenge with a cryptographic hash of the message and commitment. The signature becomes independently verifiable without an online challenge exchange. The hash ties the challenge to the exact statement being signed. Its domain separation, input order, and output interpretation are security-relevant details, not formatting choices.

In ML-DSA, signing computes a commitment from A y and uses its high bits with a message representative μ to derive a challenge digest. That digest expands into a sparse challenge polynomial c with prescribed weight. The response z = y + c s₁ is accompanied by compact hint information that lets the verifier reconstruct the needed high-bit commitment despite rounding.

```text
message + context + public-key binding
                  ↓
             representative μ
                  ↓
mask y → commitment high bits → challenge digest → c
  └──────────────────────────────→ response z
                                   ↓
                       bounds and hint checks
                         reject ↺ or emit signature
```

The diagram omits detailed encodings and several intermediate values. Its purpose is to show that the challenge depends on the commitment and message, while the response depends on the challenge and secret. Changing that order or hashing a different concatenation defines a different scheme.

## Why signing sometimes aborts

If every candidate z = y + c s₁ were released, its distribution could reveal information about s₁. Boundary effects are easy to see in one dimension. Suppose y is uniform over integers −4 through 4. Adding a secret-dependent shift of 2 moves the support to −2 through 6; repeated observations near the extremes distinguish this shifted distribution from another shift.

Rejection sampling filters candidates so the released distribution satisfies the construction's requirements. ML-DSA also checks low-bit and hint-related bounds needed for verification and security. Rejected candidates are ordinary internal events. They are not signatures to serialize, diagnostic records to export, or failures that justify returning an unchecked result.

The phrase Fiat–Shamir with aborts refers to this strategy. A signing request can require several candidate attempts. Verification checks one supplied signature and does not reproduce the signer's search. This asymmetry affects latency distributions: measuring only the average signing time hides the tail created by retries and other implementation behavior.

NIST's July 2026 potential errata revise expected repetitions to 4.36, 5.14, and 3.91 for the three sets, and propose 821 instead of 814 for the minimum permitted internal-signing iteration limit discussed in the document. These are pending corrections to the publication, not measured performance of the lab binary. Do not convert an average into an arbitrary small hard limit in production code.

## Signing and verification, schematically

The following outline shows responsibilities rather than executable cryptographic code. All sampling, decomposition, norm checks, hint encoding, and domain-separated hashing must follow FIPS 204 exactly.

```text
Sign(sk, message, context):
    form the specified domain-separated message input
    derive message representative and masking seed
    repeat:
        sample fresh candidate mask y from that seed stream
        derive high commitment bits from A*y
        hash representative and encoded high bits → challenge digest
        expand digest → sparse challenge c
        compute response z and required low-part information
        reject if response, low-part, or hint bounds fail
    encode challenge digest, z, and hints

Verify(pk, message, context, signature):
    decode strictly; reject malformed representation
    reject response or hint bounds violations
    derive the same message representative and challenge
    reconstruct commitment high bits using public relation and hints
    hash representative and reconstructed encoding
    accept only if the challenge digest matches
```

The verifier does not learn y or the private vectors. It uses the public key, response, and hints to reconstruct the committed value at the precision required by the scheme. Hints are controlled corrections to rounding, not arbitrary advice that the verifier should trust. Their canonical encoding and bounds are checked before acceptance.

A production implementation must also distinguish malformed input, unsupported parameters, provider errors, and a well-formed but invalid signature at its API boundary. An application should fail closed on all verification failures without treating every failure as evidence of an attack. Misconfiguration, wrong context, and message-encoding mismatches can produce the same final rejection.

## Hedged signing, deterministic signing, and contexts

FIPS 204 specifies hedged signing using fresh per-message randomness together with secret material and the message representative. It also allows a deterministic variant that replaces the external randomness input with 32 zero bytes. The resulting mask derivation still depends on secret and message inputs; it does not set the actual mask y to zero.

Both variants use the same verification algorithm. The standard favors the hedged approach for additional protection against certain implementation failures. Deterministic behavior can aid reproducibility, but it is not a blanket defense against side channels or faults. A repeated message can produce repeated internal behavior, which may matter to an attacker collecting physical measurements.

The context is at most 255 bytes and participates in the specified domain separation. Pure ML-DSA and HashML-DSA have different formatted inputs. Prehashing a file manually and then signing the digest as an ordinary message is not automatically HashML-DSA. A protocol must specify the mode, prehash algorithm when applicable, and context consistently at both endpoints.

For example, a release manifest and an access token could contain identical bytes while representing different authorizations. Distinct protocol contexts can prevent signatures from one domain being accepted in another when the protocol defines and checks those contexts. Contexts do not replace canonical message formats or authorization rules; they make one boundary explicit.

## Executed OpenSSL sign-and-verify lab

The [OpenSSL 3.5 ML-DSA documentation](https://docs.openssl.org/3.5/man7/EVP_SIGNATURE-ML-DSA/) describes context-string and deterministic parameters. This script was run with OpenSSL 3.5.8 on macOS ARM64. It creates a disposable key, verifies a signature, rejects modified content and a wrong context, and checks deterministic repetition. Keep OPENSSL pointed at the intended binary.

```bash
#!/usr/bin/env bash
set -euo pipefail
OPENSSL=${OPENSSL:-openssl}
LAB=$(mktemp -d)
trap 'rm -rf "$LAB"' EXIT
umask 077
cd "$LAB"
"$OPENSSL" version
printf '%s\n' 'release=1; artifact=example; environment=lab' > message.txt
"$OPENSSL" genpkey -algorithm ML-DSA-65 -out private.pem
"$OPENSSL" pkey -in private.pem -pubout -out public.pem
"$OPENSSL" pkeyutl -sign -rawin -inkey private.pem -in message.txt -out signature.bin -pkeyopt context-string:pqc-course
"$OPENSSL" pkeyutl -verify -rawin -pubin -inkey public.pem -in message.txt -sigfile signature.bin -pkeyopt context-string:pqc-course
python3 - <<'PY'
from pathlib import Path
assert len(Path('signature.bin').read_bytes()) == 3309
Path('changed.txt').write_bytes(Path('message.txt').read_bytes() + b'changed')
PY
if "$OPENSSL" pkeyutl -verify -rawin -pubin -inkey public.pem -in changed.txt -sigfile signature.bin -pkeyopt context-string:pqc-course > /dev/null 2>&1; then exit 1; fi
if "$OPENSSL" pkeyutl -verify -rawin -pubin -inkey public.pem -in message.txt -sigfile signature.bin -pkeyopt context-string:wrong-context > /dev/null 2>&1; then exit 1; fi
for i in 1 2; do
 "$OPENSSL" pkeyutl -sign -rawin -inkey private.pem -in message.txt -out "det$i.bin" -pkeyopt deterministic:1 -pkeyopt context-string:pqc-course
done
cmp det1.bin det2.bin
printf '%s\n' 'PASS: verification, 3309-byte signature, tamper rejection, context binding, deterministic repeat'
```

The observed run passed: signature verification succeeded, the signature was 3,309 bytes, changed content and context were rejected, and deterministic signatures matched. The default signing operation used the library's normal hedged behavior. The deterministic comparison is a functional test, not a recommendation to override deployment policy.

Add a wrong-public-key case and a corrupted-signature case as exercises. Record which public inputs changed and whether verification rejected them; do not log private keys or internal signing randomness. Testing independent implementations later provides stronger interoperability evidence than asking one binary to verify only its own output.

## Protecting the signer and scaling verification

Signing processes secret-dependent intermediates and repeats candidate generation. Constant-time arithmetic, careful memory access, fault resistance appropriate to the threat model, and secure randomness remain essential. “The loop can repeat” does not authorize arbitrary secret-dependent branches or logging intermediate rejection reasons. Each observable behavior needs analysis in the implementation's leakage model.

Protecting the key means protecting its seed as well as its expanded representation. A seed that regenerates the key is equivalent in sensitivity to the private key. Backups, crash dumps, swap, container layers, and build logs can defeat otherwise careful file permissions. A signing service should enforce request authorization and avoid handing raw signing keys to ordinary CI jobs.

Verification may be publicly accessible at high volume. Bound request sizes before expensive parsing, enforce the selected algorithm and context, and reject malformed signatures through maintained library APIs. Cache authenticated public-key parsing when appropriate, but do not let cache entries bypass trust-policy updates, revocation decisions, or tenant isolation.

Benchmark signing and verification separately. Record parameter set, binary version, provider, CPU features, message length, whether hashing and key parsing are included, and concurrency. Expanded matrix caching can trade memory for speed. A low-latency result from a warmed microbenchmark does not establish service throughput under certificate processing, queueing, and network load.

## Questions before adopting ML-DSA

Can the verifier identify the exact signed bytes and context? Does it authenticate the verification key through a defined trust path? Does it enforce freshness or release-version policy separately? Can the signing service reject unauthorized requests even when they are syntactically valid? These questions test the system around the primitive.

Explain why a rejected signing candidate is normal, while accepting an out-of-bounds signature is a security defect. Explain why a compact seed remains private-key material. Explain why changing a message's whitespace may invalidate a signature even when a human considers its meaning unchanged. A precise byte-level contract is part of a robust integration.

For a practical project, define a small versioned release-manifest format, sign it with a fixed application context, and write negative tests for altered versions, wrong audiences, unknown keys, and invalid signatures. Use a maintained cryptographic implementation throughout. Part 9 then explores a different foundation: signatures built from hash functions and authenticated trees.

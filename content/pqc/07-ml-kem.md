---
title: "ML-KEM / FIPS 203 Deep Dive"
description: "Follow ML-KEM from noisy polynomial encryption to chosen-ciphertext-secure key establishment, exact parameter sizes, implicit rejection, and a tested OpenSSL lab."
slug: pqc-07-ml-kem
series: Post-Quantum Cryptography
part: 7
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, security]
difficulty: advanced
---
# ML-KEM / FIPS 203 Deep Dive

> A KEM establishes secret material. The surrounding protocol decides whose key was used, what the secret means, and whether the peer actually possesses it. Understanding that boundary is as important as understanding the lattice arithmetic.

## What you will learn

Parts 2 and 6 supplied the prerequisites: authenticated encryption, KDFs, noisy linear systems, polynomial rings, and Module-LWE. This article connects those pieces to ML-KEM's public interface and internal construction. You will be able to trace key generation, encapsulation, decapsulation, and failure handling; distinguish raw algorithm sizes from encoded files; and reproduce both successful and unsuccessful exchanges.

The reference is [FIPS 203](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf), finalized on August 13, 2024. Its [publication page](https://csrc.nist.gov/pubs/fips/203/final) currently links potential errata. As checked on September 11, 2026, those clarify the NTT constants array and a decryption comment referring to the wrong polynomial. They are potential corrections, not a replacement algorithm or a reason to silently invent a variant.

## The interface: create a key, encapsulate, recover

A key-encapsulation mechanism has three operations. KeyGen produces an encapsulation key ek and a secret decapsulation key dk. Encaps takes ek and fresh randomness, returning a ciphertext c and a shared secret K. Decaps takes dk and c, returning a shared secret. Correctly generated inputs produce matching secrets except with the construction's extremely small failure probability.

The names prevent a common misunderstanding. Encapsulation does not accept an arbitrary application message to encrypt. It creates fresh secret material. To protect a file, a protocol derives encryption keys from that material and applies an authenticated-encryption scheme. The KEM ciphertext transports what is needed for recovery; it is not the file ciphertext.

```text
Recipient                                      Sender
KeyGen → ek, dk
             authenticated ek ------------------>
                                         Encaps(ek) → K, c
             <------------------------------- c
Decaps(dk, c) → K

       K + protocol context → KDF → traffic keys
       traffic keys + nonces → authenticated encryption
```

The authenticated arrow is a protocol requirement. An attacker who substitutes their own encapsulation key can establish their own secret with the sender. ML-KEM's mathematical security does not authenticate a public key obtained from an untrusted directory. Certificates, an authenticated handshake, or a separately provisioned trust relationship must provide that binding.

Key confirmation is another layer. A recovered byte string alone does not establish that the peer derived the same value. A protocol normally demonstrates possession through a transcript authenticator or authenticated data. NIST's final [SP 800-227](https://csrc.nist.gov/pubs/sp/800/227/final) describes KEM usage considerations; implementing the primitive is only one component of using it securely.

## Three parameter sets, exact byte counts

These are the raw encodings specified by FIPS 203, not the size of an ASN.1 container or a PEM file. All three return 32-byte shared secrets.

| Parameter set | NIST category | Encapsulation key | Decapsulation key | Ciphertext |
|---|---|---|---|---|
| ML-KEM-512 | 1 | 800 bytes | 1,632 bytes | 768 bytes |
| ML-KEM-768 | 3 | 1,184 bytes | 2,400 bytes | 1,088 bytes |
| ML-KEM-1024 | 5 | 1,568 bytes | 3,168 bytes | 1,568 bytes |

The suffix is a parameter-set identifier; it is not the length of the shared secret or a claim of 512, 768, or 1,024 security bits. Categories compare attack costs with reference primitives under NIST's framework. They are not exact universal quantum work factors. A system selects parameters according to its protocol profile, policy, performance budget, and implementation support.

The degree n is 256 and modulus q is 3,329 for every set. The module rank k grows from 2 to 3 to 4. Increasing k changes the number of polynomial components and the attack landscape. Compression parameters and noise choices also differ; changing only the rank in homemade code does not reproduce another standardized set.

For example, the encapsulation key contains k encoded polynomials plus a 32-byte matrix seed. At 12 bits per coefficient, one 256-coefficient polynomial occupies 384 bytes. Thus ML-KEM-768 uses 3 × 384 + 32 = 1,184 bytes. This calculation explains a table entry without confusing mathematical storage with an implementation's expanded in-memory representation.

## Inside the key: a compact public matrix and noisy secret

The internal K-PKE key-generation procedure expands a seed into a public matrix A and samples short secret and error vectors s and e. Conceptually it forms t = A s + e in the polynomial module. Public material includes t and the seed needed to regenerate A. Secret material retains s. The actual algorithm specifies transform representation, domain-separated hash expansion, byte encoding, and the exact sampling routines.

A public seed is not a weak secret. Its role is reproducibly generating public coefficients without shipping the whole matrix. Conversely, secret noise must follow the specified distribution and randomness requirements. Replacing that sampler with convenient small integers changes the scheme and its security argument.

Part 6's small example showed why decryption can cancel a large shared algebraic term while leaving a small residual. Here coefficients are modulo 3,329 in the ring modulo X²⁵⁶ + 1, and vectors contain several polynomials. Module-LWE supplies the noisy-equation hardness intuition. It does not excuse ignoring the exact hash functions, rejection sampling, validation, or encodings that define ML-KEM.

The NTT accelerates polynomial products. ML-KEM's modulus lacks the primitive 512th root needed for a simple full negacyclic scalar transform of this length. Its transform ends in degree-two components. A scalar pointwise-multiplication toy from a different modulus is useful for intuition, but copying that toy directly would produce incorrect ML-KEM arithmetic.

## K-PKE: the internal encryption engine

K-PKE encrypts a 32-byte internal message using specified coins. In a schematic coefficient-domain description, it samples an ephemeral short vector r and errors e₁ and e₂, then forms u from Aᵀr + e₁ and v from tᵀr + e₂ plus the encoded message. Compression reduces the transmitted coefficient widths and adds bounded rounding error.

The receiver computes a value corresponding to v − sᵀu. Substituting t = As + e cancels the main product and leaves the message embedding plus accumulated noise. Decompression and message decoding recover the bits when that noise remains within the allowed margin. This explanation intentionally omits implementation details such as transform-domain storage; the standard's algorithms remain authoritative.

A tiny rounding example makes compression concrete. Suppose an educational modulus is 17 and we represent a coefficient using four levels. A coefficient near 8 maps to a level near the halfway point; decompression returns the representative for that level, not necessarily the original coefficient. Encryption correctness must tolerate this extra error along with sampled noise. Real ML-KEM uses precisely specified integer rounding, widths, and modular conventions.

K-PKE is an internal component, not a standalone public-key encryption API approved for arbitrary application use. Its basic confidentiality property is insufficient for attackers who can submit related ciphertexts and observe decryption behavior. ML-KEM wraps it with hashing, deterministic reencryption, and implicit rejection to achieve the stronger KEM construction.

## From encryption to a chosen-ciphertext-secure KEM

The construction follows the broad Fujisaki–Okamoto transformation idea: derive encryption randomness from a candidate message, then verify recovery by reconstructing its ciphertext. This binds a recovered message to the exact encapsulation procedure. The specific transformation matters; this conceptual description is not a recipe for wrapping an arbitrary encryption scheme.

The following pseudocode summarizes FIPS 203's internal flow. H, G, and J denote the distinct hash/XOF roles defined there. Concatenation is written ||. Public wrappers perform required input checks and obtain approved randomness.

```text
KeyGen_internal(d, z):
    ekPKE, dkPKE = K-PKE.KeyGen(d)
    ek = ekPKE
    dk = dkPKE || ek || H(ek) || z
    return ek, dk

Encaps_internal(ek, m):
    K, r = G(m || H(ek))
    c = K-PKE.Encrypt(ek, m, r)
    return K, c

Decaps_internal(dk, c):
    parse dk into dkPKE, ek, h, z
    m_recovered = K-PKE.Decrypt(dkPKE, c)
    K_candidate, r = G(m_recovered || h)
    K_fallback = J(z || c)
    c_reconstructed = K-PKE.Encrypt(ek, m_recovered, r)
    return constant_time_select(c == c_reconstructed,
                                K_candidate, K_fallback)
```

Key generation uses independently generated 32-byte inputs d and z; encapsulation generates a fresh 32-byte m. These are cryptographic random inputs, not passwords, timestamps, or application identifiers. Decapsulation itself does not request fresh randomness. Its fallback secret derives from a secret value retained in the decapsulation key and the received ciphertext.

Notice that the decapsulation key includes the encapsulation key and its hash, not just the lattice secret. That explains much of its larger serialized size and enables reencryption without asking the application to supply another public key. Applications should treat the complete decapsulation-key encoding as secret material, including any seed representation supported by their library.

## Implicit rejection and the meaning of success

For a correctly sized but invalid ciphertext, decapsulation returns a pseudorandom fallback secret rather than exposing an explicit validity flag. An attacker must not learn whether the internal reencryption comparison succeeded. Secret-dependent timing, error messages, or follow-on behavior can undermine this protection even if the code returns a 32-byte buffer every time.

This does not mean all malformed inputs are accepted. External validation still checks ciphertext lengths, encapsulation-key encoding and modulus requirements, and decapsulation-key structure and hash consistency as specified. A truncated ciphertext can produce an ordinary input error. The protected distinction is the internal validity decision for an otherwise admissible ciphertext.

A successful command exit after decapsulating a corrupted same-length ciphertext therefore does not prove a successful peer exchange. It means the operation returned its specified output. The two endpoints will normally have different secret material, and the protocol's authentication or key-confirmation step fails. Logging “KEM succeeded” as “peer authenticated” collapses two distinct security events.

Operational code must check API return values, output lengths, and protocol authentication. It must also avoid recording the candidate secret, fallback secret, recovered internal message, or comparison flag in debug logs. Failure telemetry can count public input errors and handshake failures without retaining information that turns diagnostics into a decryption oracle.

## A reproducible native OpenSSL experiment

This lab was executed on macOS ARM64 using an isolated OpenSSL 3.5.8 build. It uses the native implementation documented in [OpenSSL's ML-KEM manual](https://docs.openssl.org/3.5/man7/EVP_KEM-ML-KEM/) and [pkeyutl reference](https://docs.openssl.org/3.5/man1/openssl-pkeyutl/). Set OPENSSL to the executable you intend to test; inspect its version before assuming the system command supports these algorithms.

The following script creates disposable keys, confirms agreement, flips one ciphertext bit, and separately truncates a ciphertext. It prints no secret bytes. The temporary-directory permissions reduce accidental exposure, while deletion is ordinary cleanup rather than a guarantee of forensic erasure on every filesystem.

```bash
#!/usr/bin/env bash
set -euo pipefail
OPENSSL=${OPENSSL:-openssl}
LAB=$(mktemp -d)
trap 'rm -rf "$LAB"' EXIT
umask 077
cd "$LAB"
"$OPENSSL" version
"$OPENSSL" genpkey -algorithm ML-KEM-768 -out private.pem
"$OPENSSL" pkey -in private.pem -pubout -out public.pem
"$OPENSSL" pkeyutl -encap -pubin -inkey public.pem -out ciphertext.bin -secret sender.bin
"$OPENSSL" pkeyutl -decap -inkey private.pem -in ciphertext.bin -secret recipient.bin
cmp sender.bin recipient.bin
python3 - <<'PY'
from pathlib import Path
c = bytearray(Path('ciphertext.bin').read_bytes())
assert len(c) == 1088
assert len(Path('sender.bin').read_bytes()) == 32
c[0] ^= 1
Path('corrupted.bin').write_bytes(c)
Path('truncated.bin').write_bytes(c[:-1])
PY
"$OPENSSL" pkeyutl -decap -inkey private.pem -in corrupted.bin -secret rejected.bin
if cmp -s sender.bin rejected.bin; then
  echo 'Unexpected matching secret after corruption' >&2; exit 1
fi
if "$OPENSSL" pkeyutl -decap -inkey private.pem -in truncated.bin -secret unused.bin 2>error.log; then
  echo 'Unexpected acceptance of truncated ciphertext' >&2; exit 1
fi
printf '%s\n' 'PASS: agreement, 1088-byte ciphertext, 32-byte secret, implicit rejection, length rejection'
```

The observed run passed all five checks: matching secrets for the original ciphertext, the expected 1,088-byte ciphertext, 32-byte secret output, different recovered secret after same-length corruption, and explicit failure after truncation. This is functional evidence for that binary and these inputs. It is not a conformance certificate, side-channel audit, or proof that every invalid ciphertext behaves safely.

Repeat the experiment using the other parameter names and their expected ciphertext lengths. Keep raw standard sizes separate from PEM byte counts. A PEM object includes encoding and headers; an implementation may store a seed or expanded private material in its own supported container. File size alone cannot validate the standardized raw-key representation.

## CPU, memory, and integration costs

Polynomial multiplication, sampling, hashing, and encoding all consume time. Optimized vector instructions can accelerate arithmetic, but performance depends on architecture, compiler, provider, and whether keys or expanded matrices are cached. A command-line measurement also includes process startup and file parsing, which may dominate a short cryptographic operation.

Memory planning must include more than the serialized private key. Expanded matrices, intermediate polynomial vectors, transform buffers, thread-local state, and temporary hash contexts affect stack and heap usage. A high-concurrency service multiplies some of these costs by the number of simultaneous operations. An embedded device may care more about peak stack than average CPU time.

Decapsulation requires particular care because attackers influence its input while it processes long-lived secret material. Constant-time comparisons and selections, fixed arithmetic paths where required, compiler review, and architecture-specific testing are part of the implementation obligation. The [KyberSlash research](https://eprint.iacr.org/2024/1049) illustrates how seemingly routine integer operations can create exploitable timing leakage in implementations of this algorithm family.

Protocol integration adds another cost dimension: an encapsulation key and ciphertext must fit the handshake framing and transport behavior. TLS hybrid groups specify exactly how classical and ML-KEM contributions are encoded and combined. Concatenating secrets in an application and choosing a KDF informally is not equivalent to following that protocol construction. Part 11 examines the standardized TLS profiles.

## Key lifetime and forward secrecy

A static recipient decapsulation key is convenient for asynchronous delivery, but its later compromise can expose earlier ciphertexts that an adversary recorded. ML-KEM alone does not make those historical exchanges forward secret. Ephemeral key establishment, deletion of ephemeral secrets, or a ratcheting protocol can change that exposure, provided the complete protocol establishes the claimed property.

Consider an archival upload service. If every upload encapsulates to one permanent server key, protecting that key today is essential but does not eliminate future compromise risk. If the service rotates keys daily and retains every old private key indefinitely for recovery, the effective compromise window still covers those retained keys. Rotation schedules and actual deletion policies must agree.

A threat model should therefore name the lifetime of decapsulation keys, shared secrets, derived traffic keys, backups, and diagnostic artifacts separately. Testing a fresh exchange after rotation does not demonstrate that historical material was retired. This distinction becomes especially important when comparing a one-shot KEM exchange with the recurring key updates of a messaging protocol.

## Review questions and engineering decisions

Before approving an integration, answer four concrete questions. Where does the authenticated encapsulation key come from? Which protocol-defined KDF consumes the shared secret? What demonstrates that the peer derived the same keys? What happens when input parsing, decapsulation, or the later authentication step fails? Each answer should point to an implemented mechanism and a test.

Explain why an invalid ciphertext may return a secret without an error, and why this behavior does not make it valid. Explain why replacing randomness with a fixed seed for reproducibility is acceptable only inside an explicitly controlled test. Explain why the 768 suffix does not describe a 768-bit output. These distinctions prevent more integration mistakes than memorizing the table alone.

For a small project, extend the lab into a test harness that records only algorithm name, binary version, input lengths, and pass/fail outcomes. Add wrong-key decapsulation, multiple independent exchanges, and malformed-key tests through supported library interfaces. Do not expose the internal validity decision to make testing easier; test public behavior and final key confirmation instead.

## Where this leads

ML-KEM provides a standardized mechanism for establishing secret material under a Module-LWE-based construction. Its security depends on the complete algorithm, correct implementation, sound randomness, and a protocol that supplies authentication and context. The next part studies ML-DSA, where related polynomial arithmetic supports public verification of signed messages instead of shared-secret recovery.

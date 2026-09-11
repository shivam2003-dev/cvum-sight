---
title: "The Cryptography You Need Before Learning PQC"
description: "Build the vocabulary of hashes, MACs, AEAD, key derivation, public keys, signatures, certificates, and TLS—with small reproducible experiments."
slug: pqc-02-cryptography-foundations
series: Post-Quantum Cryptography
part: 2
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, security]
difficulty: beginner
---
# The Cryptography You Need Before Learning PQC

> Cryptography is a collection of narrow contracts. A hash does not authenticate its publisher, encryption does not necessarily detect modification, and a valid signature does not decide whether its key should be trusted. Learn those contracts first and the role of each post-quantum replacement becomes much clearer.

## Objectives and prerequisites

This chapter assumes you can run a command in a shell and recognize a client/server connection. By the end, you should be able to trace how an application turns secret material into authenticated traffic, explain how a certificate connects a name to a key, and identify which steps change during a PQC migration. Part 1 supplied the landscape; no lattice mathematics is needed here.

We use a fictional service that accepts private records and distributes signed updates. When its engineers say “encrypt the file,” our first question is what the file needs protection from. Unauthorized reading, undetected modification, false attribution, replay, and deletion are different threats. A useful cryptographic design states the threat and its trust assumptions before selecting a library call.

## Three goals, three questions

**Confidentiality** asks whether an unauthorized observer can learn protected information. It does not promise that metadata, message size, timing, or the existence of a connection is hidden. **Integrity** asks whether unauthorized modifications are detected. **Authenticity** asks whether information or participation is attributable to an authorized source under the system's trust model.

These goals interact without becoming identical. A public software release may need authenticity without confidentiality. A private record needs confidentiality but also integrity: a malicious change to an account number is harmful even when an attacker never learns the full record. Availability is another requirement entirely. Correct authentication cannot make an unreachable service answer requests.

Cryptographic security definitions make such goals precise by describing an attacker, the information and interfaces available to them, and a success condition. This is more useful than asking whether an algorithm is “strong” in the abstract. Part 4 introduces the standard games. For a deeper foundational treatment, use Boneh and Shoup's [free applied cryptography book](https://crypto.stanford.edu/~dabo/cryptobook/).

## Entropy: uncertainty is a resource

A secret key should be unpredictable to the adversary. Its storage length alone does not tell you that. A 256-bit buffer filled with the same public constant has no useful secret uncertainty. A password converted into a long hexadecimal string does not acquire additional entropy merely because its representation grows.

A cryptographic random generator expands carefully obtained entropy into pseudorandom output. This is appropriate when its construction, state handling, and seeding meet the required assumptions. It differs from a simulation-oriented random generator whose outputs may be predictable after observing a small amount of state. Timestamps and process identifiers are not substitutes for a cryptographic entropy source. NIST separates entropy-source assessment from deterministic generator mechanisms in [SP 800-90B](https://csrc.nist.gov/pubs/sp/800/90/b/final) and [SP 800-90A](https://csrc.nist.gov/pubs/sp/800/90/a/r1/final).

Randomness requirements vary by operation. Key generation needs unpredictable secret material. Some signature schemes need carefully generated per-message values; others derive them deterministically under specified rules. A nonce is often required to be unique rather than secret. Replacing “unique” with “random” without checking collision risk can violate the intended contract. We will return to this distinction in the signature and implementation chapters.

## Hashes: fingerprints with a limited promise

A cryptographic hash maps a message to a fixed-size digest. Useful security goals include preimage resistance, second-preimage resistance, and collision resistance. They ask different questions: finding an input for a target digest, finding another input matching a given message, or finding any pair of distinct messages that collide. A digest is not encryption; there is no decryption key that reverses it.

Suppose a release page publishes a file and its SHA-256 digest. Recomputing the digest detects accidental corruption and verifies agreement with that published value. If an attacker controls both the file and the page, they can replace both. The digest has not authenticated the publisher. The missing ingredient is an independently authenticated value, such as trusted signed metadata.

This leads to a useful rule: ask who vouches for the expected hash. A digest in a trusted build manifest and a digest downloaded from the same compromised location have different meanings. SHA-256 remains useful in PQC systems, but the exact security property and output length must match the construction. Hash-based signatures later combine many carefully separated hash invocations; they are not simply “hash the document and trust it.” [FIPS 180-4](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)

## MACs and HMAC: authentication with a shared secret

A message authentication code computes a tag using a secret shared by participants. A verifier that knows the secret checks the tag. HMAC is a standardized construction built around a cryptographic hash; it is not the ad hoc expression “hash the secret followed by the message.” Its specified inner and outer processing matters. [RFC 2104](https://www.rfc-editor.org/rfc/rfc2104.html)

For our records service, an HMAC can authenticate messages between two components that already share a suitable key. But either holder of that key can produce valid tags. The tag does not give a third party the same evidence as a public-key signature. Shared-key distribution, rotation, and access control therefore remain central to its use.

Authentication also does not automatically stop replay. If the same valid request can be submitted twice, its tag remains valid twice. A protocol may authenticate a sequence number, timestamp, request identifier, or state transition and enforce a freshness policy. Cryptography binds the fields; the application decides what combinations are acceptable. Leaving a transaction amount outside the authenticated data defeats the intended protection even if the MAC implementation is correct.

## Symmetric encryption and authenticated encryption

Symmetric encryption uses shared secret key material to transform plaintext into ciphertext. A block cipher such as AES is a building block, not a complete file format. Its surrounding mode specifies how messages of arbitrary length are processed. Some encryption modes are malleable: changing ciphertext can predictably affect plaintext without revealing the key.

Authenticated encryption with associated data, or AEAD, combines confidentiality and integrity for protected data while also authenticating unencrypted associated data. Its conceptual inputs are a key, nonce, plaintext, and associated data. Decryption produces plaintext or a failure result. Associated data might contain a protocol version or record header that must remain readable but must not be silently changed. [RFC 5116](https://www.rfc-editor.org/rfc/rfc5116.html)

Nonce discipline is part of the security contract. A library accepting the same nonce twice does not mean reuse is safe. For constructions such as AES-GCM, reuse under a key can have serious consequences. Applications must also respect usage limits and handle authentication failure without delivering unauthenticated plaintext as trusted output. The relevant requirements are construction-specific. [SP 800-38D](https://csrc.nist.gov/pubs/sp/800/38/d/final)

Our service therefore needs a record format, key ownership, nonce allocation, error behavior, and recovery plan. PQC does not replace these responsibilities. Establishing a stronger session secret and then reusing an AEAD nonce can still compromise the channel. The safe engineering path is a maintained protocol implementation that already defines these interactions, not a custom assembly of plausible primitives.

## Key derivation: one secret, separated purposes

A key derivation function turns input keying material into keys suitable for defined uses. HKDF separates extraction from expansion. Extraction produces a pseudorandom key from input material under its assumptions; expansion derives output using a context parameter. It does not create unknown entropy from a fully known input. [RFC 5869](https://www.rfc-editor.org/rfc/rfc5869.html)

Purpose separation is the key intuition. A protocol can derive distinct client-to-server and server-to-client traffic keys, and distinguish an exporter from a traffic-encryption key. The context must be unambiguous and specified. Two components casually using the same bytes for encryption and authentication can introduce interactions the original security argument did not cover.

Password processing is a different situation. A human password may have low guessing resistance, so a password-based KDF deliberately imposes an appropriate computational and possibly memory cost. HKDF is not a replacement for that cost. A long derived key cannot conceal that the attacker only needs to search a small password dictionary. The source of uncertainty and the cost of testing guesses must both be considered.

## Public and private keys

Public-key cryptography allows a public value to participate in an operation while a related private value remains secret. The word “public” means the scheme is designed to tolerate disclosure of that value. It does not mean every public key should be trusted, or that a private key may be reused for unrelated operations.

RSA is historically important for encryption/key transport and signatures, but secure RSA operations require specified encodings and padding. Textbook modular exponentiation alone is not a safe encryption API. Its factoring-related foundation is one of the reasons for PQC migration. Different RSA schemes also have different purposes: RSA-OAEP and RSA-PSS are not interchangeable names for a single operation. [RFC 8017](https://www.rfc-editor.org/rfc/rfc8017.html)

Public-key mechanisms usually protect compact secret material or authenticate a digest/message structure. Symmetric cryptography then handles bulk data efficiently. This layered design helps explain why migrating public-key assumptions does not require replacing every byte of a record-encryption implementation. It does require checking the boundaries that deliver and authenticate the keys used by that implementation.

## Diffie–Hellman through a tiny example

Finite-field Diffie–Hellman lets two parties compute a common value from private exponents and public shares. In an intentionally insecure toy group modulo 23, take generator 5. Alice chooses a = 6 and publishes A = 5^6 mod 23 = 8. Bob chooses b = 15 and publishes B = 5^15 mod 23 = 19. Alice computes B^a mod 23 = 2; Bob computes A^b mod 23 = 2.

The equality follows from both sides reaching 5^(ab) modulo 23. The example is for arithmetic only: its tiny space is trivially searchable. Real protocols validate inputs, choose appropriate groups, derive keys from the shared value, and authenticate the exchange. Raw unauthenticated DH is vulnerable to an active intermediary establishing separate secrets with each participant.

Elliptic-curve Diffie–Hellman uses a different algebraic group with an analogous purpose. X25519 is a standardized function used for key agreement; it is not a signature algorithm. Its specified input processing and output checks belong to its protocol integration. Ed25519, despite related naming and arithmetic, is used for signatures. Reusing keys across the two roles requires care and is not an introductory design shortcut. [RFC 7748](https://www.rfc-editor.org/rfc/rfc7748.html), [RFC 8032](https://www.rfc-editor.org/rfc/rfc8032.html)

## Signatures: verification needs a trust decision

A signature scheme has key generation, signing, and verification operations. Its security goal normally considers an attacker that can obtain signatures on chosen messages and then tries to forge a new valid message/signature pair. ECDSA and EdDSA are classical examples; ML-DSA and SLH-DSA supply different assumptions for the same broad role.

The message definition is part of the protocol. Does the signer authorize raw file bytes, a canonical manifest, or a structure containing a version and destination? If a signature covers a library but not its claimed package name, an attacker may be able to place valid bytes in an unintended context. Context separation, canonical encoding, and domain separation make the authorization explicit.

Signature validity does not settle replay, freshness, revocation, or entitlement. Our update client should reject an old vulnerable release when policy forbids rollback, even if its historical signature verifies. Likewise, a signature made by a stolen key can be mathematically valid. Operational security must constrain who can request signatures and provide a recovery mechanism when a key loses trust.

## PKI and X.509: how names meet keys

A public-key infrastructure provides a way to distribute and validate trust in keys. An X.509 certificate contains a public key and statements signed by an issuer. A typical chain leads from an end-entity certificate through intermediates to a trust anchor the relying party already accepts. That final trust is configured or distributed by some external process; the chain does not prove itself from nothing. [RFC 5280](https://www.rfc-editor.org/rfc/rfc5280.html)

Validation includes more than checking signatures. Time validity, constraints, permitted purposes, name handling, and policy affect acceptance. For a TLS client, service identity checking must match the intended endpoint. A valid certificate for the wrong name does not authenticate the requested service. [RFC 9525](https://www.rfc-editor.org/rfc/rfc9525.html)

```text
Configured trust anchor
       | authorizes an issuer under constraints
Intermediate CA
       | signs a certificate under its permitted role
Service certificate
       | binds service identity to a public key
Handshake proof
       | demonstrates use of the matching private key
Authenticated connection under client policy
```

This diagram separates possession of a certificate from proof using its private key. A public certificate is meant to be copied. A successful protocol must establish that the live peer can perform the required private-key operation and that the resulting identity is acceptable. Replacing a certificate signature algorithm affects each verifier that encounters it, including devices with long update cycles.

## Where TLS 1.3 puts the pieces

In a certificate-authenticated TLS 1.3 connection, the handshake negotiates parameters and establishes secret material; authentication binds the peer and transcript; a key schedule derives traffic keys; and AEAD protects records. The handshake's group and its certificate signature algorithm are separate choices. A cipher-suite name alone does not identify all of them. The current base specification is [RFC 9846](https://www.rfc-editor.org/info/rfc9846/).

Ephemeral key agreement supports forward secrecy against later compromise of long-term authentication keys under the protocol's assumptions. It does not make the public-key agreement mathematically immune to a future quantum attack on a recorded exchange. That distinction explains why an otherwise modern classical TLS connection can still be relevant to harvest-now-decrypt-later analysis.

A KEM supplies another interface for establishing secret material. It is not simply “encrypt an arbitrary chosen message to the recipient.” Encapsulation produces the ciphertext and corresponding secret as specified. In hybrid TLS, the protocol combines the traditional and PQ components through an exact construction. Parts 7 and 11 will make those details concrete after we learn the necessary mathematics.

## Hands-on: observe three contracts

Use a POSIX shell and an isolated working directory with a maintained OpenSSL installation. Set OPENSSL to its full path if your default executable is older. These commands generate only disposable demonstration keys; they do not modify trust stores or system libraries.

```sh
OPENSSL=${OPENSSL:-openssl}
"$OPENSSL" version -a
umask 077
work=$(mktemp -d)
cd "$work"
printf 'release=1\n' > message.txt
"$OPENSSL" dgst -sha256 message.txt
"$OPENSSL" genpkey -algorithm ED25519 -out signing.pem
"$OPENSSL" pkey -in signing.pem -pubout -out verify.pem
"$OPENSSL" pkeyutl -sign -rawin -inkey signing.pem \
  -in message.txt -out signature.bin
"$OPENSSL" pkeyutl -verify -rawin -pubin -inkey verify.pem \
  -in message.txt -sigfile signature.bin
printf 'release=2\n' > changed.txt
if "$OPENSSL" pkeyutl -verify -rawin -pubin -inkey verify.pem \
  -in changed.txt -sigfile signature.bin; then
  echo 'ERROR: modified message accepted' >&2
  exit 1
fi
```

Validation: these commands were run with an isolated OpenSSL 3.5.8 build on macOS arm64. The original signature verified and the modified-message check failed as intended. The tiny DH example was independently recalculated.

The original should verify, while the modified message must produce a nonzero verification result. The negative check is essential: a script printing a signature proves less than a verifier rejecting the wrong content. The generated verification key is trusted here only because we created it ourselves in the experiment. This is not a complete release-signing system. Command behavior is documented in [OpenSSL pkeyutl](https://docs.openssl.org/3.5/man1/openssl-pkeyutl/).

## What PQC replaces—and what remains

| Component | PQC migration role | Responsibility that remains |
| --- | --- | --- |
| RSA, finite-field DH, ECDH | Replace vulnerable public-key assumptions in relevant protocols | Authentication, validation, key derivation |
| ECDSA, EdDSA, RSA signatures | Introduce appropriate PQ signatures and profiles | Key trust, authorization, freshness, revocation |
| AEAD and symmetric encryption | Retain sound constructions; review parameters and usage | Key secrecy, nonce discipline, failure handling |
| Hashes, HMAC, KDFs | Continue as components with suitable security goals | Domain separation and correct composition |
| PKI and code signing | Migrate algorithm support across trust relationships | Issuer policy, rollback protection, update distribution |
| Random generators | Supply required uncertainty to new algorithms | Entropy, state protection, reseeding and failure behavior |

## Knowledge check and next step

**Why is a public digest insufficient to authenticate a release?** Anyone controlling both release and digest can replace them together. The expected value must be independently authenticated.

**Does a successful signature check prove the file is the newest permitted version?** No. The signed structure and update policy must express and enforce freshness or rollback requirements.

**Why not use the raw DH output everywhere?** Different operations need specified derivation and purpose separation. Matching bytes at both ends does not establish a sound multi-purpose key schedule.

The useful habit is to name the contract and its missing context at every step. Part 3 changes the attacker model while preserving that discipline: it explains precisely why quantum algorithms affect some of these contracts much more dramatically than others.

---
title: "PQC in PKI, X.509, Certificates, and Digital Trust"
description: "Separate certificate keys from issuer signatures, understand RFC 9881 ML-DSA encodings, test a local chain, and plan CA, revocation, artifact-signing, and long-term trust migration."
slug: pqc-12-pki-trust
series: Post-Quantum Cryptography
part: 12
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, pki, security]
difficulty: advanced
---
# PQC in PKI, X.509, Certificates, and Digital Trust

> Key establishment protects a session's secret material. A public-key infrastructure establishes which keys are trusted for which identities and purposes. Their migration schedules overlap, but neither migration proves the other complete.

## Scope and current standards

Part 11 demonstrated a hybrid TLS connection authenticated by a classical certificate. This part examines the separate signature and trust infrastructure. You will distinguish a certificate's subject key from its issuer signature, understand the standardized ML-DSA identifiers, generate a local chain, and identify the dependencies that make trust-anchor migration slow.

The principal profile is [RFC 9881](https://www.rfc-editor.org/rfc/rfc9881.html), published in October 2025 on the Standards Track. It specifies ML-DSA conventions for X.509 certificates and certificate revocation lists, including public and private key representations. It builds on the certificate-processing framework in [RFC 5280](https://www.rfc-editor.org/rfc/rfc5280.html).

As checked on September 11, 2026, the separate [ML-DSA-in-TLS document](https://datatracker.ietf.org/doc/draft-ietf-tls-mldsa/) is still an Internet-Draft, revision 05. An advanced approval state does not make it a published RFC. Certificate encoding, TLS handshake-signature negotiation, browser trust policy, and library support are separate readiness questions.

## Read a certificate as two cryptographic statements

An X.509 certificate contains a subject public key and an issuer's signature over the encoded certificate body. The subject key may be used later by the subject to sign a handshake or artifact. The issuer signature binds that key and the certificate's identity, validity, and constraints according to the CA's policy.

These algorithms need not be the same. An ML-DSA CA can issue a certificate containing an ECDSA subject key, or a classical CA can issue one containing an ML-DSA key if the software and profile permit it. The first changes the certificate signature; the second changes the subject's signing capability. Neither alone makes every link in a trust path post-quantum.

```text
locally trusted root key
          │ verifies issuer signature
          ▼
intermediate certificate: identity + constraints + subject key
          │ verifies issuer signature
          ▼
leaf certificate: service identity + purpose + subject key
          │ verifies proof of possession / application signature
          ▼
authenticated handshake or signed artifact
```

The root is trusted because it was securely provisioned into the verifier's policy or trust store. Its self-signature does not manufacture that trust. A root rollover must therefore reach verifiers through an already trusted update mechanism or another explicitly authorized provisioning process.

## Path validation remains more than signature verification

A cryptographically valid signature is only one check in certificate path validation. The verifier also considers validity periods, issuer relationships, basic constraints, path length, key usage, extended key usage, name constraints where applicable, and trust policy. Service identity verification adds the expected hostname or other application identity.

For example, an ML-DSA signature can verify on a certificate issued for another hostname. Accepting that certificate for your intended server would still be an authentication failure. The application must preserve its identity checks when adding a new algorithm. A library's successful key parse is even further from a completed trust decision.

A migration inventory should record each certificate's subject-key algorithm and issuer-signature algorithm separately. It should also record the path actually built by important clients, because cross-signing and multiple intermediates can lead different clients to different roots. Counting certificates with ML-DSA subject keys alone does not measure complete post-quantum path coverage.

The same care applies to offline verifiers. A device can retain a root for years without network access. If that root's algorithm becomes unsuitable, distributing a replacement may require a firmware update whose own authentication relies on the old root. Planning this dependency before an emergency is more useful than simply shortening leaf-certificate lifetimes.

## RFC 9881 identifiers and encoding rules

RFC 9881 uses the following NIST object identifiers. AlgorithmIdentifier parameters are absent; they are not encoded as an ASN.1 NULL value. Strict representation matters for interoperability and for avoiding ambiguous algorithm interpretation.

| Algorithm | OID | Subject public-key bytes | Signature bytes |
|---|---|---|---|
| ML-DSA-44 | 2.16.840.1.101.3.4.3.17 | 1,312 | 2,420 |
| ML-DSA-65 | 2.16.840.1.101.3.4.3.18 | 1,952 | 3,309 |
| ML-DSA-87 | 2.16.840.1.101.3.4.3.19 | 2,592 | 4,627 |

The profile uses pure ML-DSA, not HashML-DSA, for these certificate and CRL signatures. The signature covers the DER-encoded to-be-signed structure, and the context is the empty string. An application-specific context from Part 8's file-signing lab must not be inserted into certificate signing unless a different protocol explicitly defines it.

Private-key containers can represent a seed, expanded key, or supported combination under the profile. A seed that regenerates a private key is equally sensitive. When both representations are present, consistency matters: importing contradictory seed and expanded material without checking can lead different implementations to derive different public keys or signatures.

Do not register a private OID merely to work around a library that lacks the standardized one. Experimental identifiers can be appropriate inside explicitly isolated research, but carrying them into production creates another migration problem. The receiving parser, signer, trust engine, and protocol negotiator all need to agree on the actual algorithm.

## Certificate size: count the whole chain

A leaf containing an ML-DSA-44 public key and signed by an ML-DSA-65 issuer already contains 1,312 + 3,309 = 4,621 bytes of public-key and signature payload. Names, extensions, validity fields, identifiers, and ASN.1 framing add more. This arithmetic is a lower-level component total, not a predicted final certificate length.

In the executed lab below, that particular leaf certificate occupied 4,912 DER bytes. Different extensions or names change the result. A chain can add one or more similarly sized intermediate certificates. The root is often provisioned separately rather than transmitted, but the exact protocol and server configuration determine the delivered chain.

Larger chains affect TLS handshake flights, caches, status responses, certificate-management APIs, and embedded parsers. A database column or message queue that assumed small certificates can fail before cryptographic verification begins. Test maximum supported chain sizes and parser limits through the actual delivery path.

Compression can reduce some certificate overhead where a protocol supports it, but it does not change the raw signature size or eliminate parsing and validation work. Avoid estimating compressibility from repeated example certificates: real cryptographic values have little redundancy, while names and repeated metadata may compress differently.

## CA migration by trust role

Roots typically have long lifetimes and broad distribution. Intermediates can isolate issuance policy and support more frequent rotation. Leaf certificates are replaced most often but must be accepted by the deployed client population. A migration plan should treat these as distinct workstreams with different ownership and rollback constraints.

One practical sequence is to establish a private test hierarchy, validate issuance and revocation tooling, exercise clients, and only then plan trust-anchor distribution. This does not prescribe a universal public-Web-PKI rollout order. Browser root programs, enterprise policy, regulated environments, and device-update mechanisms impose different requirements.

Cross-signing can connect an intermediate to multiple trust anchors, but it can also preserve a classical path that clients continue to select. Record the accepted path rather than assuming the presence of a new certificate changes the effective security. Path-building behavior and trust-store contents belong in the interoperability matrix.

A CA migration also affects enrollment protocols, certificate requests, linting, audit systems, backup ceremonies, key recovery policy, and hardware signing interfaces. Test issuance under load and during failover. A command that signs one certificate successfully does not establish that the production CA can maintain its operational guarantees.

## Executed local ML-DSA chain lab

This experiment uses OpenSSL 3.5.8 on macOS ARM64. It creates a disposable ML-DSA-65 root and an ML-DSA-44 leaf, verifies the leaf for localhost, and rejects a wrong hostname. The root is trusted only through the command's explicit CAfile; nothing is installed into the operating system's trust store.

```bash
#!/usr/bin/env bash
set -euo pipefail
OPENSSL=${OPENSSL:-openssl}
LAB=$(mktemp -d)
trap 'rm -rf "$LAB"' EXIT
umask 077
cd "$LAB"
"$OPENSSL" version
"$OPENSSL" req -config /dev/null -x509 -newkey ML-DSA-65 -noenc -keyout root.key -out root.pem -days 2 -subj '/CN=PQC Lab Root' -addext 'basicConstraints=critical,CA:TRUE,pathlen:0' -addext 'keyUsage=critical,keyCertSign,cRLSign'
"$OPENSSL" req -config /dev/null -new -newkey ML-DSA-44 -noenc -keyout leaf.key -out leaf.csr -subj '/CN=localhost'
cat > leaf.ext <<'EOF'
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature
extendedKeyUsage=serverAuth
subjectAltName=DNS:localhost
EOF
"$OPENSSL" x509 -req -in leaf.csr -CA root.pem -CAkey root.key -set_serial 2 -days 1 -extfile leaf.ext -out leaf.pem
"$OPENSSL" verify -CAfile root.pem -purpose sslserver -verify_hostname localhost leaf.pem
if "$OPENSSL" verify -CAfile root.pem -verify_hostname wrong.example leaf.pem > /dev/null 2>&1; then exit 1; fi
"$OPENSSL" x509 -in leaf.pem -outform DER -out leaf.der
"$OPENSSL" x509 -in leaf.pem -noout -text > leaf.txt
python3 - <<'PY'
from pathlib import Path
s=Path('leaf.txt').read_text()
assert 'ML-DSA-65' in s and 'ML-DSA-44' in s
print('Leaf DER bytes:',Path('leaf.der').stat().st_size)
print('PASS: ML-DSA issuer/subject algorithms, trusted path, hostname rejection')
PY
```

The observed result was leaf.pem: OK, a 4,912-byte leaf DER encoding, and rejection of the wrong hostname. The leaf text contained ML-DSA-44 for its subject public key and ML-DSA-65 for its issuer signature. This is functional evidence for local certificate generation and path verification using that binary.

It does not establish public browser acceptance, a production CA profile, HSM support, or a standardized TLS CertificateVerify deployment. Those are separate experiments. The fixed serial and short lifetimes are suitable only for this disposable hierarchy; a real CA requires a proper issuance database and serial-number policy.

## Revocation and status infrastructure

Certificate revocation lists are signed objects too. RFC 9881 explicitly profiles ML-DSA in CRLs, so an issuance migration should include CRL generation, distribution, parsing, and signature verification. A verifier that accepts the new leaf format but cannot process its issuer's status information may fail or silently follow an unintended policy.

OCSP adds another signed-response path, described by [RFC 6960](https://www.rfc-editor.org/rfc/rfc6960.html). The responder's certificate, signature support, delegated authority, freshness, and client behavior must all be tested under the applicable profile. A certificate-format standard should not be read as proof that every status client already supports the corresponding response signature.

Revocation semantics also affect availability. Some systems fail open when status cannot be fetched; others fail closed. A larger response or unsupported algorithm can turn a cryptographic migration into a reliability problem or a policy bypass. Preserve the intended status policy and make failures observable during canary testing.

Short-lived certificates can reduce some reliance on revocation but do not remove every need for emergency distrust or key compromise response. A stolen signing key can remain dangerous during its validity window, and long-lived signed artifacts need separate verification policy. The correct choice depends on the application and its update cadence.

## Code, packages, documents, and artifacts

Software signatures often outlive an individual network session. A verifier may need to check an old package, boot image, container provenance statement, or document years after creation. Replacing TLS key establishment does not change those stored signatures. Inventory their formats, signing services, trusted roots, and offline verification paths separately.

Package and artifact ecosystems define their own signature containers and metadata rules. A library supporting ML-DSA does not automatically make a package manager, document viewer, or secure-boot firmware accept it. The format must identify the algorithm and bind the intended content, version, and signer identity without ambiguity.

For a release system, sign a canonical manifest that identifies artifact digests, version, target platform, and relevant policy fields. A signature on an unlabelled digest can be replayed in another context if the surrounding format fails to bind its meaning. A post-quantum primitive cannot repair an underspecified release format.

Document signing may additionally require evidence about signing time, certificate status at that time, and long-term archival policy. Those are protocol and evidence-management questions. Cryptographic validity today does not by itself establish a historical authorization or a legal conclusion about the signature.

## Timestamps and long-lived evidence

A trusted timestamp can bind a digest to an asserted time under a timestamp authority's signature; [RFC 3161](https://www.rfc-editor.org/rfc/rfc3161.html) defines a widely used protocol. It can help establish that an object existed before a later key compromise or expiration, subject to the verifier's policy and the trustworthiness of the timestamp infrastructure.

The timestamp signature itself has an algorithm and a trust chain. If those become forgeable, preserving only the old timestamp token may not preserve the desired evidence. Long-term systems need a strategy for renewing evidence while existing mechanisms are still trustworthy, retaining validation material, and recording policy decisions.

Re-signing an old artifact with a new algorithm is useful only if the system can still establish that the old artifact was authentic when it was accepted. Once the old authentication mechanism is already forgeable, blindly re-signing everything can bless attacker-created objects. Migration timing therefore matters for signatures as well as confidentiality.

An archival test should restore an old object, its signatures, relevant certificates, status evidence, and timestamps in an isolated verifier. Confirm which evidence is needed and which external services are assumed available. This exercise often reveals undocumented dependencies that ordinary live verification hides.

## HSMs, key custody, and rotation

Hardware security modules and managed key services expose specific algorithms, parameter sets, mechanisms, and firmware versions. Ask whether they support generating keys internally, signing through the intended API, secure backup, replication, audit, and retirement. “PQC roadmap” is not an answer to those operational questions.

Private-key seed formats can complicate import/export policy. A service that forbids expanded-key export but permits exporting an equivalent seed has not preserved non-exportability. Review every representation and recovery mechanism as part of the key boundary. Test that logs and diagnostic interfaces expose only public information.

Rotation must update the signer, certificates or public-key distribution, verifier policy, and cached metadata coherently. During overlap, document which old signatures remain acceptable and for how long. Removing a key from the active signing service does not necessarily revoke trust in its historical signatures, and those two actions should not be conflated.

For an offline root, rehearse the migration ceremony and recovery process before the old algorithm becomes urgent to replace. Ensure enough authorized personnel, compatible tooling, and verifier-update channels exist. These organizational dependencies can dominate the schedule even when the underlying signing operation is fast.

## An interoperability matrix and review questions

Build a matrix whose rows are clients or verifiers and whose columns include certificate parsing, path building, hostname checks, constraints, CRLs, OCSP where used, artifact format, and algorithm negotiation. Include old firmware and offline devices, not only current desktop libraries. Mark each cell tested, unsupported, or unknown with a version and date.

Negative tests should include an unknown issuer, expired leaf, wrong hostname, invalid basic constraints, wrong key usage, altered certificate bytes, and an unsupported algorithm. A migration that preserves only positive verification has not demonstrated that the trust engine still rejects invalid identities and paths.

Explain why a classical issuer signing an ML-DSA leaf leaves a classical dependency. Explain why a trusted root's self-signature is not the source of its trust. Explain why an RFC defining an OID does not prove browser acceptance. Finally, identify the oldest verifier that must receive a new trust anchor in your environment.

The next part examines implementation security beneath these interfaces: timing leakage, faults, randomness, memory safety, and the limits of tests and formal assurance. PKI relies on those properties while adding its own policy and lifecycle obligations above them.

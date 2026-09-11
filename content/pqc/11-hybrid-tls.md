---
title: "Hybrid Post-Quantum Cryptography and TLS 1.3"
description: "Trace standardized ML-KEM hybrid groups through TLS 1.3, exact share ordering, negotiation, retry behavior, transport costs, and a verified local OpenSSL exchange."
slug: pqc-11-hybrid-tls
series: Post-Quantum Cryptography
part: 11
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, tls, security]
difficulty: advanced
---
# Hybrid Post-Quantum Cryptography and TLS 1.3

> Enabling a hybrid group is a configuration change. Establishing that clients actually negotiate it, authenticate the intended server, and tolerate its transport costs is an engineering exercise with several separate measurements.

## Standards checkpoint and learning goals

This article uses [RFC 10024](https://www.rfc-editor.org/rfc/rfc10024.html), published in August 2026 on the Standards Track, for three ML-KEM hybrid groups. [RFC 9954](https://www.rfc-editor.org/info/rfc9954) provides the Informational hybrid-construction framework. The current TLS 1.3 specification is [RFC 9846](https://www.rfc-editor.org/info/rfc9846), which obsoletes RFC 8446 while retaining the TLS 1.3 version number. These statuses were checked on September 11, 2026.

You should already understand ECDHE, KEMs, transcript authentication, HKDF, and authenticated encryption from Parts 2 and 7. The goal here is to connect those concepts to bytes and observable protocol behavior. We will distinguish group negotiation from certificate signatures, calculate share overhead, examine HelloRetryRequest, and run an authenticated local exchange using native OpenSSL 3.5.8.

A document becoming an RFC does not prove that every deployed library implements every revised requirement. Version-specific tests and conformance work remain necessary. The local experiment demonstrates the named hybrid exchange and certificate verification; it is not a complete RFC 9846 conformance assessment.

## Why combine classical and post-quantum mechanisms?

A hybrid exchange combines independently generated contributions from a traditional mechanism and a post-quantum mechanism through a specified construction. The intended security property is preservation of shared-secret security when at least one component remains secure, subject to the construction's assumptions and correct implementation. This reduces dependence on either component alone during migration.

The claim has boundaries. If an attacker steals both ephemeral private states from an endpoint, the combiner cannot restore secrecy. If a shared random generator is compromised, both contributions may be affected. If the protocol fails to authenticate its negotiation, an attacker may change what the peers think they selected. Hybrid cryptography does not remove the endpoint and composition parts of the threat model.

A standardized hybrid group packages the component encodings and shared-secret combination into one negotiated identifier. It does not negotiate two unrelated groups and hope the application combines them correctly. The exact order, lengths, validation rules, and TLS key-schedule integration are defined by the profile.

## Three groups and their wire costs

The following sizes describe the key_exchange payload inside a KeyShareEntry. They exclude the group identifier, length fields, extension framing, other ClientHello fields, TLS records, and transport headers.

| Group | Code point | Client share | Server share | Combined secret |
|---|---|---|---|---|
| X25519MLKEM768 | 4588 / 0x11EC | 1,216 bytes | 1,120 bytes | 64 bytes |
| SecP256r1MLKEM768 | 4587 / 0x11EB | 1,249 bytes | 1,153 bytes | 64 bytes |
| SecP384r1MLKEM1024 | 4589 / 0x11ED | 1,665 bytes | 1,665 bytes | 80 bytes |

For X25519MLKEM768, the client sends the 1,184-byte ML-KEM-768 encapsulation key followed by a 32-byte X25519 share. The server returns the 1,088-byte ML-KEM ciphertext followed by its 32-byte X25519 share. The combined secret places the 32-byte ML-KEM output first, followed by the 32-byte X25519 secret.

The P-256 and P-384 groups use the opposite component order: ECDHE first, then ML-KEM, for shares and shared secrets. Their uncompressed curve points occupy 65 and 97 bytes. P-384's ECDHE shared secret is 48 bytes, so its combined secret totals 48 + 32 = 80 bytes. The group name alone is not a safe encoding specification.

This ordering detail is a useful review test. A generic helper that blindly concatenates components in alphabetical order would be incorrect. Supported library APIs should handle the wire format; applications should configure and observe the group instead of rebuilding the combiner.

## Registry recommendation and obsolete experiments

The [IANA TLS registry](https://www.iana.org/assignments/tls-parameters) marks X25519MLKEM768 Recommended Y and the two NIST-curve hybrids Recommended N at this checkpoint. All three are standardized by RFC 10024. A registry recommendation flag is distinct from whether a mechanism has a standard, whether it is appropriate under a particular policy, or whether its cryptography is broken.

RFC 10024 also addresses obsolete experimental groups, including X25519Kyber768Draft00 at 0x6399 and SecP256r1Kyber768Draft00 at 0x639A. Those names refer to earlier Kyber-based experiments. They should not be presented as alternate spellings for the final ML-KEM groups or retained as an undocumented fallback after migration.

Inventory systems should record both the human-readable group and numeric identifier. This helps distinguish old telemetry labels, draft experiments, and standardized deployments. A dashboard that normalizes every name containing “Kyber” or “MLKEM” into one green PQC status can conceal a real interoperability or policy gap.

## Where the secret enters the TLS key schedule

TLS 1.3 separates the cipher suite from key establishment and signature algorithms. A suite such as TLS_AES_256_GCM_SHA384 identifies record protection and the associated hash; it does not tell you whether the handshake used X25519 or a hybrid group. Group and signature telemetry are separate fields.

Conceptually, HKDF-Extract combines the negotiated key-establishment secret with a derived value from the early stage of the schedule. Transcript-bound HKDF expansions derive client and server handshake traffic secrets. Later stages derive application traffic secrets and other purpose-specific outputs. The combined hybrid secret occupies the key-establishment input defined by the protocol; it is not used directly as an AES key.

```text
ECDHE secret ─┐
              ├─ specified concatenation ─→ HKDF schedule
ML-KEM secret ┘                               ↑
                                 PSK/early-stage derivation
                                             ↓
                              transcript-bound traffic secrets
                                             ↓
                            Finished checks and application keys
```

The transcript binds negotiation and handshake messages to authentication. CertificateVerify proves possession of the server's signing key over the required context and transcript, while Finished authenticates the transcript under a derived handshake secret. They serve different purposes, and both need the surrounding certificate and identity checks to be meaningful.

The hybrid group protects key establishment. A server may still authenticate with a classical ECDSA certificate. That deployment can improve resistance to passive harvest-now-decrypt-later attacks without providing post-quantum signature authentication against a future active attacker. Report these properties separately rather than calling the entire connection “fully quantum safe.”

## Normal handshake and HelloRetryRequest

```text
Client                                           Server
ClientHello:
  supported_groups includes hybrid
  key_share contains hybrid share -------------->
                                      validate encapsulation key
                                      compute ECDHE + encapsulate
                         <-------------- ServerHello hybrid share
                         <-------------- encrypted authentication
validate certificate and hostname
compute ECDHE + decapsulate
verify transcript authentication
Finished -------------------------------------->
application data <-----------------------------> application data
```

A client can advertise support for a group without sending its share in the first ClientHello. Sending every possible share increases initial bytes and computation. If the server selects a supported group for which the client has not supplied a share, it can use HelloRetryRequest to ask for the needed group, within the protocol's constraints.

The retry adds another client flight and usually another round trip. That may be inexpensive on a local network and significant on a mobile or satellite path. The best initial-share strategy therefore depends on server selection behavior and client population. Measure retry frequency instead of assuming that advertising support eliminates handshake cost.

HelloRetryRequest is part of the authenticated transcript handling; it is not an unauthenticated instruction to disable security checks. Implementations must follow its state-machine and transcript rules. Applications should use a maintained TLS stack rather than interpreting retry messages themselves.

## Validation, implicit rejection, and downgrade policy

The server validates the ML-KEM encapsulation key as required by FIPS 203 and the TLS profile. Both sides validate the classical contribution, including X25519's all-zero-secret check where applicable. The client checks ML-KEM ciphertext length and handles decapsulation errors through the specified TLS behavior. Every component's checks remain necessary in a hybrid exchange.

ML-KEM implicit rejection still applies. A same-length corrupted ciphertext may yield fallback secret material, causing subsequent handshake authentication to fail. That differs from a malformed ciphertext length or an API failure. The TLS implementation must map errors correctly without exposing internal validity information through ad hoc diagnostics.

A supported-groups list is not necessarily a minimum-security policy. If a service permits classical fallback for compatibility, successful connections may still be classical. Conversely, requiring a hybrid group can reject clients that lack support. Define the intended behavior for each audience, measure it, and make fallback visible.

An attacker who tampers with a correctly authenticated handshake cannot simply edit the negotiated group without detection. However, application retry logic can create a separate downgrade path if a failed connection silently triggers a new attempt with weaker settings. The security review must include that outer retry policy, load balancers, proxies, and client wrappers.

## Larger handshakes and the transport path

Compared with a 32-byte X25519 share, the hybrid client's 1,216-byte share adds 1,184 bytes before framing. That is not the same as adding exactly one network packet. ClientHello already includes extensions, names, signature algorithms, and other data; TCP segmentation and path MTU determine packetization.

TLS records, TCP segments, IP fragmentation, and QUIC packets are different boundaries. A large TLS handshake message can span records and segments without requiring IP fragmentation. QUIC carries TLS handshake data in its own framing and has different amplification and retransmission considerations. Do not transfer a packet-count claim from one transport to another without measuring.

Middleboxes may mishandle unfamiliar groups, large ClientHello messages, or unusual segmentation despite valid protocol behavior. Test enterprise inspection paths, older proxies, VPNs, mobile networks, and origin connections where relevant. An edge endpoint's success does not establish that an internal service mesh or outbound SDK negotiates the same protection.

The observable outcome should include handshake success, selected group, retry rate, bytes, latency distribution, and failure classification. Segment results by client capability and network path. A small global failure percentage can hide a severe regression for one important device family.

## Executed local TLS lab

This script uses [OpenSSL s_server](https://docs.openssl.org/3.5/man1/openssl-s_server/) and [s_client](https://docs.openssl.org/3.5/man1/openssl-s_client/). It binds only to loopback, generates a disposable ECDSA certificate, explicitly trusts that certificate for this experiment, and verifies the localhost identity. It also checks that a classical-only client cannot negotiate with the hybrid-only server.

The port is selected from an available ephemeral port before server startup; another process could claim it in the small interval, in which case rerun the lab. The readiness probe is bounded and cleanup terminates only the server process started by this script. No system trust store is changed.

```bash
#!/usr/bin/env bash
set -euo pipefail
OPENSSL=${OPENSSL:-openssl}
LAB=$(mktemp -d)
SERVER_PID=''
cleanup() { if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; fi; rm -rf "$LAB"; }
trap cleanup EXIT
umask 077
cd "$LAB"
"$OPENSSL" version
PORT=$(python3 - <<'PY'
import socket
with socket.socket() as s:
 s.bind(('127.0.0.1',0)); print(s.getsockname()[1])
PY
)
"$OPENSSL" req -config /dev/null -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -noenc -keyout key.pem -out cert.pem -days 1 -subj /CN=localhost -addext subjectAltName=DNS:localhost > /dev/null 2>&1
"$OPENSSL" s_server -accept "127.0.0.1:$PORT" -cert cert.pem -key key.pem -tls1_3 -groups X25519MLKEM768 -www > server.log 2>&1 &
SERVER_PID=$!
python3 - "$PORT" <<'PY'
import socket,sys,time
for _ in range(50):
 try:
  with socket.create_connection(('127.0.0.1',int(sys.argv[1])),timeout=.2): break
 except OSError: time.sleep(.1)
else: raise SystemExit('server did not become ready')
PY
printf 'GET / HTTP/1.0\r\n\r\n' | "$OPENSSL" s_client -connect "127.0.0.1:$PORT" -servername localhost -verify_hostname localhost -verify_return_error -CAfile cert.pem -tls1_3 -groups X25519MLKEM768 > client.log 2>&1
python3 - <<'PY'
from pathlib import Path
s=Path('client.log').read_text()
assert 'X25519MLKEM768' in s
assert 'Verify return code: 0 (ok)' in s
for line in s.splitlines():
 if any(x in line for x in ('Negotiated TLS1.3 group','Server Temp Key','Verify return code','SSL handshake has read')): print(line)
PY
if printf '' | "$OPENSSL" s_client -connect "127.0.0.1:$PORT" -servername localhost -CAfile cert.pem -tls1_3 -groups X25519 > negative.log 2>&1; then
 echo 'Unexpected classical-only negotiation' >&2; exit 1
fi
printf '%s\n' 'PASS: authenticated local hybrid TLS and incompatible-group rejection'
```

On the tested macOS ARM64 host with OpenSSL 3.5.8, the output identified X25519MLKEM768 and certificate verification returned 0 (ok). The run reported 1,816 handshake bytes read and 1,491 written. These are that command's counters for this generated certificate and handshake, not universal TLS sizes or a packet capture. The incompatible-group negative test also passed.

The certificate is classical by design, so this lab demonstrates hybrid key establishment with classical authentication. Part 12 examines signature and certificate migration separately. Using a self-signed certificate here is acceptable because the client explicitly provisions that exact trust anchor for a local experiment and still checks the hostname.

## Extending the experiment responsibly

Repeat the exchange with the P-256 and P-384 hybrid groups if your exact binary supports them. Record the negotiated identifier and verification result rather than accepting process exit alone as proof. Then use a server configuration with multiple groups to observe the effect of client ordering and initial-share choices documented by that library version.

For packet analysis, capture only your own loopback lab traffic and identify the supported_groups and key_share extensions. Packet analyzers may need current dissectors to display new names; a numeric code point can still establish the group. A display filter that recognizes only an obsolete experimental identifier can produce a false “no PQC” conclusion.

Do not publish TLS key-log files or reuse lab keys in production. Key logs permit decryption of the captured session and belong only in controlled debugging workflows. Many useful measurements, including cleartext ClientHello/ServerHello share sizes, do not require collecting traffic secrets.

For service rollout, compare classical and hybrid handshakes under equal certificate chains, resumption settings, network conditions, and concurrency. Separate fresh handshakes from resumed sessions and 0-RTT behavior. A resumed connection does not necessarily perform the same fresh key exchange as the initial one, so counting all requests as new hybrid handshakes overstates coverage.

## A rollout metric that does not overstate coverage

Define hybrid coverage as the fraction of eligible fresh handshakes that actually negotiate an approved hybrid group. State the denominator: all connections, capable clients, or a selected canary population produce different percentages. Record failed attempts separately, since excluding them can make a problematic rollout look more successful.

Track edge and origin connections independently. A browser may use hybrid key establishment to a CDN while the CDN uses classical TLS to the origin. Both links may have valid encryption and authentication, but the harvest-now-decrypt-later exposure differs. A diagram of termination points makes the residual path visible.

A useful rollback threshold combines availability with security policy. For example, a canary may pause expansion when a particular client family experiences an unexplained increase in failures. The response should preserve logs of negotiated identifiers and public error categories, compare against the baseline, and identify whether the issue is capability, framing, or certificate processing. Silently removing the hybrid requirement everywhere loses that evidence and changes the protection level.

These metrics are operational design examples, not measured results from this local lab. Production thresholds should come from the service's actual reliability objectives and data-lifetime requirements.

## Knowledge checks

Why does the cipher-suite name fail to identify the KEM? Why is ML-KEM first in the X25519 hybrid encoding but second in the P-256 encoding? What does HelloRetryRequest add to the critical path? Which property does a classical server certificate leave dependent on classical public-key security?

A useful completion artifact is a table containing configured groups, advertised groups, negotiated group, certificate signature type, verification result, and measured handshake counters for each test. That table turns “PQC enabled” into a set of testable claims and prepares the ground for a separate PKI migration plan.

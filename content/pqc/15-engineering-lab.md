---
title: "Hands-On PQC Lab for Engineers"
description: "Reproduce the course's native OpenSSL experiments with a checksum-pinned build, disposable keys, automated negative tests, local TLS, a container recipe, and CI."
slug: pqc-15-engineering-lab
series: Post-Quantum Cryptography
part: 15
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, lab, security]
difficulty: intermediate
---
# Hands-On PQC Lab for Engineers

> A useful laboratory leaves evidence: the exact executable, commands, successful checks, expected failures, and limits of the experiment. A screenshot of an algorithm name is only the beginning.

## What this lab establishes

This lab combines the executed experiments from Parts 2–12 into one repeatable suite. It uses native OpenSSL for ML-KEM, ML-DSA, SLH-DSA, certificates, and standardized hybrid TLS. Toy Python exercises are clearly separated from real cryptographic operations. All generated keys are disposable, and the TLS server binds to loopback.

The checkpoint is September 11, 2026. [OpenSSL's release page](https://openssl-library.org/source/) lists 3.5.8 in the supported 3.5 LTS branch, alongside newer release branches. We pin 3.5.8 for reproducibility, not because it is the numerically newest release. Revisit the pin and security advisories before using a later copy of this lab.

Successful completion establishes functional behavior for the tested binary and environment. It does not establish FIPS module validation, physical side-channel resistance, public browser compatibility, or production capacity. The earlier articles explain those separate evidence requirements. Here the emphasis is on producing a clean, inspectable experiment that can be repeated after an upgrade.

## Repository layout and prerequisites

The runnable files are in the [course laboratory directory](https://github.com/shivam2003-dev/cvum-sight/tree/main/labs/pqc). Clone the repository and record the commit before running it. The native path needs Bash, Python 3, a C compiler, make, Perl, curl, and suitable build tools. The container path needs a working Docker engine.

```text
labs/pqc/
  build-openssl.sh       checksum-pinned isolated source build
  run-all.sh             complete functional suite
  02-foundations.sh      classical signature baseline
  03-quantum-toys.py     educational arithmetic only
  04-mathematics.py      educational arithmetic only
  06-ntt.py              educational transform only
  07-ml-kem.sh           agreement and rejection behavior
  08-ml-dsa.sh           signature and context tests
  09-slh-dsa.sh          small/fast signature checks
  11-hybrid-tls.sh       authenticated loopback TLS
  12-pki.sh              local ML-DSA certificate chain
  Dockerfile            isolated Linux runner
  results/              retained exploratory benchmark output
```

The Python toys are not substitutes for production algorithms. Their small moduli and deterministic values intentionally expose mathematical relationships. The shell experiments call maintained library interfaces and never implement a KEM, signature scheme, or TLS combiner themselves.

Use a dedicated working directory. Do not point the lab at production keys, copy secrets into its source tree, or add generated private files to Git. The scripts use temporary directories and cleanup traps. Ordinary deletion is housekeeping rather than a promise of secure erasure on every storage medium.

## Build the pinned executable without replacing system OpenSSL

The build script downloads the official 3.5.8 release archive, checks a fixed SHA-256 digest, and installs under an explicit prefix. The digest was checked against the release's official checksum for this course. A mismatch stops the build. The script does not replace the operating system's libraries or alter a global command symlink.

```bash
bash labs/pqc/build-openssl.sh "$PWD/.pqc-runtime"
export OPENSSL="$PWD/.pqc-runtime/bin/openssl"
"$OPENSSL" version -a
```

The installation path must be absolute. The build uses a temporary source directory and a configurable BUILD_JOBS value, defaulting to two concurrent compilation jobs. Increasing it can shorten the build on a suitable machine, but does not change the algorithmic test. Keep the resulting binary version and compiler details with your report.

```bash
#!/usr/bin/env bash
set -euo pipefail
PREFIX=${1:?Usage: build-openssl.sh ABSOLUTE_INSTALL_PREFIX}
case "$PREFIX" in /*) ;; *) echo 'Use an absolute prefix' >&2; exit 1;; esac
VERSION=3.5.8
SHA256=a8f84a39918ec6415ce765d9b429d313ba97b8143169c172e734b9514464f5b2
BUILD=$(mktemp -d)
trap 'rm -rf "$BUILD"' EXIT
cd "$BUILD"
curl --fail --location --retry 3 "https://github.com/openssl/openssl/releases/download/openssl-$VERSION/openssl-$VERSION.tar.gz" -o openssl.tar.gz
python3 - "$SHA256" <<'PY'
import hashlib,sys
assert hashlib.sha256(open('openssl.tar.gz','rb').read()).hexdigest() == sys.argv[1], 'checksum mismatch'
PY
tar -xzf openssl.tar.gz
cd "openssl-$VERSION"
./Configure --prefix="$PREFIX" no-shared
make -j "${BUILD_JOBS:-2}"
make install_sw
"$PREFIX/bin/openssl" version
```

A checksum pin makes the selected source artifact repeatable; it does not independently solve every supply-chain trust question. The compiler, base environment, and initial source-authenticity decision remain dependencies. For stronger provenance, verify the upstream release signature through a trusted key and record a reproducible toolchain or image digest.

## Inspect capabilities before running operations

Use the [OpenSSL list command](https://docs.openssl.org/3.5/man1/openssl-list/) to inspect the actual providers and algorithms. A library installation can differ from the command found first on PATH. An application can also load a different provider configuration from the interactive shell.

```bash
"$OPENSSL" version -a
"$OPENSSL" list -providers
"$OPENSSL" list -kem-algorithms
"$OPENSSL" list -signature-algorithms
```

Look for ML-KEM-512/768/1024, ML-DSA-44/65/87, and the SLH-DSA families. Record the provider associated with the implementation. Listing an algorithm establishes availability, while successful generation and verification establish additional behavior. Neither output is a cryptographic module validation certificate.

If an operation is unavailable, first inspect the exact executable, version, provider loading, and property query. Do not respond by installing an experimental provider into a production environment or renaming a prestandard algorithm. The native supported path is the baseline for this lab.

## Run the complete suite

```bash
OPENSSL="$PWD/.pqc-runtime/bin/openssl" \
  bash labs/pqc/run-all.sh > pqc-functional.log 2>&1
```

The runner stops when a required check fails. It executes the arithmetic toys, then classical and PQ signature tests, KEM tests, TLS negotiation, certificate validation, and a one-iteration OpenSSL speed smoke test. The final PASS line is emitted only after all preceding commands succeed.

| Exercise | Positive evidence | Negative evidence |
|---|---|---|
| ML-KEM-768 | Matching 32-byte secrets; 1,088-byte ciphertext | Corrupted same-length ciphertext yields a different secret; truncation errors |
| ML-DSA-65 | Valid 3,309-byte signature; deterministic repetition | Modified message and wrong context reject |
| SLH-DSA SHA2 128s/128f | Valid 7,856/17,088-byte signatures | Modified messages reject |
| Hybrid TLS | X25519MLKEM768 negotiated; certificate and hostname verify | Classical-only group cannot connect to hybrid-only server |
| ML-DSA PKI | Local issuer/leaf path verifies | Wrong hostname rejects |

The native suite was executed on macOS ARM64 with OpenSSL 3.5.8. It passed these checks. The signature and KEM scripts print sizes and outcomes, not shared secrets or private key material. The TLS script prints the negotiated group and verification result so that configuration is not mistaken for negotiation evidence.

## KEM exercise: distinguish agreement from API completion

Part 7's script creates an ML-KEM-768 key pair and exports the public key through OpenSSL's supported format. Encapsulation writes a ciphertext and sender secret. Decapsulation writes a recipient secret. The comparison verifies that the original exchange agreed, and byte-count checks confirm the selected parameter set's expected outputs.

The same-length corruption case demonstrates implicit rejection. A successful decapsulation command can return alternate secret material, so its exit code alone does not establish a valid peer exchange. The separate truncation case exercises a public input-length error. Keep both tests because they address different parts of the interface.

Extend the experiment to wrong-key decapsulation and repeated independent exchanges. Assert the protocol-relevant outcomes without exposing internal validity flags. If you add a KDF and authenticated encryption exercise, follow an established protocol construction; do not turn the lab into an improvised production envelope format.

## Signature exercise: exact bytes and context

Part 8 signs a small release-like message using an application context. It verifies the signature, changes the message, changes the context, and checks deterministic repetition under the documented option. The verifier must use the same byte sequence and context as the signer. A visually equivalent text file with a different newline can be a different signed message.

Part 9 repeats sign/verify with two SLH-DSA variants and checks their exact signature lengths. It is useful to inspect the difference between those raw signatures and PEM key-file lengths. The latter include container encoding and should not be used to infer the standardized private-key size directly.

Add a wrong-public-key and corrupted-signature test if you extend the suite. Keep functional checks separate from timing measurements. A deliberate invalid signature is a useful regression input; repeatedly measuring it under controlled classes is a different experiment with a different interpretation.

## Certificate exercise: local trust is explicit

Part 12 creates an ML-DSA-65 root and an ML-DSA-44 leaf. This deliberately separates issuer-signature and subject-key algorithms. The verifier receives the root through CAfile and checks localhost as the intended identity. The root is not imported into the system trust store.

The observed leaf DER size was 4,912 bytes for this exact template. That result includes names, extensions, identifiers, and framing in addition to the public key and signature. It is an example object size, not a universal ML-DSA certificate size.

Extend the hierarchy with an intermediate and test path-length constraints, expiry, and key usage. Use disposable keys throughout. A complete CA requires a serial database, issuance policy, revocation infrastructure, audit controls, and key custody; the small lab certificate command is not a production CA implementation.

## TLS exercise: measure what was negotiated

Part 11 starts a loopback-only server using X25519MLKEM768, connects with an explicitly trusted local certificate, and verifies the hostname. The expected evidence is the negotiated group and a successful verification result. The incompatible classical-only client must fail because the server is configured to require the hybrid group.

The generated server certificate uses ECDSA, so the exercise demonstrates hybrid key establishment with classical authentication. That is intentional: the standardized hybrid group and PQ certificate-signature migration are separate subjects. A green handshake result should be labelled with both properties.

To compare classical and hybrid handshake counters, run the same server/client template with X25519 in both places, preserving the certificate, extensions, TLS version, and other settings. Record the generated certificate and command boundaries. For a rigorous comparison, avoid regenerating different certificates between trials and repeat under controlled conditions.

## Optional packet capture and interpretation

A packet capture can show the supported_groups and key_share extensions on your own test connection. Choose the actual loopback interface for your platform, capture only the selected local port, and use a current Wireshark dissector. An older dissector may display a numeric group rather than the standardized name.

Do not assume a TLS handshake message equals one TCP packet. Inspect reassembly, record boundaries, retransmissions, and whether HelloRetryRequest occurred. These observations explain transport behavior that the primitive benchmark cannot show. No packet-capture result is claimed for the automated suite here; this is an optional extension.

Traffic-secret logs allow deeper decryption but are sensitive. They are unnecessary for identifying the cleartext client and server key shares in this exercise. If you collect them for controlled debugging, keep them out of shared artifacts and delete them according to your test-data policy after analysis.

## Benchmark operations without confusing the smoke test

The runner uses speed -testmode to exercise one iteration of selected operations and fail if an operation fails. It is not a benchmark. Part 14's speed -elapsed -seconds 1 experiment collected three exploratory runs and retained the raw outputs with the host description.

For a longer benchmark, isolate key generation, encapsulation, decapsulation, signing, and verification through the documented speed interface. State the implementation, operation boundary, repetitions, and environment. Record peak memory separately if it matters; operations per second do not reveal stack feasibility on a small device.

Use controlled comparisons before making capacity claims. A workstation running a browser and background tools is suitable for a functional laboratory and preliminary observations, but not for declaring stable performance regressions of a few percent. The report should say which conditions were controlled and which were not.

## Containerized reproduction

The [Dockerfile](https://github.com/shivam2003-dev/cvum-sight/blob/main/labs/pqc/Dockerfile) builds the checksum-pinned OpenSSL source in one stage and copies the installed executable and scripts into a smaller runtime stage. It runs as an unprivileged numeric user. The Ubuntu release tag is fixed, while distribution package revisions can change; this is source-level reproducibility, not a claim of bit-for-bit identical images.

```bash
docker build -f labs/pqc/Dockerfile -t pqc-course-lab .
docker run --rm --network none --read-only \
  --tmpfs /tmp:rw,nosuid,nodev,size=128m pqc-course-lab
```

The build needs network access to fetch packages and the release archive. The test container runs without external networking; its loopback interface still supports the local TLS exercise. The read-only root filesystem and temporary writable directory make generated keys ephemeral and keep the source tree untouched.

If Docker cannot connect to its daemon, that is an environment failure before the cryptographic suite runs. Either start the intended local engine or use the native path. Do not report a container test as passed merely because the Dockerfile was written. The repository's CI separately builds and executes this container recipe.

## CI and failure triage

The [PQC course workflow](https://github.com/shivam2003-dev/cvum-sight/blob/main/.github/workflows/pqc-lab.yml) runs on changes to the laboratory and supports manual dispatch. It has read-only repository permissions, builds the image, and executes the isolated suite. It does not upload generated keys or treat timing results from shared runners as performance gates.

Triage failures by layer. A download or checksum failure concerns artifact retrieval. A compilation failure concerns the toolchain or source. An unsupported-algorithm error concerns capabilities or provider selection. A failed expected-rejection check concerns behavior and needs investigation before accepting the build. Preserve that distinction in the run report.

For dependency upgrades, change the version and verified checksum together, rebuild, and run all functional and negative tests. Then inspect relevant standard or API changes and repeat affected interoperability tests. A successful upgrade should produce a new evidence record rather than overwriting the meaning of the old one.

## Keep a compact lab report

For each run, record the date, repository commit, host architecture, OpenSSL version, provider list, and the final suite outcome. Keep expected failures visible in the test description even when their noisy command output is suppressed. A report that says only “all commands exited zero” can accidentally count a missing negative test as success.

Separate optional activities from executed ones. The native primitive and loopback tests, container execution, packet capture, and sustained benchmarking are different milestones. Mark an unexecuted capture as unexecuted rather than copying an expected packet diagram into the results section. This makes the report useful to another engineer who needs to reproduce a specific observation.

Retain public fixtures and scripts, but avoid saving temporary private keys or session secrets. When a failure requires preserving an artifact, determine whether it contains sensitive material before attaching it to an issue. Most functional failures can be described using versions, public input lengths, error categories, and a minimal disposable reproducer.

A second engineer should be able to follow the report and distinguish a build problem from a cryptographic behavior change without access to your shell history. That is the practical test of reproducibility.

## When experimental tooling is useful

[Open Quantum Safe liboqs](https://openquantumsafe.org/liboqs/) supports research and prototyping across many algorithms. It is useful for exploring candidates and comparing implementations, but it should not replace current native standardized support merely because an old tutorial used it. Label prototype configurations and their exact algorithm versions.

For implementation study, inspect maintained [PQ Code Package projects](https://github.com/pq-code-package), including their proof scope, tests, and architecture backends. Building a research implementation is a learning exercise; integrating it into a production protocol requires a separate review of security, maintenance, and interoperability.

Your completion artifact should contain the repository commit, executable version, platform, commands, pass/fail log, and any unexecuted optional exercises. The next part uses those concrete capabilities to plan an organizational migration rather than treating the laboratory as the end of the transition.

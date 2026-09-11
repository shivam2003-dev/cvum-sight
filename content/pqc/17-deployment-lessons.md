---
title: "Real-World PQC Deployments and Engineering Lessons"
description: "Read Chrome, Cloudflare, AWS, Signal, Apple, and OpenSSH deployment accounts critically: exact mechanisms, rollout boundaries, compatibility, ratcheting, and evidence."
slug: pqc-17-deployment-lessons
series: Post-Quantum Cryptography
part: 17
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, deployment, security]
difficulty: intermediate
---
# Real-World PQC Deployments and Engineering Lessons

> Public deployment accounts are most useful when they identify a mechanism, a population, and a measured outcome. Read them as engineering evidence with a date and scope, then test whether the same assumptions hold in your environment.

## How to read these case studies

This article uses original engineering and security publications, checked on September 11, 2026. It distinguishes a historical rollout announcement, an implementation specification, a current capability statement, and a future roadmap. None is treated as live verification of every user, endpoint, or product operated by the named organization.

The common questions are concrete: what security property changed, which mechanism was deployed, what had to remain compatible, and what evidence supports the claim? The lessons following each account are engineering interpretations for this course, not claims that the organization implemented every suggested control.

Earlier parts explained the primitives and TLS/PKI boundaries. Here those distinctions prevent misleading conclusions: a hybrid TLS group does not imply post-quantum certificate authentication, a messaging handshake does not automatically provide continuous post-compromise recovery, and an announced target year is not a completed migration.

## Chrome: retire the experiment when the standard arrives

Google's September 2024 [Chrome engineering announcement](https://security.googleblog.com/2024/09/a-new-path-for-kyber-on-web.html) described moving from experimental Kyber-based hybrid exchange to ML-KEM in Chrome 131. It identified the change from code point 0x6399 to 0x11EC and explained that the final algorithm was incompatible with the earlier deployment. The client would not offer both large PQ shares simultaneously; servers could temporarily support both during the transition.

The important lesson is that an experiment needs an exit plan. Retaining a successful draft indefinitely can create dependence on an obsolete encoding. Removing it abruptly without coordination can reduce protection for clients or servers that update at different rates. The transition needs a defined overlap and a final retirement point.

For your own protocol deployment, record experimental identifiers separately from standardized ones, communicate the compatibility window, and test both upgrade directions. A server-first rollout may provide overlap while clients switch their initial share. Once the window closes, telemetry should confirm that the old identifier is no longer accepted or used.

The ClientHello size constraint is also instructive. Supporting more algorithms is not free when each initial share is large. Capability advertisement, initial-share prediction, and server selection interact with latency and bandwidth. A migration plan should include those transport consequences instead of assuming that adding another name to a list has negligible cost.

## Cloudflare: encryption progress and authentication debt

Cloudflare's April 2026 [post-quantum roadmap](https://blog.cloudflare.com/post-quantum-roadmap/) targets full post-quantum security, including authentication, by 2029. It distinguishes existing key-establishment deployment from remaining authentication work and identifies separate connection directions and product milestones. These are the provider's reported progress and plans; the target is not presented here as achieved.

The engineering lesson is to split the program by security property and trust boundary. Browser-to-edge, edge-to-origin, administrative access, and device enrollment can depend on different protocols and client populations. A successful edge rollout is meaningful without proving the other paths complete.

For an organization using a CDN, inspect its own origin connection and certificate policy. Determine which endpoint terminates each TLS session and which party controls the client software on the next hop. The provider can enable support on its side, but the other endpoint must negotiate and verify the intended mechanism.

Roadmaps also need change management. A milestone may move because a protocol profile, browser capability, or hardware interface is not ready. Preserve the stated date and status in reports, and require fresh evidence before changing a planned item to deployed. This keeps an executive timeline connected to technical reality.

## AWS: endpoint capability and client responsibility

AWS's April 2025 [ML-KEM TLS announcement](https://aws.amazon.com/blogs/security/ml-kem-post-quantum-tls-now-supported-in-aws-kms-acm-and-secrets-manager/) reported support at KMS, ACM, and Secrets Manager non-FIPS endpoints in the aws partition, with client updates needed to offer ML-KEM. It also presented a specific Java SDK/KMS workload comparing connection reuse enabled and disabled. The measurements were tied to a named instance, region, and test setup, not a universal overhead claim.

This case highlights a two-sided migration boundary. A cloud service accepting a hybrid group does not mean an old SDK requests it. Inventory the TLS stack actually used by the application: language runtime, HTTP transport, native library, proxy, and configuration can all differ from the command-line OpenSSL installation.

Connection reuse changes how handshake cost is amortized. A workload opening a new connection for every request pays the setup cost repeatedly; a pooled connection spreads it across many requests. This is a system-level performance issue that cannot be inferred from encapsulations per second alone.

When reproducing such a study, keep the API operation, region, network path, concurrency, retry policy, and connection behavior fixed. Record the negotiated group and certificate verification, then compare request latency and throughput. Do not use a provider's percentage from one setup as a capacity estimate for another application.

The announcement's endpoint scope matters too. A historical statement about selected services and a partition should not be expanded into “all AWS traffic is post-quantum.” Use current product documentation and your actual connection evidence for a deployment decision. Service support, customer configuration, and observed use remain separate claims.

## Signal: initial agreement is not continuous recovery

Signal's October 2025 [SPQR account](https://signal.org/blog/spqr/) explains adding post-quantum ratcheting to the Signal Protocol and combining it with the existing ratchet structure. Its [ML-KEM Braid specification](https://signal.org/docs/specifications/mlkembraid/) gives the detailed state machine. A central engineering problem is carrying larger KEM material across asynchronous messages, including loss and out-of-order delivery, without attaching a full exchange to every message.

The conceptual distinction is between protecting the initial session establishment and introducing fresh secret material later. If an attacker obtains current session state, recovery requires new secret contributions that the attacker does not learn, together with the protocol's assumptions about subsequent compromise and communication. A symmetric hash update alone cannot erase the attacker's knowledge of a copied state.

```text
initial authenticated establishment
                 ↓
       ongoing message-key evolution
                 ↓
 fresh independent key-establishment contributions
                 ↓
       new ratchet epoch and recovery properties
```

This diagram is conceptual, not Signal's complete protocol. The actual construction specifies when contributions are generated, acknowledged, combined, and used. Those details determine which messages receive which protection and under what compromise model. “Uses ML-KEM” does not describe the whole security claim.

For engineers, the transferable lesson is to model bandwidth and state transitions together. Chunking a large cryptographic message creates questions about loss, replay, reordering, partial state, and completion. A generic reliable-transfer assumption may not hold in an asynchronous messenger, so the cryptographic protocol and transport behavior need joint analysis.

Do not implement a new ratchet by adding periodic KEM outputs to an existing application key. Use a reviewed protocol and its formal analysis. The exercise for this course is to trace the published state machine and identify the assumptions, not to produce an unofficial replacement secure messenger.

## Apple PQ3: rekeying across a device ecosystem

Apple's February 2024 [PQ3 security publication](https://security.apple.com/blog/imessage-pq3/) describes hybrid initial establishment and periodic post-quantum rekeying for iMessage, with message-size amortization and formal analysis. The article uses Kyber terminology from that deployment period and describes rollout to supported conversations. Its own security-level terminology is not NIST's algorithm security-category system.

Preserve historical names when explaining the design. Rewriting every occurrence of Kyber as final ML-KEM can imply interoperability and implementation details that the original account did not establish. A current evaluation should inspect the latest implementation documentation separately from the historical architectural explanation.

The ecosystem lesson is that device compatibility and update distribution are part of cryptographic deployment. A conversation can involve multiple devices with different software versions and availability. Key registration, offline delivery, rekeying, and verifier support must work across that population. A primitive benchmark does not exercise those conditions.

Formal analysis contributes evidence about the modeled protocol, while implementation and rollout testing address different questions. The existence of a proof should prompt a reader to inspect its assumptions and boundaries, not stop the review. Device compromise, identity verification, key storage, and update trust remain relevant to the complete system.

For a product team, a useful design review separates the initial-contact path, ongoing-session recovery, new-device enrollment, and account recovery. Each may have different secrets and trust anchors. An improvement in one path should be reported accurately without claiming that it resolves every account-security problem.

## OpenSSH: key exchange and host identity remain distinct

The [OpenSSH PQC page](https://www.openssh.com/pq.html) documents its post-quantum key-exchange work and the distinction from signature authentication. Its deployed hybrid mechanisms demonstrate that PQ migration is not confined to browser TLS. Inspect your installed version and negotiated SSH algorithm rather than assuming that a modern operating system implies the desired exchange.

The operational lesson mirrors TLS: a hybrid key exchange does not automatically replace host-key or user-authentication signatures. An administrative connection has confidentiality, server identity, and user authorization requirements. These are separate inventory entries with separate upgrade dependencies.

For a controlled test, use verbose client output against an authorized test server and record the negotiated key exchange and host-key algorithm. Preserve known-host verification. Disabling host-key checking to make a cryptographic experiment connect would remove the identity property the real system needs.

Older automation, embedded SSH servers, and bastion chains can create compatibility constraints. Test the complete administrative path, including jump hosts and file-transfer clients. A successful connection to one current server does not establish coverage for an entire operational estate.

## Compare the cases by property, not brand

| Case | Main property discussed | Deployment constraint | Evidence boundary |
|---|---|---|---|
| Chrome | Hybrid session key establishment | Draft-to-standard transition and initial-share size | Historical engineering announcement |
| Cloudflare | Key establishment plus authentication roadmap | Multiple product and connection boundaries | Reported progress and future targets |
| AWS | Hybrid TLS to service endpoints | Client/SDK capability and connection reuse | Scoped endpoint report and workload study |
| Signal | Ongoing post-quantum ratcheting | Asynchronous delivery and large KEM material | Protocol account and detailed specification |
| Apple PQ3 | Hybrid establishment and periodic rekeying | Device ecosystem and message overhead | Historical design and rollout account |
| OpenSSH | Hybrid administrative key exchange | Version and endpoint compatibility | Project capability documentation |

The comparison does not rank the products. Their threat models, protocols, identities, and deployment populations differ. A messaging ratchet and a TLS handshake solve related but different problems; copying one product's headline into another architecture can obscure the missing properties.

## Repeated lesson: compatibility must have an end state

Compatibility allows a rollout to reach an installed population, but indefinite fallback can preserve the original vulnerability. Define which clients may use a temporary classical path, how that use is measured, and when the exception ends. An unsupported legacy device should become a tracked dependency, not an invisible denominator exclusion.

The same principle applies to experimental identifiers. An early deployment can teach valuable lessons while creating a retirement obligation. Keep versioned telemetry and test old/new combinations before removing support. Once retired, verify rejection so a later configuration change does not restore the obsolete path.

For signatures, compatibility often requires distributing verification capability before issuing new-format artifacts. That ordering can be slower than changing a server-side KEM preference. Separate those workstreams and retain enough overlap to avoid stranding devices, while preventing the overlap from becoming permanent dual trust without policy.

## Repeated lesson: measure the actual population

A provider's adoption percentage describes a particular denominator and date. It may count capable browsers, human traffic, fresh handshakes, or selected endpoints. It does not automatically describe your application, internal network, or device fleet. Ask what was counted before comparing percentages.

Your own telemetry should include failed attempts and important subpopulations. A rollout can look healthy in aggregate while breaking a small but critical industrial client. Segment by software family, network path, region, and trust configuration as appropriate, while respecting privacy and avoiding collection of secret material.

Observe both configuration and outcome. A deployment record says what should happen; a negotiated-group sample says what did happen for that connection. A robust program reconciles the two and investigates unexpected fallback, rather than treating either view alone as complete evidence.

## Repeated lesson: performance is often protocol behavior

The cases show why bandwidth, connection reuse, asynchronous delivery, and retry policy can dominate the integration story. A faster primitive may not improve user experience if it increases round trips or fails on an important middlebox. A larger signature can be acceptable for an infrequent firmware update and costly for a high-frequency message stream.

Build a workload model before optimizing. Identify operation frequency, payload size, connection lifetime, device memory, and recovery behavior. Then choose measurements that test the model. The local course benchmarks are useful for learning the interfaces, while production decisions need representative systems and distributions.

Keep performance changes subordinate to the security contract. Do not disable key validation, identity checks, or constant-time behavior to match a favorable benchmark. If an optimization requires a different protocol assumption, document and review that assumption explicitly.

## A case-study review exercise

Choose one primary account and write four short statements: the exact mechanism, the population and date, the measured or reported result, and what the source does not establish. Then map its constraints to one system you operate. This prevents a useful public example from becoming an unsupported assurance claim.

For a TLS service, reproduce a hybrid handshake in a controlled environment and record the certificate algorithm separately. For a messaging study, trace one key-establishment epoch through the official specification, including delayed messages and compromise assumptions. For an SSH environment, inventory both key exchange and host identity across the bastion path.

Finally identify one change you can make now and one dependency that requires coordination. The current standard landscape supports concrete progress, while not every identity, device, and archival workflow is equally ready. A good deployment plan preserves that nuance and still produces owned, testable work.

## Turn a public case into an internal acceptance record

Before proposing a rollout, create a one-page record with a named service owner and a specific connection or artifact boundary. State which confidentiality or authenticity property changes, which users and devices are eligible, and how the outcome will be observed. Attach the exact provider announcement or protocol version that informed the proposal. Record the review date so a later reader can distinguish a historical design decision from a current compatibility claim.

Define success and failure together. Success might require a validated identity, the intended negotiated group, acceptable connection latency, and coverage of a named client population. Failure criteria should include unexpected classical fallback, lost certificate validation, critical client incompatibility, and an increase in retries. Set thresholds from the service's existing objectives and representative measurements; copying another organization's threshold supplies no evidence about your workload.

Finally rehearse the operational response. Identify who can pause the rollout, what configuration is restored, which security exposure that restoration creates, and when the exception expires. Preserve a sanitized sample of successful and rejected connections. A small, reproducible acceptance record is more useful to an on-call engineer than a broad assertion that the organization has adopted post-quantum cryptography.

## From examples to a sustained learning path

The final article turns the course into a continuing roadmap with seven stages, primary standards, books, lectures, papers, tools, communities, and practical projects. Use it to deepen the area most relevant to your role while maintaining the habit established here: distinguish a claim's source, scope, status, and evidence before acting on it.

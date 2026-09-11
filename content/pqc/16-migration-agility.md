---
title: "Migration Engineering and Cryptographic Agility"
description: "Turn PQC migration into an owned program: inventory, data-lifetime risk, dependencies, protocol profiles, canaries, rollback, evidence, and a practical maturity model."
slug: pqc-16-migration-agility
series: Post-Quantum Cryptography
part: 16
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, migration, security]
difficulty: intermediate
---
# Migration Engineering and Cryptographic Agility

> Migration succeeds when a service can change its cryptography while preserving its security contract and operational behavior. An algorithm inventory is a starting artifact; ownership, dependencies, testing, and retirement determine whether the change can actually happen.

## From a working lab to a migration program

Part 15 established a reproducible laboratory. This part asks how an organization applies those capabilities across applications, infrastructure, certificates, devices, suppliers, and archived data. You will build a risk-oriented inventory, identify dependencies, define rollout evidence, and use a maturity model that measures capability rather than counting installed algorithms.

The guidance checkpoint is September 11, 2026. [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/ipd) remains an initial public draft in the source checked here. It describes an expected transition approach and proposed timelines; it should not be relabelled as a final universal mandate. [NIST CSWP 39upd1](https://csrc.nist.gov/pubs/cswp/39/upd1/considerations-for-achieving-crypto-agility/final), updated June 29, 2026, is final guidance on achieving cryptographic agility.

These documents serve different roles. The transition report identifies movement away from quantum-vulnerable mechanisms. The agility paper examines the capability to replace and adapt cryptography while preserving security and operations. A migration plan needs both a destination and a reliable way to reach it.

## Why this is an architecture problem

Cryptography appears in TLS termination, service meshes, SSH, VPNs, database connections, key wrapping, certificates, code signing, firmware boot chains, package metadata, and document archives. Different teams own these layers, and different libraries implement them. A change to one public endpoint leaves many other paths untouched.

Consider a customer request passing through a browser, CDN, load balancer, service mesh, application, and database. Each encrypted link has its own endpoints and negotiation. An edge deployment can be hybrid while the origin and internal links remain classical. The inventory must identify termination boundaries and data exposure, not only the first certificate visible from the Internet.

```text
business data and retention requirements
                  ↓
       services and trust boundaries
                  ↓
 protocols → libraries → providers → devices / key services
                  ↓
     owners, suppliers, update channels
                  ↓
        testable migration work packages
```

The same dependency logic applies to signatures. Updating a release signer is ineffective if installed devices cannot verify the new format. Updating devices may itself require an old signing key. These dependencies create ordering constraints that cannot be solved by selecting a stronger parameter set.

## Build an inventory that supports decisions

A cryptographic inventory should identify the asset, purpose, algorithm and parameters, implementation version, protocol or file format, key owner, data lifetime, and evidence source. It should distinguish configured capability from observed use. Record uncertainty explicitly when discovery cannot see a path.

| Field | Example value | Why it matters |
|---|---|---|
| Asset and owner | Billing API / platform team | Assigns migration responsibility |
| Security purpose | Transit confidentiality and server authentication | Separates KEM and signature work |
| Observed mechanism | X25519, ECDSA chain | Establishes current use rather than installed capability |
| Implementation | Runtime, TLS library, provider versions | Identifies upgrade dependencies |
| Data lifetime | Business-defined confidentiality period | Supports harvest-now-decrypt-later priority |
| Trust and key lifecycle | CA, rotation, backup retention | Exposes long-lived dependencies |
| Evidence and date | Handshake sample plus configuration review | Makes drift and blind spots visible |
| Target and blocker | Standardized hybrid profile / old client | Converts inventory into work |

Do not store private keys or shared secrets in the inventory. Public-key identifiers, certificate fingerprints, ownership, and metadata are usually sufficient. Access controls may still be necessary because the inventory exposes sensitive architecture and security dependencies even without secret material.

## Discovery requires several views

Static analysis can find cryptographic API calls and dependencies but may miss dynamically loaded providers, generated code, or runtime negotiation. Network observations can identify active protocol choices but miss dormant services, offline signing, and encrypted inner tunnels. Configuration review reveals intent but can differ from deployed behavior.

Combine these views with package inventories, certificate stores, HSM inventories, infrastructure definitions, and interviews with service owners. Include disaster-recovery systems and maintenance interfaces. A rarely used recovery tunnel can remain a high-impact classical dependency even when daily traffic looks modern.

A [Cryptography Bill of Materials in CycloneDX](https://cyclonedx.org/capabilities/cbom/) can represent cryptographic assets and their relationships to software components. It is a useful interchange model, not a guarantee that discovery found everything. Preserve the tool version, scope, confidence, and timestamps alongside the generated document.

Normalize names carefully. Prestandard Kyber and final ML-KEM, a cipher suite and a key-exchange group, or a certificate's subject key and issuer signature are different inventory entities. Overaggressive normalization can erase the exact distinction needed to decide whether a system has migrated.

## Prioritize by exposure and time to change

Harvest-now-decrypt-later risk depends on information collected today remaining valuable when an attacker can later break the vulnerable key establishment. Let X be the required confidentiality lifetime, Y the time needed to migrate, and Z a scenario for arrival of a cryptographically relevant quantum capability. The relationship X + Y > Z is a planning warning, not a prediction of a machine's arrival date.

For a hypothetical service with ten-year confidential records and a three-year migration dependency, even a relatively distant threat scenario can motivate early action. A public static page with no sensitive exchanged data may have different confidentiality urgency, while its software-signing and identity dependencies still need analysis. Avoid assigning priority solely from the word “encrypted.”

For signatures, consider how long verification must remain meaningful, how widely trust anchors are distributed, and whether old artifacts can be renewed while their authenticity is still established. Firmware and archival signatures may require early planning because verifier replacement takes years.

Prioritization should combine impact, exposure, lifetime, migration lead time, and readiness of an approved replacement. Document the assumptions and revisit them as standards, vendors, and the estate change. A numerical score can help sorting, but should not hide a critical blocker behind an apparently precise total.

## Dependency mapping and supplier questions

For every target service, identify the runtime, library, provider, protocol profile, key-management system, certificate authority, client population, and update mechanism. A server library upgrade may be easy while a vendor appliance or embedded verifier sets the actual schedule. Record that dependency explicitly with an owner and evidence.

Ask suppliers for exact supported algorithms and profiles, release versions, interoperability tests, key-management capabilities, validation scope where needed, and end-of-support dates. A statement that a product is “PQC ready” is too broad to determine whether it can negotiate a specific standardized group or verify a specific certificate chain.

Procurement requirements should include upgradeability and evidence, not just an algorithm checklist. Can configuration disable obsolete experiments? Can telemetry report actual negotiation? Can keys be rotated and retired? Can a deployed device receive new verification code without replacing hardware? These capabilities affect future agility as much as the first migration.

Retain an exit strategy for unsupported components. Options may include upgrading, replacing, isolating, changing the protocol boundary, or retiring a service. A gateway can sometimes protect one exposed link, but it does not automatically remove end-to-end signature or internal confidentiality dependencies.

## Abstraction without erasing security semantics

A crypto abstraction can centralize provider selection, key access, error handling, and policy. However, a single generic encrypt function is not a sufficient model for KEMs, AEAD, signatures, and KDFs. They accept different inputs and establish different properties. Preserve those distinctions in the API.

Prefer interfaces that express the operation and context: establish key material through a named protocol, verify a signature under a specified scheme and purpose, or encrypt with an AEAD and explicit nonce rules. Algorithm identifiers and versioned formats should be authenticated where the protocol requires it. Agility must not create algorithm-confusion paths.

A feature flag can control rollout, but it should select a reviewed policy profile rather than arbitrary combinations of primitives. Separate “prefer hybrid when available” from “require hybrid.” Give each setting observable behavior and negative tests so a configuration change cannot silently weaken a required protection.

Keep deprecated choices out of ordinary defaults. Supporting every historical algorithm forever increases complexity and downgrade surface. Agility includes the ability to retire mechanisms and remove obsolete formats once their compatibility window closes.

## Interoperability before broad rollout

Build a matrix across important clients, servers, proxies, runtimes, devices, and network paths. Include unsupported clients deliberately so fallback or rejection behavior is tested. Verify negotiated groups, certificate paths, hostname checks, status processing, and application authorization separately.

Test large messages and constrained buffers. PQ keys, signatures, and certificate chains can exceed assumptions in API gateways, databases, firmware parsers, and inspection devices. Measure handshake retries, failure rates, latency tails, memory, and CPU under representative concurrency. A local success is a capability check, not a production rollout result.

Use the same negative cases as the lab where applicable: wrong keys, modified messages, wrong contexts, malformed encodings, and incompatible groups. Also test operational failures such as unavailable key services, expired certificates, and partially upgraded replicas. These failures reveal whether the system preserves its security contract during change.

Keep evidence tied to exact versions. A supplier update can fix one compatibility issue and change another behavior. The migration matrix should be a maintained artifact, with automated checks for stable cases and explicit manual evidence where automation is impractical.

## Staged rollout and useful telemetry

Begin with a controlled environment, then a small representative canary, followed by measured expansion. The canary should include important client types and paths rather than only the newest developer devices. Define success and pause criteria before increasing traffic.

For TLS, record configured policy, advertised capability, negotiated group, authentication algorithm, handshake result, retry rate, and fresh-versus-resumed status. For signing, record the selected scheme, verification population, rejected formats, and key version. Do not record secret intermediates or internal KEM validity flags.

Coverage metrics need denominators. “Ninety percent hybrid” could mean all fresh handshakes, only capable clients, or a small canary group. Report the population and failed attempts so a compatibility regression is not hidden by excluding unsuccessful connections. Measure high-value paths separately from aggregate traffic.

Track migration outcomes rather than only deployments: which vulnerable paths were removed, which clients remain blocked, which old keys are still trusted, and which exception has an expiry date. An installed package version is useful evidence, but it is not the final security outcome.

## Rollback must preserve an explicit policy

Rollback is a planned response to an identified failure, not an automatic instruction to disable PQC everywhere. If a canary has a buffer-limit problem, the response may be to pause expansion, route a specific client population through a documented compatibility path, or revert a faulty build while retaining the intended security policy.

If rollback restores classical-only key establishment for sensitive data, that changes exposure. Record the scope, owner, duration, and compensating measures. Do not let a temporary availability exception become an invisible permanent default. Where policy requires hybrid negotiation, incompatible clients should fail according to the documented contract.

Key and signature migrations can be harder to reverse than configuration changes. Once new artifacts are signed, old verifiers may not accept them. Once an old trust anchor is removed, recovery must use an already trusted path. Rehearse overlap and rollback before changing trust distribution.

A recovery exercise should include backups and failover sites. Restoring an old configuration can reintroduce deprecated algorithms or keys that the primary environment already retired. Compare recovered state with the current cryptographic policy as part of disaster-recovery validation.

## Guidance timelines and jurisdiction

The [UK NCSC migration guidance](https://www.ncsc.gov.uk/guidance/pqc-migration-timelines) sets indicative milestones: discovery and initial planning by 2028, early high-priority migration and a refined roadmap by 2031, and completion by 2035. Those are the NCSC's stated planning targets for its audience, not evidence that all organizations worldwide have the same legal deadline.

The European Commission and Member States have published a [coordinated implementation roadmap](https://digital-strategy.ec.europa.eu/en/library/coordinated-implementation-roadmap-transition-post-quantum-cryptography). Use the current official roadmap and relevant sector requirements when planning an EU deployment. Do not substitute a vendor's summary for the applicable policy text.

NIST's draft transition guidance and final agility guidance support planning in their respective scopes. A compliance team should map actual obligations by jurisdiction, sector, contract, and system classification. The engineering program can then translate those requirements into testable milestones and evidence, while separately prioritizing risks that require earlier action.

Do not wait for a distant target year to begin inventory and dependency work. Long-lived devices, root distribution, procurement cycles, and archived signatures can consume much of the available lead time. Preparatory work remains useful even when a particular protocol profile is still under standardization.

## A practical migration checklist

Before a work package enters implementation, identify its owner, current mechanism, target profile, affected data, dependencies, client population, and acceptance tests. Confirm that the replacement is appropriate for the actual security purpose and that its status is accurately labelled.

Before rollout, verify functional and negative tests, interoperability, resource budgets, observability, key lifecycle, and rollback behavior. Ensure the operations team can distinguish a capability failure from a certificate or trust-policy failure. Document who can approve an exception and when it expires.

Before declaring completion, verify actual production use, residual fallback, old-key retirement, updated recovery environments, supplier dependencies, and documentation. Keep monitoring for drift and new assets. A completed migration is a maintained state, not a one-time package installation.

## A maturity model based on demonstrated capability

| Level | Demonstrated capability | Evidence to advance |
|---|---|---|
| 0: Unknown | Cryptography is largely undocumented | Named owners and scoped discovery |
| 1: Visible | Inventory and exposure are recorded | Prioritized targets with current evidence |
| 2: Tested | Representative replacements work in a lab | Interoperability and failure tests |
| 3: Controlled | Canary rollout and rollback are exercised | Production negotiation and reliability evidence |
| 4: Managed | High-priority paths migrate with tracked exceptions | Retirement and recovery verification |
| 5: Adaptable | Cryptographic change is a repeatable capability | Rehearsed upgrades, policy enforcement, and drift detection |

This is an educational model, not an official certification framework. An organization may be at different levels for public TLS, firmware signing, and internal PKI. Assess those domains separately to avoid allowing one advanced team to mask an unowned legacy dependency.

## Budget for retirement as well as deployment

A migration budget should include removing old algorithms, updating recovery documentation, rotating affected keys, and supporting the remaining client population. Otherwise, the organization can finish the visible deployment while carrying two permanent systems and an expanding compatibility burden.

Assign an expiry date to every temporary exception and define the evidence needed to close it. An unsupported device may require replacement; an old SDK may require an application release; a retained signing root may require an archival policy decision. These are different work items and should not share a vague “vendor dependency” label indefinitely.

After retirement, test that the obsolete path is actually rejected and cannot be restored by ordinary configuration drift. Preserve any required historical verification capability in an explicitly controlled archival workflow. Removing active trust and preserving historical evidence are separate decisions, each with an owner and a documented purpose.

## Exercise and next steps

Choose one service and produce a one-page migration record: data lifetime, trust boundaries, observed algorithms, owners, dependencies, target profile, canary metrics, rollback policy, and completion evidence. Add one deliberately unresolved question and assign an owner to resolve it. That is more actionable than a broad “be quantum ready” objective.

The next part studies public deployments through primary engineering accounts. Use them as evidence of practical strategies and tradeoffs, while preserving the distinction between another organization's reported rollout and the state of your own systems.

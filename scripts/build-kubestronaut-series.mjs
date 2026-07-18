import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.join(root, "site");
const posts = path.join(site, "posts");

const themeScript = `<script>(function(){var t=localStorage.getItem("cvam-theme")||"paper";if(!localStorage.getItem("cvam-theme-mig")){if(t==="matcha"){t="paper";localStorage.removeItem("cvam-theme");}localStorage.setItem("cvam-theme-mig","1");}if(t&&t!=="paper")document.documentElement.classList.add("theme-"+t);var s=localStorage.getItem("cvam-size");if(s&&s!=="text-md")document.documentElement.classList.add(s);var ls=localStorage.getItem("cvam-ls");if(ls&&ls!=="ls-cozy")document.documentElement.classList.add(ls);var f=localStorage.getItem("cvam-font");if(f&&f!=="font-sans")document.documentElement.classList.add(f);else{var sf=localStorage.getItem("cvam-sans");if(sf==="0")document.documentElement.classList.add("font-serif");}document.documentElement.classList.add("view-modern");})()</script>`;

const certs = [
  { code: "KCNA", slug: "cheat-kcna", label: "Foundations" },
  { code: "KCSA", slug: "cheat-kcsa", label: "Security foundations" },
  { code: "CKA", slug: "cheat-cka", label: "Administration" },
  { code: "CKAD", slug: "cheat-ckad", label: "Applications" },
  { code: "CKS", slug: "cheat-cks", label: "Security specialist" },
];

function sidebar(prefix = "../") {
  return `<aside class="sidebar">
      <a href="${prefix}index.html" class="logo"><span class="dot"></span> cvam.sight</a>
      <p class="sidebar-sub">blog from a devops + ml apprentice</p>
      <nav>
        <a href="${prefix}index.html">Home</a>
        <a href="${prefix}series.html" class="active">Series</a>
        <a href="${prefix}ai-native.html">AI Native</a>
        <a href="${prefix}archive.html">Archive</a>
        <a href="${prefix}paperjuice.html">Paper Juice</a>
        <a href="${prefix}discover.html">Discover</a>
        <a href="${prefix}about.html">About</a>
      </nav>
      <div class="sidebar-footer">
        <p class="sidebar-stat" id="site-readers"></p>
        <a href="https://www.linkedin.com/in/shivam-kumar2003/" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="mailto:shivam.sk2003@gmail.com">Email</a>
      </div>
    </aside>`;
}

function seriesBanner(active) {
  const activeIndex = certs.findIndex((cert) => cert.code === active);
  return `<div class="series-banner">
    <p class="series-banner-label">Road to Kubestronaut · Certification ${activeIndex + 1}</p>
    <p class="series-banner-title">${active}: ${certs[activeIndex].label}</p>
    <div class="series-banner-progress">${certs.map((cert, index) => `<div class="series-pip ${index < activeIndex ? "done" : index === activeIndex ? "current" : ""}"></div>`).join("")}</div>
    <p class="series-banner-meta">Guide ${activeIndex + 1} of ${certs.length}</p>
    <div class="series-banner-nav">${certs.map((cert, index) => `<a href="${cert.slug}.html" class="${index < activeIndex ? "done" : index === activeIndex ? "active" : ""}">${String(index + 1).padStart(2, "0")} ${cert.code}</a>`).join("")}</div>
  </div>`;
}

function articlePage(guide) {
  const index = certs.findIndex((cert) => cert.code === guide.code);
  const prev = certs[index - 1];
  const next = certs[index + 1];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${guide.code} Exam Cheatsheet — cvam.sight</title>
<meta name="description" content="${guide.description}">
<link rel="stylesheet" href="../style.css?v=51">
${themeScript}
<link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
<script defer src="/_vercel/speed-insights/script.js"></script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
  <div class="progress-bar"></div>
  <div class="layout has-toc">
    ${sidebar("../")}
    <div class="page">
    <article>
      <p class="meta" style="margin-bottom:8px"><a href="../series-kubestronaut.html" style="color:var(--ink-faint);text-decoration:none">&larr; Road to Kubestronaut</a></p>
      <div class="post-header">
        <p class="meta">KUBESTRONAUT · ${guide.examType.toUpperCase()} · CURRENT CURRICULUM</p>
        <h1>${guide.title}</h1>
        <div class="tag-row">${guide.tags.map((tag, i) => `<span class="tag${i === 0 ? " fill" : ""}">${tag}</span>`).join("")}</div>
      </div>
      ${seriesBanner(guide.code)}
      <div class="post-body">
${guide.body}
        <h2 id="official-sources">Official sources &amp; freshness</h2>
        <p>This guide was checked against the official Linux Foundation exam page and CNCF curriculum on <strong>19 July 2026</strong>. Exam versions and policies can change; re-check the source page before booking.</p>
        <ul>
          <li><a href="${guide.official}" target="_blank" rel="noreferrer">Linux Foundation — ${guide.code} certification and current domains</a></li>
          <li><a href="https://github.com/cncf/curriculum" target="_blank" rel="noreferrer">CNCF — open certification curricula</a></li>
          <li><a href="https://www.cncf.io/training/kubestronaut/kubestronaut-faq/" target="_blank" rel="noreferrer">CNCF — Kubestronaut requirements and renewal FAQ</a></li>
        </ul>
      </div>
      <div class="post-nav">
        ${prev ? `<a href="${prev.slug}.html">&larr; prev: ${prev.code}</a>` : `<a href="../series-kubestronaut.html">&larr; series map</a>`}
        ${next ? `<a href="${next.slug}.html">next: ${next.code} &rarr;</a>` : `<a href="../series-kubestronaut.html">series map &rarr;</a>`}
      </div>
    </article>
    <footer class="footer"><span>&copy; cvam — written in plaintext, served warm</span></footer>
    </div>
    <aside class="toc-panel"><p class="toc-panel-label">// on this page</p><nav id="toc-nav"></nav></aside>
  </div>
  <script src="../posts.js?v=2"></script>
  <script src="../stats.js"></script>
  <script src="../app.js?v=31"></script>
  <script defer src="../settings.js?v=10"></script>
  <script type="module" src="../highlighter.js"></script>
  <script defer src="../reader.js"></script>
</body>
</html>`;
}

function landingPage() {
  const missions = [
    { code: "KCNA", n: "01", title: "Build the cloud native map", desc: "Architecture, orchestration, delivery, observability and the CNCF ecosystem. Learn the vocabulary and mental models every later exam assumes.", meta: "90 min · multiple choice · beginner", tags: "44 / 28 / 16 / 12" },
    { code: "KCSA", n: "02", title: "Think in threats and controls", desc: "The 4Cs, component trust boundaries, identity, Pod and network security, supply chain, platform security and compliance.", meta: "90 min · multiple choice · beginner", tags: "14 / 22 / 22 / 16 / 16 / 10" },
    { code: "CKA", n: "03", title: "Operate the cluster", desc: "Troubleshoot, install, upgrade and secure clusters; manage networking, workloads, storage, RBAC, etcd and control-plane lifecycle.", meta: "2 hours · hands-on · Kubernetes v1.35", tags: "30 / 25 / 20 / 15 / 10" },
    { code: "CKAD", n: "04", title: "Ship applications under pressure", desc: "Design workloads, roll out versions, configure and secure Pods, build health checks, expose Services and debug failures quickly.", meta: "2 hours · hands-on · Kubernetes v1.35", tags: "20 / 20 / 15 / 25 / 20" },
    { code: "CKS", n: "05", title: "Secure build, cluster and runtime", desc: "Harden the platform and OS, minimize workload vulnerabilities, protect the supply chain, audit behavior and investigate runtime threats.", meta: "2 hours · hands-on · CKA prerequisite", tags: "15 / 15 / 10 / 20 / 20 / 20" },
  ];
  const missionHtml = missions.map((m) => `<section class="series-phase" id="${m.code.toLowerCase()}">
        <div class="phase-header"><div class="phase-badge done">${m.n}</div><div><h2 class="phase-title">${m.code} — ${m.title}</h2><p class="phase-desc">${m.desc}</p></div></div>
        <div class="phase-articles"><a href="posts/cheat-${m.code.toLowerCase()}.html" class="phase-article"><span class="phase-article-num">${m.n}</span><div class="phase-article-body"><h3>Open the complete ${m.code} exam cheatsheet</h3><p>${m.meta}</p></div><span class="difficulty ${m.code === "KCNA" || m.code === "KCSA" ? "beginner" : "advanced"}">${m.tags}</span><span class="phase-article-time">guide →</span></a></div>
      </section><hr class="rule">`).join("\n");
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Road to Kubestronaut — KCNA, KCSA, CKA, CKAD &amp; CKS — cvam.sight</title>
<meta name="description" content="A current, connected preparation series for all five CNCF Kubernetes certifications required for Kubestronaut: KCNA, KCSA, CKA, CKAD and CKS.">
<meta property="og:type" content="article"><meta property="og:site_name" content="cvam.sight"><meta property="og:title" content="Road to Kubestronaut"><meta property="og:description" content="Five certifications, one connected path: KCNA, KCSA, CKA, CKAD and CKS."><meta property="og:url" content="https://shivam2003.com/series-kubestronaut"><meta property="og:image" content="https://shivam2003.com/assets/kubestronaut-series-og.png"><meta property="og:image:width" content="1731"><meta property="og:image:height" content="909"><meta property="og:image:alt" content="Road to Kubestronaut — KCNA, KCSA, CKA, CKAD and CKS learning path">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Road to Kubestronaut"><meta name="twitter:description" content="Five certifications, one connected path: KCNA, KCSA, CKA, CKAD and CKS."><meta name="twitter:image" content="https://shivam2003.com/assets/kubestronaut-series-og.png">
<link rel="stylesheet" href="style.css?v=53">${themeScript}<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<script defer src="/_vercel/speed-insights/script.js"></script><script defer src="/_vercel/insights/script.js"></script></head>
<body class="kubestronaut-series-page"><div class="layout">${sidebar("")}<div class="page">
  <p class="meta" style="margin-bottom:8px"><a href="series.html" style="color:var(--ink-faint);text-decoration:none">&larr; All Series</a></p>
  <div class="series-page-header">
    <p class="meta">SERIES // FIVE ACTIVE CERTIFICATIONS · ONE KUBESTRONAUT PATH</p>
  </div>
  <figure class="series-hero-image">
    <img src="assets/kubestronaut-series-og.png" width="1731" height="909" alt="Road to Kubestronaut learning path from KCNA and KCSA through CKA, CKAD and CKS" decoding="async" fetchpriority="high">
    <figcaption>Five certifications · one connected Kubernetes path</figcaption>
  </figure>
  <div class="series-page-stats"><div class="series-stat"><strong>5</strong><span>certifications</span></div><div class="series-stat"><strong>2</strong><span>associate exams</span></div><div class="series-stat"><strong>3</strong><span>hands-on exams</span></div><div class="series-stat"><strong>v1.35</strong><span>performance track</span></div></div>
  <hr class="rule">
  <div class="post-body">
  <div class="gotcha"><span class="gotcha-label">the destination</span>CNCF recognizes a Kubestronaut after <strong>KCNA, KCSA, CKA, CKAD and CKS</strong> have all been passed and are active together. CKS requires a passed CKA. The order below minimizes context switching and reuses each exam's knowledge in the next.</div>

  <h2 id="route">The recommended route</h2>
  <div class="series-roadmap"><div class="roadmap-track">
    ${missions.map((m, i) => `<a class="roadmap-node" href="#${m.code.toLowerCase()}"><span class="roadmap-dot done"></span><span class="roadmap-label">${m.code}</span><span class="roadmap-sub">${["map","threats","operate","ship","secure"][i]}</span></a>${i < missions.length - 1 ? '<span class="roadmap-line"></span>' : ''}`).join("")}
  </div></div>
  <p><strong>Why this order?</strong> KCNA makes the object and ecosystem vocabulary explicit. KCSA layers security reasoning on top. CKA builds operational fluency and satisfies the CKS prerequisite. CKAD reuses kubectl speed while narrowing focus to application delivery. CKS then combines cluster administration, workload security and supply-chain/runtime controls.</p>

  <h2 id="compare">Know which exam you are sitting</h2>
  <table><thead><tr><th>Exam</th><th>Format</th><th>Primary skill</th><th>Preparation bias</th></tr></thead><tbody>
    <tr><td><strong>KCNA</strong></td><td>90-min multiple choice</td><td>Cloud native concepts and component ownership</td><td>Explain why alternatives are wrong</td></tr>
    <tr><td><strong>KCSA</strong></td><td>90-min multiple choice</td><td>Threat boundaries and security controls</td><td>Map risks to prevent/detect/respond controls</td></tr>
    <tr><td><strong>CKA</strong></td><td>2-hour terminal</td><td>Cluster operations and troubleshooting</td><td>Practice complete admin tasks with verification</td></tr>
    <tr><td><strong>CKAD</strong></td><td>2-hour terminal</td><td>Application design, delivery and debugging</td><td>Generate/edit manifests at speed</td></tr>
    <tr><td><strong>CKS</strong></td><td>2-hour terminal</td><td>Platform, workload, supply-chain and runtime security</td><td>Apply narrow controls and test allowed + denied behavior</td></tr>
  </tbody></table>

  <h2 id="shared-core">The shared core that compounds</h2>
  <table><thead><tr><th>Skill</th><th>Starts</th><th>Deepens</th><th>Finishes</th></tr></thead><tbody>
    <tr><td>Kubernetes architecture</td><td>KCNA component model</td><td>CKA lifecycle/troubleshooting</td><td>CKS component hardening</td></tr>
    <tr><td>Workload design</td><td>KCNA object choice</td><td>CKAD multi-container/deployment</td><td>CKS restricted runtime</td></tr>
    <tr><td>Identity and policy</td><td>KCSA authn/authz/admission</td><td>CKA/CKAD RBAC and ServiceAccounts</td><td>CKS least privilege and admission</td></tr>
    <tr><td>Networking</td><td>KCNA Service/CNI model</td><td>CKA/CKAD DNS, Gateway/Ingress, NetworkPolicy</td><td>CKS segmentation and encryption</td></tr>
    <tr><td>Supply chain</td><td>KCSA image/provenance concepts</td><td>CKAD image and delivery mechanics</td><td>CKS scan, sign, attest and admit</td></tr>
  </tbody></table>

  <h2 id="renewal">Keep the five active: CARE in 2026</h2>
  <p>The CNCF CARE program now links progression and renewal. If you previously earned KCNA, passing or recertifying CKA or CKAD can extend KCNA. Passing or recertifying CKS can extend KCSA; from <strong>18 June 2026</strong>, CKS can also reinstate or extend CKA. These links reduce renewal friction, but Kubestronaut recognition still requires all five certifications to be active. Confirm your own dates in the Linux Foundation portal and the current CNCF FAQ.</p>

  <h2 id="plan">A realistic preparation rhythm</h2>
  <ol>
    <li><strong>Foundation block:</strong> KCNA concepts, daily kubectl reading, then timed associate questions.</li>
    <li><strong>Security foundation block:</strong> KCSA trust boundaries, identity, supply chain and framework scenarios.</li>
    <li><strong>Operations block:</strong> CKA cluster tasks until context switching, etcd, upgrades and troubleshooting are automatic.</li>
    <li><strong>Application block:</strong> CKAD timed manifest work, rollouts, probes, configuration, Services and policies.</li>
    <li><strong>Security specialist block:</strong> CKS hardening, restricted workloads, supply chain, audit and runtime investigation—with a positive and negative test for every control.</li>
  </ol>
  <p>Do not study all five as isolated syllabi. Maintain one lab notebook with four columns: <strong>concept → command/manifest → failure signal → verification</strong>. The same knowledge should become more operational on every pass.</p>

  <hr class="rule">
  ${missionHtml}
  <h2 id="sources">Official references</h2>
  <p>Curriculum and program details checked on <strong>19 July 2026</strong>. Re-check before scheduling because Kubernetes versions and certification policies move.</p>
  <ul><li><a href="https://github.com/cncf/curriculum" target="_blank" rel="noreferrer">CNCF certification curricula</a></li><li><a href="https://www.cncf.io/training/kubestronaut/kubestronaut-faq/" target="_blank" rel="noreferrer">Kubestronaut FAQ</a></li><li><a href="https://www.cncf.io/training/" target="_blank" rel="noreferrer">CNCF training paths and CARE renewal rules</a></li></ul>
  </div>
  <footer class="footer"><span>&copy; cvam — written in plaintext, served warm</span></footer>
</div></div><script src="posts.js?v=2"></script><script src="stats.js"></script><script src="app.js?v=31"></script><script defer src="settings.js?v=10"></script></body></html>`;
}

const kcna = {
  code: "KCNA",
  examType: "90-minute multiple-choice",
  title: "KCNA — The Kubernetes and Cloud Native Associate Cheatsheet.",
  description: "Current KCNA exam guide covering Kubernetes fundamentals, container orchestration, cloud native application delivery, architecture, observability, the CNCF ecosystem, scenario reasoning, exam traps, and a focused study plan.",
  tags: ["kubernetes", "kcna", "cloud-native", "cncf", "exam-prep"],
  official: "https://training.linuxfoundation.org/certification/kubernetes-cloud-native-associate/",
  body: String.raw`
        <blockquote>
          <strong>KCNA</strong> is the conceptual foundation of the Kubestronaut path: a <strong>90-minute, online, proctored, multiple-choice</strong> exam with no prerequisites. Its current blueprint is <strong>Kubernetes Fundamentals 44% · Container Orchestration 28% · Cloud Native Application Delivery 16% · Cloud Native Architecture 12%</strong>. The exam rewards correct mental models and scenario judgment, not memorized command flags. Ask: <em>which component owns this responsibility, which object expresses the intent, and which cloud-native principle explains the design?</em>
        </blockquote>

        <h2 id="exam-map">0. Exam map and question strategy</h2>
        <table><thead><tr><th>Domain</th><th>Weight</th><th>What must be automatic</th></tr></thead><tbody>
          <tr><td><strong>Kubernetes Fundamentals</strong></td><td>44%</td><td>Architecture, API objects, reconciliation, scheduling, containers</td></tr>
          <tr><td><strong>Container Orchestration</strong></td><td>28%</td><td>Networking, security, storage, troubleshooting</td></tr>
          <tr><td><strong>Application Delivery</strong></td><td>16%</td><td>Declarative delivery, rollout, GitOps, debugging</td></tr>
          <tr><td><strong>Cloud Native Architecture</strong></td><td>12%</td><td>Observability, CNCF landscape, principles and community</td></tr>
        </tbody></table>
        <div class="gotcha"><span class="gotcha-label">scenario first</span>For every question, identify the layer: container, Pod, workload controller, Service, cluster component, or external cloud-native system. Eliminate answers that solve the wrong layer even if the technology name sounds plausible.</div>

        <h2 id="core-model">1. Kubernetes core model</h2>
        <p>Kubernetes is a <strong>declarative control system</strong>. You submit desired state to the API; controllers continuously compare desired state with observed state and act to close the gap. This loop is <strong>reconciliation</strong>. Objects are durable intent, not one-time commands.</p>
        <table><thead><tr><th>Component</th><th>Responsibility</th><th>Common distractor</th></tr></thead><tbody>
          <tr><td><strong>kube-apiserver</strong></td><td>Authentication, authorization, admission and API front door</td><td>It does not schedule Pods</td></tr>
          <tr><td><strong>etcd</strong></td><td>Strongly consistent store for cluster state</td><td>Applications should not use it directly</td></tr>
          <tr><td><strong>scheduler</strong></td><td>Chooses a node for an unscheduled Pod</td><td>It does not start containers</td></tr>
          <tr><td><strong>controller manager</strong></td><td>Runs reconciliation controllers</td><td>It does not proxy Service traffic</td></tr>
          <tr><td><strong>kubelet</strong></td><td>Node agent that makes PodSpecs run</td><td>It is not the cluster scheduler</td></tr>
          <tr><td><strong>container runtime</strong></td><td>Pulls images and runs containers through CRI</td><td>Docker is not required</td></tr>
          <tr><td><strong>kube-proxy / dataplane</strong></td><td>Implements Service reachability</td><td>CNI handles Pod connectivity</td></tr>
        </tbody></table>
        <pre data-lang="bash"># read desired and observed state side by side
kubectl get deploy web -o yaml
kubectl get pods -l app=web -o wide
kubectl describe pod &lt;pod&gt;     # conditions + events
kubectl api-resources           # discover object kinds and scope</pre>

        <h3 id="objects">Objects and controllers</h3>
        <table><thead><tr><th>Need</th><th>Choose</th><th>Reason</th></tr></thead><tbody>
          <tr><td>One disposable process</td><td>Pod</td><td>Smallest schedulable unit; usually managed by a controller</td></tr>
          <tr><td>Stateless replicated app</td><td>Deployment</td><td>Rollouts, rollback and replica management</td></tr>
          <tr><td>Stable identity and storage</td><td>StatefulSet</td><td>Ordered identity, stable DNS and per-Pod PVCs</td></tr>
          <tr><td>One copy per eligible node</td><td>DaemonSet</td><td>Agents such as log collectors or CNI components</td></tr>
          <tr><td>Finite work</td><td>Job</td><td>Runs to completion with retry semantics</td></tr>
          <tr><td>Scheduled finite work</td><td>CronJob</td><td>Creates Jobs on a cron schedule</td></tr>
        </tbody></table>
        <p><strong>Labels</strong> identify and group objects. <strong>Selectors</strong> connect controllers and Services to Pods. <strong>Annotations</strong> hold non-identifying metadata. Namespaces create administrative scope, but are not by themselves a hard security boundary.</p>

        <h2 id="scheduling">2. Scheduling and self-healing</h2>
        <ul>
          <li><strong>requests</strong> influence placement; <strong>limits</strong> constrain runtime consumption.</li>
          <li><strong>nodeSelector / required affinity</strong> attracts only to matching nodes; preferred affinity expresses a soft preference.</li>
          <li><strong>taints</strong> repel Pods; <strong>tolerations</strong> allow—but do not force—placement.</li>
          <li><strong>pod anti-affinity</strong> and topology spread distribute replicas across failure domains.</li>
          <li>Controllers replace failed Pods; the kubelet restarts failed containers according to restart policy.</li>
        </ul>
        <div class="gotcha"><span class="gotcha-label">requests vs limits</span>A Pod can remain Pending because its requests cannot fit. CPU over a limit is throttled; memory over a limit commonly ends in <code>OOMKilled</code>.</div>

        <h2 id="containers">3. Container fundamentals</h2>
        <p>A container image is an immutable, layered OCI artifact. A registry stores and distributes images; a runtime pulls and executes them. Containers share the host kernel, unlike virtual machines with separate guest kernels. Kubernetes talks to runtimes through <strong>CRI</strong>, networks through <strong>CNI</strong>, and storage implementations through <strong>CSI</strong>.</p>
        <ul>
          <li><strong>Image tag</strong> is mutable; a digest such as <code>@sha256:…</code> identifies exact content.</li>
          <li><strong>ENTRYPOINT</strong> defines the executable; <strong>CMD</strong> supplies defaults. Kubernetes <code>command</code> and <code>args</code> override them.</li>
          <li><strong>Init containers</strong> run sequentially before app containers. <strong>Sidecars</strong> support the main app in the same Pod and share network/volumes.</li>
          <li>Containers in one Pod share the network namespace and can reach each other on <code>localhost</code>.</li>
        </ul>

        <h2 id="networking">4. Networking, Services and DNS</h2>
        <p>The Kubernetes network model expects every Pod to have an IP and for Pods to communicate without NAT inside the cluster. A CNI plugin realizes that model. Pod IPs are ephemeral, so a <strong>Service</strong> supplies a stable virtual IP and DNS name over a changing endpoint set.</p>
        <table><thead><tr><th>Resource</th><th>Use</th></tr></thead><tbody>
          <tr><td><strong>ClusterIP</strong></td><td>Stable in-cluster access; default Service type</td></tr>
          <tr><td><strong>NodePort</strong></td><td>Exposes a high port on each node</td></tr>
          <tr><td><strong>LoadBalancer</strong></td><td>Requests an external load balancer from an integration/provider</td></tr>
          <tr><td><strong>Ingress / Gateway API</strong></td><td>Layer-7 HTTP routing; requires a controller</td></tr>
          <tr><td><strong>NetworkPolicy</strong></td><td>Controls allowed Pod ingress/egress when the CNI enforces it</td></tr>
        </tbody></table>
        <pre data-lang="bash">kubectl get svc,endpointslices
kubectl get pods --show-labels
kubectl run dns --image=busybox:1.36 --rm -it --restart=Never -- \
  nslookup web.default.svc.cluster.local</pre>
        <div class="gotcha"><span class="gotcha-label">empty endpoints</span>If a Service exists but has no backends, compare its selector with Pod labels and check Pod readiness. Changing DNS or the Service type will not repair a selector mismatch.</div>

        <h2 id="security-storage">5. Security and storage</h2>
        <p>Cloud native security is layered: <strong>cloud/infrastructure → cluster → container → code</strong>. Kubernetes authentication establishes identity, authorization decides allowed actions, and admission evaluates requests before persistence. RBAC grants verbs on resources through Roles and bindings.</p>
        <ul>
          <li><strong>ConfigMap</strong> stores non-sensitive configuration; <strong>Secret</strong> represents sensitive data but base64 alone is not encryption.</li>
          <li><strong>SecurityContext</strong> controls UID/GID, privilege escalation, Linux capabilities, read-only root filesystems and seccomp.</li>
          <li><strong>Pod Security Standards</strong> define Privileged, Baseline and Restricted profiles.</li>
          <li><strong>ServiceAccount</strong> is a workload identity; avoid broad permissions and unnecessary token mounting.</li>
        </ul>
        <p>Storage separates request from implementation. A <strong>PVC</strong> is a workload's claim, a <strong>PV</strong> is provisioned storage, and a <strong>StorageClass</strong> defines dynamic provisioning and policy. <code>emptyDir</code> follows Pod lifetime; a persistent volume survives Pod replacement according to reclaim policy.</p>

        <h2 id="delivery">6. Cloud native application delivery</h2>
        <ul>
          <li><strong>Declarative delivery</strong>: store desired state, review changes, reconcile continuously.</li>
          <li><strong>CI</strong>: build and test artifacts. <strong>CD</strong>: safely deliver them. GitOps uses Git as the reviewed desired-state source and an agent reconciles the cluster.</li>
          <li><strong>Rolling update</strong> gradually replaces replicas; <strong>blue/green</strong> switches traffic between complete environments; <strong>canary</strong> sends limited traffic to a new version.</li>
          <li><strong>Helm</strong> packages parameterized Kubernetes resources. <strong>Kustomize</strong> layers patches over declarative bases.</li>
        </ul>
        <pre data-lang="bash">kubectl rollout status deploy/web
kubectl rollout history deploy/web
kubectl rollout undo deploy/web
kubectl logs deploy/web --all-containers
kubectl get events --sort-by=.lastTimestamp</pre>

        <h2 id="observability">7. Observability and cloud native architecture</h2>
        <p><strong>Monitoring</strong> checks known conditions; <strong>observability</strong> lets you investigate unknown behavior from system outputs. The core signals are metrics, logs and traces. Prometheus collects time-series metrics, OpenTelemetry standardizes telemetry generation and transport, and tracing follows a request across services.</p>
        <table><thead><tr><th>Principle</th><th>Meaning</th></tr></thead><tbody>
          <tr><td>Loose coupling</td><td>Components communicate through explicit contracts and fail independently</td></tr>
          <tr><td>Elasticity</td><td>Capacity scales with demand</td></tr>
          <tr><td>Resilience</td><td>Redundancy, recovery and bounded failure</td></tr>
          <tr><td>Immutability</td><td>Replace versioned artifacts instead of patching them in place</td></tr>
          <tr><td>Automation</td><td>Repeatable APIs and reconciliation replace manual snowflakes</td></tr>
        </tbody></table>
        <p>CNCF hosts projects across orchestration, observability, networking, storage, security and delivery. Know the <em>category and job</em>, not every logo: Prometheus (metrics), Envoy (proxy), containerd (runtime), CoreDNS (DNS), Helm (packaging), Argo (delivery/workflows), Fluent Bit (logs), OpenTelemetry (telemetry), Cilium (networking/security), Rook (storage orchestration).</p>

        <h2 id="troubleshooting">8. Troubleshooting decision tree</h2>
        <ol>
          <li><strong>Read status and events:</strong> Pending suggests scheduling/PVC; CrashLoopBackOff suggests process/config/probe; ImagePullBackOff suggests image/auth.</li>
          <li><strong>Check desired vs actual:</strong> controller replicas, selectors, labels, resources and mounts.</li>
          <li><strong>Check logs:</strong> current container, then <code>--previous</code> after a restart.</li>
          <li><strong>Walk the network:</strong> Pod → EndpointSlice → Service → DNS → policy → ingress/gateway.</li>
          <li><strong>Change one layer:</strong> verify after every change instead of guessing across the stack.</li>
        </ol>

        <h2 id="api-anatomy">9. API anatomy, lifecycle and scaling</h2>
        <p>Every Kubernetes object has <code>apiVersion</code>, <code>kind</code>, <code>metadata</code> and usually <code>spec</code>. The user declares <strong>spec</strong>; controllers and components report <strong>status</strong>. <code>metadata.generation</code> changes when desired state changes, while <code>status.observedGeneration</code> shows what the controller has processed. Finalizers delay deletion until cleanup finishes; owner references let garbage collection remove dependents.</p>
        <table><thead><tr><th>Scaling mechanism</th><th>Signal</th><th>Changes</th></tr></thead><tbody>
          <tr><td><strong>HPA</strong></td><td>CPU, memory or custom/external metrics</td><td>Workload replica count</td></tr>
          <tr><td><strong>VPA</strong></td><td>Observed resource usage</td><td>Container requests, often with Pod replacement</td></tr>
          <tr><td><strong>Cluster Autoscaler</strong></td><td>Unschedulable Pods / underused nodes</td><td>Node count</td></tr>
        </tbody></table>
        <p>These mechanisms solve different bottlenecks. HPA cannot help when Pods are Pending because the cluster has no capacity; Cluster Autoscaler can add nodes when the infrastructure integration supports it. Requests must be meaningful for percentage-based CPU HPA behavior.</p>

        <h2 id="community">10. CNCF community, project maturity and collaboration</h2>
        <p>Cloud native is also an open-source operating model. CNCF provides neutral governance, conformance programs, community processes and a home for projects. Project maturity—<strong>Sandbox, Incubating, Graduated</strong>—communicates governance, adoption and sustainability signals; it is not a simple feature or security ranking.</p>
        <ul>
          <li><strong>Kubernetes conformance</strong> gives users portability expectations across conformant distributions.</li>
          <li><strong>Special Interest Groups (SIGs)</strong> own Kubernetes areas; enhancement proposals document substantial changes.</li>
          <li><strong>Maintainers</strong> steward projects; contributors use issues, pull requests, reviews and community meetings.</li>
          <li><strong>Open standards and APIs</strong> reduce vendor lock-in, but portability still depends on storage, networking and cloud-provider integrations.</li>
          <li>The CNCF Landscape is a discovery map, not a recommendation to deploy one tool from every category.</li>
        </ul>

        <h2 id="questions">11. Rapid scenario checks</h2>
        <ul>
          <li><strong>Every node needs a log agent?</strong> DaemonSet.</li>
          <li><strong>Database replicas need stable names and disks?</strong> StatefulSet.</li>
          <li><strong>Service has no endpoints?</strong> Selector/readiness mismatch.</li>
          <li><strong>Pod is unschedulable despite idle CPU?</strong> Check requests, taints, affinity and unbound PVCs.</li>
          <li><strong>Need least-privilege namespace access?</strong> Role + RoleBinding.</li>
          <li><strong>Need HTTP host/path routing?</strong> Ingress or Gateway API plus its controller.</li>
          <li><strong>Need exact immutable image?</strong> Pin the digest.</li>
          <li><strong>Need telemetry across services?</strong> Distributed tracing, commonly instrumented with OpenTelemetry.</li>
        </ul>

        <h2 id="study">12. Seven-day study order</h2>
        <ol>
          <li><strong>Day 1:</strong> architecture, API objects, reconciliation and kubectl reading.</li>
          <li><strong>Day 2:</strong> workloads, scheduling and container fundamentals.</li>
          <li><strong>Day 3:</strong> Services, DNS, CNI and NetworkPolicy.</li>
          <li><strong>Day 4:</strong> RBAC, Pod security, Secrets and storage.</li>
          <li><strong>Day 5:</strong> delivery strategies, Helm/Kustomize and GitOps.</li>
          <li><strong>Day 6:</strong> observability, CNCF project categories and architecture principles.</li>
          <li><strong>Day 7:</strong> timed scenario questions; explain why every wrong option is wrong.</li>
        </ol>`
};

const kcsa = {
  code: "KCSA",
  examType: "90-minute multiple-choice",
  title: "KCSA — The Kubernetes and Cloud Native Security Associate Cheatsheet.",
  description: "Current KCSA exam guide covering the 4Cs, Kubernetes component security, authentication, RBAC, admission, Pod Security Standards, threat models, supply-chain security, platform controls, compliance, scenario questions, and exam traps.",
  tags: ["kubernetes", "kcsa", "security", "threat-modeling", "exam-prep"],
  official: "https://training.linuxfoundation.org/certification/kubernetes-and-cloud-native-security-associate-kcsa/",
  body: String.raw`
        <blockquote>
          <strong>KCSA</strong> tests whether you can reason about cloud native security before operating security tools under pressure. It is a <strong>90-minute, online, proctored, multiple-choice</strong> exam with no prerequisite. Current domains: <strong>Cloud Native Security 14% · Cluster Component Security 22% · Kubernetes Security Fundamentals 22% · Threat Model 16% · Platform Security 16% · Compliance &amp; Frameworks 10%</strong>. Think in trust boundaries, identities, data flows and layered controls.
        </blockquote>

        <h2 id="exam-map">0. Exam map and the security reasoning loop</h2>
        <table><thead><tr><th>Domain</th><th>Weight</th><th>Anchor question</th></tr></thead><tbody>
          <tr><td>Overview of Cloud Native Security</td><td>14%</td><td>Which of the 4Cs owns this risk?</td></tr>
          <tr><td>Cluster Component Security</td><td>22%</td><td>Which component, credential or endpoint is exposed?</td></tr>
          <tr><td>Kubernetes Security Fundamentals</td><td>22%</td><td>Which identity, policy or admission control applies?</td></tr>
          <tr><td>Kubernetes Threat Model</td><td>16%</td><td>What boundary is crossed and what is the attack outcome?</td></tr>
          <tr><td>Platform Security</td><td>16%</td><td>Which supply-chain, network or PKI control reduces the risk?</td></tr>
          <tr><td>Compliance &amp; Frameworks</td><td>10%</td><td>Which framework defines, measures or automates the control?</td></tr>
        </tbody></table>
        <ol>
          <li><strong>Asset:</strong> what needs protection—API, etcd data, image, credential, node, workload?</li>
          <li><strong>Actor:</strong> user, compromised Pod, malicious image, insider, external attacker?</li>
          <li><strong>Boundary:</strong> registry→cluster, user→API, Pod→Pod, Pod→node, node→cloud metadata?</li>
          <li><strong>Control:</strong> prevent, detect, respond or recover?</li>
          <li><strong>Layer:</strong> apply the control as close to the risk as possible, with defense in depth.</li>
        </ol>

        <h2 id="four-cs">1. The 4Cs of cloud native security</h2>
        <p>The 4Cs are nested: <strong>Cloud → Cluster → Container → Code</strong>. A weakness in an outer layer can invalidate inner controls, so securing application code cannot compensate for a publicly exposed control plane or compromised node.</p>
        <table><thead><tr><th>Layer</th><th>Typical risks</th><th>Representative controls</th></tr></thead><tbody>
          <tr><td><strong>Cloud</strong></td><td>Overbroad IAM, public networks, metadata theft</td><td>Least privilege, private endpoints, workload identity, encryption</td></tr>
          <tr><td><strong>Cluster</strong></td><td>Weak API access, unsafe kubelet/etcd, missing segmentation</td><td>RBAC, admission, CIS hardening, NetworkPolicy, audit</td></tr>
          <tr><td><strong>Container</strong></td><td>Root, capabilities, writable filesystem, vulnerable image</td><td>Restricted security context, scanning, signing, sandboxing</td></tr>
          <tr><td><strong>Code</strong></td><td>Injection, secrets in source, unsafe dependencies</td><td>SAST/SCA, secure SDLC, secret scanning, patching</td></tr>
        </tbody></table>
        <div class="gotcha"><span class="gotcha-label">shared responsibility</span>Managed Kubernetes shifts operation of some control-plane components to the provider; it does not transfer responsibility for RBAC, workload identity, Pod security, images, application code or data.</div>

        <h2 id="components">2. Kubernetes component security</h2>
        <table><thead><tr><th>Component</th><th>Sensitive surface</th><th>Secure posture</th></tr></thead><tbody>
          <tr><td><strong>API server</strong></td><td>Primary control-plane entry point</td><td>Strong authn, least-privilege authz, admission, TLS, audit, private reachability</td></tr>
          <tr><td><strong>etcd</strong></td><td>Entire cluster state, including Secret objects</td><td>Mutual TLS, restricted network access, encryption at rest, protected backups</td></tr>
          <tr><td><strong>kubelet</strong></td><td>Node workload control and logs/exec APIs</td><td>Disable anonymous access, webhook authz, restrict port/network exposure</td></tr>
          <tr><td><strong>scheduler/controllers</strong></td><td>Powerful kubeconfigs and service accounts</td><td>Protect credentials, use minimal authorization, bind secure endpoints</td></tr>
          <tr><td><strong>container runtime</strong></td><td>Image execution and host boundary</td><td>Patch runtime, restrict socket, use runtime isolation where needed</td></tr>
          <tr><td><strong>kube-proxy/CNI</strong></td><td>Cluster dataplane</td><td>Protect configuration, enforce segmentation, observe flows</td></tr>
          <tr><td><strong>client</strong></td><td>kubeconfig, tokens and local plugins</td><td>Protect files, use short-lived credentials, distrust unknown kubeconfigs</td></tr>
        </tbody></table>
        <p>A kubeconfig can reference credential plugins and remote data; treat an untrusted kubeconfig like executable content. Client certificates, bearer tokens and service-account tokens are credentials—not harmless configuration.</p>

        <h2 id="identity">3. Authentication, authorization and admission</h2>
        <p>The request pipeline is ordered: <strong>authenticate identity → authorize action → run admission → persist state</strong>. Each stage answers a different question.</p>
        <ul>
          <li><strong>Authentication:</strong> Who are you? Certificates, OIDC tokens, service-account tokens.</li>
          <li><strong>Authorization:</strong> May you perform this verb on this resource? Usually RBAC.</li>
          <li><strong>Admission:</strong> Is the requested object acceptable, and should it be mutated? Built-in or webhook controllers.</li>
          <li><strong>Audit:</strong> What request occurred, who made it and how was it handled?</li>
        </ul>
        <pre data-lang="bash"># authorization checks expose effective privilege
kubectl auth can-i create deployments -n team --as=jane
kubectl auth can-i --list --as=system:serviceaccount:team:builder -n team

# inspect bindings and workload identity
kubectl get rolebindings,clusterrolebindings -A
kubectl get serviceaccount -A
kubectl get pod app -o jsonpath='{.spec.serviceAccountName}'</pre>
        <div class="gotcha"><span class="gotcha-label">binding determines scope</span>A ClusterRole can be bound with a RoleBinding to grant its permissions only inside one namespace. A ClusterRoleBinding makes the grant cluster-wide.</div>

        <h2 id="workload-security">4. Pod, Secret and network security</h2>
        <h3 id="pod-security">Pod Security Standards</h3>
        <table><thead><tr><th>Profile</th><th>Intent</th></tr></thead><tbody>
          <tr><td><strong>Privileged</strong></td><td>Unrestricted; appropriate only for deliberately trusted system workloads</td></tr>
          <tr><td><strong>Baseline</strong></td><td>Blocks known privilege escalation while remaining broadly compatible</td></tr>
          <tr><td><strong>Restricted</strong></td><td>Strong hardening: non-root, seccomp, capability and volume constraints</td></tr>
        </tbody></table>
        <p>Pod Security Admission applies profiles by namespace labels in <code>enforce</code>, <code>audit</code> and <code>warn</code> modes. Roll out with warn/audit first, fix workloads, then enforce.</p>
        <pre data-lang="yaml">securityContext:
  runAsNonRoot: true
  seccompProfile: { type: RuntimeDefault }
containers:
- name: app
  securityContext:
    allowPrivilegeEscalation: false
    readOnlyRootFilesystem: true
    capabilities: { drop: ["ALL"] }</pre>
        <h3 id="secrets">Secrets</h3>
        <ul>
          <li>Base64 is encoding, not encryption. Enable encryption at rest and protect encryption keys.</li>
          <li>Prefer workload identity or short-lived external secret delivery over long-lived static keys.</li>
          <li>Restrict <code>get/list/watch</code> on Secrets; list can expose every Secret in scope.</li>
          <li>Do not log Secret values, bake them into images or commit them to Git.</li>
        </ul>
        <h3 id="network-policy">Isolation and NetworkPolicy</h3>
        <p>NetworkPolicy is allow-list policy for selected Pods. A Pod becomes isolated for a direction when a policy selects it for that direction. Policies are additive: traffic allowed by any applicable rule remains allowed. Enforcement requires a capable CNI.</p>
        <pre data-lang="yaml">apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny, namespace: team }
spec:
  podSelector: {}
  policyTypes: [Ingress, Egress]</pre>

        <h2 id="threat-model">5. Kubernetes threat model</h2>
        <table><thead><tr><th>Threat</th><th>Example path</th><th>Primary defenses</th></tr></thead><tbody>
          <tr><td>Persistence</td><td>Malicious DaemonSet, webhook or stolen credential</td><td>Admission, RBAC, audit, immutable delivery</td></tr>
          <tr><td>Denial of service</td><td>Resource exhaustion or API flooding</td><td>Quotas, limits, priority, rate controls, capacity</td></tr>
          <tr><td>Malicious code execution</td><td>Compromised image or application RCE</td><td>Signed/scanned images, restricted runtime, segmentation</td></tr>
          <tr><td>Attacker on network</td><td>Sniffing, lateral movement, spoofed service</td><td>TLS/mTLS, NetworkPolicy, identity-aware service mesh</td></tr>
          <tr><td>Sensitive-data access</td><td>Reading Secrets, volumes or etcd</td><td>RBAC, encryption, key management, audit</td></tr>
          <tr><td>Privilege escalation</td><td>Host mount, privileged Pod, dangerous capability</td><td>Restricted PSS, seccomp/AppArmor, policy admission</td></tr>
        </tbody></table>
        <p>A useful threat model maps <strong>trust boundaries and data flows</strong>: user→API server, API server→etcd, scheduler/controller→API, kubelet→runtime, Pod→Service, Pod→node kernel, cluster→cloud APIs, CI→registry→admission→runtime.</p>

        <h2 id="supply-chain">6. Supply-chain and image security</h2>
        <p>The software supply chain spans source, dependencies, build system, artifact, registry, deployment policy and runtime. Controls must preserve provenance across the chain.</p>
        <ol>
          <li><strong>Source:</strong> protected branches, reviews, signed commits where appropriate, secret scanning.</li>
          <li><strong>Dependencies:</strong> lockfiles, SCA, trusted sources and timely patching.</li>
          <li><strong>Build:</strong> isolated, reproducible, least-privilege CI with protected credentials.</li>
          <li><strong>Artifact:</strong> minimal non-root image, SBOM, vulnerability scan and signature/attestation.</li>
          <li><strong>Registry:</strong> authentication, immutable tags or digest pinning, retention and audit.</li>
          <li><strong>Admission:</strong> require trusted provenance, allowed registries and acceptable policy.</li>
          <li><strong>Runtime:</strong> detect drift and behavior that build-time scanning cannot see.</li>
        </ol>
        <div class="gotcha"><span class="gotcha-label">scan is not trust</span>A vulnerability scan finds known issues in inspected content. A signature proves who signed an artifact and protects integrity. An attestation states a verifiable claim such as provenance. They solve different problems.</div>

        <h2 id="platform">7. Platform security: PKI, mesh and observability</h2>
        <ul>
          <li><strong>PKI/TLS</strong> authenticates endpoints and protects data in transit. Rotate certificates and protect private keys.</li>
          <li><strong>Service mesh</strong> can provide workload identity, mTLS, authorization and traffic telemetry; it does not fix insecure application logic.</li>
          <li><strong>Admission policy</strong> prevents unsafe configuration before it enters the cluster.</li>
          <li><strong>Observability</strong> combines Kubernetes audit, workload logs, network flow data, metrics and runtime events.</li>
          <li><strong>Image repository controls</strong> limit who can push/pull, preserve immutability and record provenance.</li>
        </ul>

        <h2 id="compliance">8. Compliance and security frameworks</h2>
        <table><thead><tr><th>Framework/control</th><th>Purpose</th></tr></thead><tbody>
          <tr><td><strong>CIS Benchmarks</strong></td><td>Prescriptive secure-configuration checks for Kubernetes and hosts</td></tr>
          <tr><td><strong>NIST Cybersecurity Framework</strong></td><td>Organizes outcomes across Govern, Identify, Protect, Detect, Respond, Recover</td></tr>
          <tr><td><strong>MITRE ATT&amp;CK</strong></td><td>Models adversary tactics and techniques; includes container-relevant behavior</td></tr>
          <tr><td><strong>STRIDE</strong></td><td>Threat modeling: spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege</td></tr>
          <tr><td><strong>SLSA</strong></td><td>Supply-chain integrity and build provenance framework</td></tr>
          <tr><td><strong>SBOM</strong></td><td>Inventory of software components; evidence input, not a security verdict</td></tr>
        </tbody></table>
        <p>Compliance asks whether required controls are defined and evidenced. Security asks whether risk is actually reduced. Automate policy and evidence collection, but keep human ownership of exceptions, risk decisions and incident response.</p>

        <h2 id="control-types">9. Control types, zero trust and incident readiness</h2>
        <table><thead><tr><th>Control type</th><th>Purpose</th><th>Kubernetes example</th></tr></thead><tbody>
          <tr><td><strong>Preventive</strong></td><td>Stop an unsafe action</td><td>Admission rejects privileged Pod; RBAC denies Secret read</td></tr>
          <tr><td><strong>Detective</strong></td><td>Reveal suspicious or non-compliant behavior</td><td>Audit log, runtime alert, drift scan</td></tr>
          <tr><td><strong>Corrective</strong></td><td>Remove or repair a discovered weakness</td><td>Rotate token, patch image, remove binding</td></tr>
          <tr><td><strong>Recovery</strong></td><td>Restore trusted service and data</td><td>Tested etcd backup, redeploy from signed artifacts</td></tr>
          <tr><td><strong>Compensating</strong></td><td>Reduce risk when the preferred control is infeasible</td><td>Isolate a legacy workload while remediation is pending</td></tr>
        </tbody></table>
        <p><strong>Zero trust</strong> means no identity or network location is trusted implicitly. Authenticate explicitly, authorize narrowly, encrypt where required, continuously evaluate signals and assume breach. In Kubernetes that becomes workload identity, short-lived credentials, default-deny segmentation, policy at admission, and runtime observation.</p>
        <p>Incident readiness must exist before compromise. Know where audit and workload logs live, synchronize time, protect log integrity, define credential-rotation paths, keep tested backups, and preserve evidence. Recovery from an untrusted image or node should use known-good immutable artifacts—not manual repair inside the compromised container.</p>

        <h2 id="isolation-depth">10. Isolation strength and tenant boundaries</h2>
        <p>Isolation is a spectrum. Choose strength based on trust:</p>
        <ol>
          <li><strong>Process/container controls:</strong> namespaces, cgroups, seccomp, AppArmor, capabilities.</li>
          <li><strong>Pod and namespace controls:</strong> PSS/PSA, quotas, RBAC, NetworkPolicy and separate identities.</li>
          <li><strong>Sandboxed runtime:</strong> adds a stronger userspace/kernel boundary for less-trusted workloads.</li>
          <li><strong>Virtual machine or separate cluster/account:</strong> stronger boundary for hostile multi-tenancy or regulatory separation.</li>
        </ol>
        <p>A namespace is useful administrative scope but shares the control plane, nodes and often cluster-scoped resources. Hard multi-tenancy requires combined identity, network, admission, resource, data and runtime boundaries—and sometimes separate clusters.</p>

        <h2 id="questions">11. Rapid scenario checks</h2>
        <ul>
          <li><strong>Need to stop privileged Pods before persistence?</strong> Admission policy / Pod Security Admission.</li>
          <li><strong>Need to know whether jane may read Secrets?</strong> <code>kubectl auth can-i</code> / authorization review.</li>
          <li><strong>Need to prove an image came from trusted CI?</strong> Verify signature and provenance attestation.</li>
          <li><strong>Need to find who deleted a Secret?</strong> Kubernetes audit logs.</li>
          <li><strong>Need to limit a compromised frontend's lateral movement?</strong> NetworkPolicy plus least-privilege identity.</li>
          <li><strong>Need to harden a node process?</strong> Host controls such as least privilege, AppArmor/seccomp and reduced services—not an application ConfigMap.</li>
          <li><strong>Need confidentiality between workloads?</strong> TLS/mTLS; NetworkPolicy alone controls reachability, not encryption.</li>
        </ul>

        <h2 id="mistakes">12. Common exam traps and study order</h2>
        <ul>
          <li>Confusing authentication, authorization and admission.</li>
          <li>Treating namespaces as sufficient tenant isolation.</li>
          <li>Calling base64-encoded Secrets encrypted.</li>
          <li>Assuming a NetworkPolicy encrypts traffic or works without CNI enforcement.</li>
          <li>Equating image scanning with signature verification.</li>
          <li>Using a detect control when the question asks to prevent admission.</li>
          <li>Choosing one magic security product instead of layered controls at different boundaries.</li>
        </ul>
        <p>Study in this order: <strong>request pipeline and RBAC → component trust boundaries → Pod/Secret/network security → threat scenarios → supply chain → PKI/mesh/observability → compliance frameworks</strong>. For every control, be able to name what it prevents, what it detects, and what it cannot do.</p>`
};

const ckad = {
  code: "CKAD",
  examType: "2-hour performance-based",
  title: "CKAD — The Certified Kubernetes Application Developer Cheatsheet.",
  description: "Current CKAD v1.35 hands-on exam guide covering application design and build, deployments, observability, configuration and security, Services and networking, kubectl speed, troubleshooting, and common exam mistakes.",
  tags: ["kubernetes", "ckad", "application-delivery", "kubectl", "exam-prep"],
  official: "https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/",
  body: String.raw`
        <blockquote>
          <strong>CKAD</strong> is a <strong>2-hour, performance-based</strong> exam on <strong>Kubernetes v1.35</strong>. You solve application tasks in a terminal: no cluster installation, but relentless resource creation, editing, validation and debugging. Current domains: <strong>Application Design &amp; Build 20% · Deployment 20% · Observability &amp; Maintenance 15% · Environment, Configuration &amp; Security 25% · Services &amp; Networking 20%</strong>. Generate YAML, edit only what the task needs, apply, and verify.
        </blockquote>

        <h2 id="exam-setup">0. First-minute setup and the task loop</h2>
        <pre data-lang="bash">alias k=kubectl
export do="--dry-run=client -o yaml"
source &lt;(kubectl completion bash)
complete -o default -F __start_kubectl k

# every task: context → namespace → generate/edit → apply → verify
k config use-context &lt;named-context&gt;
k config set-context --current --namespace=&lt;namespace&gt;
k get ns

# useful editor defaults
cat &lt;&lt;'EOF' &gt;&gt; ~/.vimrc
set expandtab tabstop=2 shiftwidth=2 number autoindent
EOF</pre>
        <div class="gotcha"><span class="gotcha-label">verify the contract</span>Do not stop when <code>kubectl apply</code> succeeds. Check the exact requested name, namespace, image, labels, ports, rollout, readiness and output file. API acceptance is not task completion.</div>

        <h2 id="speed">1. kubectl generation and fast editing</h2>
        <pre data-lang="bash">k run app --image=nginx:1.27 $do &gt; pod.yaml
k create deploy web --image=nginx:1.27 --replicas=3 $do &gt; deploy.yaml
k create job report --image=busybox:1.36 $do -- sh -c 'date; echo done' &gt; job.yaml
k create cronjob cleanup --image=busybox:1.36 --schedule='*/5 * * * *' \
  $do -- sh -c 'rm -rf /tmp/cache/*' &gt; cron.yaml
k create cm app-config --from-literal=MODE=prod $do &gt; cm.yaml
k create secret generic db --from-literal=password='change-me' $do &gt; secret.yaml
k create service clusterip web --tcp=80:8080 $do &gt; svc.yaml

k explain pod.spec.containers --recursive
k apply -f deploy.yaml
k get deploy,pods,svc -o wide
k diff -f deploy.yaml</pre>
        <p>Use imperative generation as a schema-safe starting point. When a field is difficult to generate—probes, affinity, security context, volumes—use <code>kubectl explain</code> or an allowed documentation example, then adapt it.</p>

        <h2 id="design-build">2. Application Design and Build (20%)</h2>
        <h3 id="workload-choice">Choose the right workload</h3>
        <table><thead><tr><th>Requirement</th><th>Resource</th><th>Key behavior</th></tr></thead><tbody>
          <tr><td>Stateless long-running replicas</td><td>Deployment</td><td>Rolling updates and rollback</td></tr>
          <tr><td>One Pod on each node</td><td>DaemonSet</td><td>Node-local agents</td></tr>
          <tr><td>Finite batch execution</td><td>Job</td><td>Completion, retries, parallelism</td></tr>
          <tr><td>Scheduled batch execution</td><td>CronJob</td><td>Creates Jobs on schedule</td></tr>
          <tr><td>Stable identity/storage</td><td>StatefulSet</td><td>Ordered Pods and volume claims</td></tr>
        </tbody></table>

        <h3 id="images">Container images and commands</h3>
        <pre data-lang="dockerfile">FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
USER 10001
ENTRYPOINT ["python", "app.py"]
CMD ["--port", "8080"]</pre>
        <p>In a PodSpec, <code>command</code> overrides image ENTRYPOINT and <code>args</code> overrides CMD. Prefer exec-form arrays. Pin a tag or digest required by the task; changing a Deployment's Pod template triggers a rollout.</p>

        <h3 id="multi-container">Multi-container patterns</h3>
        <table><thead><tr><th>Pattern</th><th>Use</th><th>Lifecycle</th></tr></thead><tbody>
          <tr><td><strong>Init</strong></td><td>Precondition, migration, file generation</td><td>Runs to completion before app containers, sequentially</td></tr>
          <tr><td><strong>Sidecar</strong></td><td>Proxy, log/telemetry helper, file synchronization</td><td>Runs alongside the app; shares Pod network/volumes</td></tr>
          <tr><td><strong>Adapter</strong></td><td>Normalizes app output for another consumer</td><td>Companion container transforms shared data</td></tr>
          <tr><td><strong>Ambassador</strong></td><td>Local proxy to an external dependency</td><td>App calls localhost; proxy owns remote connection logic</td></tr>
        </tbody></table>
        <pre data-lang="yaml">spec:
  initContainers:
  - name: prepare
    image: busybox:1.36
    command: ["sh", "-c", "echo ready &gt; /work/status"]
    volumeMounts: [{ name: work, mountPath: /work }]
  containers:
  - name: app
    image: nginx:1.27
    volumeMounts: [{ name: work, mountPath: /usr/share/nginx/html }]
  - name: sidecar
    image: busybox:1.36
    command: ["sh", "-c", "tail -F /work/status"]
    volumeMounts: [{ name: work, mountPath: /work }]
  volumes: [{ name: work, emptyDir: {} }]</pre>

        <h3 id="volumes">Ephemeral and persistent volumes</h3>
        <ul>
          <li><code>emptyDir</code>: created for the Pod and removed with it; containers in the Pod share it.</li>
          <li><code>configMap</code>/<code>secret</code>: project configuration as files.</li>
          <li><code>persistentVolumeClaim</code>: attach durable storage through a PVC.</li>
          <li><code>projected</code>: combine several sources such as Secret, ConfigMap and service-account token.</li>
        </ul>

        <h2 id="deployment">3. Application Deployment (20%)</h2>
        <h3 id="rollouts">Deployments, rollouts and rollback</h3>
        <pre data-lang="bash">k create deploy web --image=nginx:1.26 --replicas=4
k set image deploy/web nginx=nginx:1.27 --record=false
k rollout status deploy/web
k rollout history deploy/web
k rollout undo deploy/web
k scale deploy/web --replicas=6
k patch deploy web -p '{"spec":{"strategy":{"rollingUpdate":{"maxSurge":1,"maxUnavailable":0}}}}'</pre>
        <p><code>maxSurge</code> allows extra Pods during a rolling update; <code>maxUnavailable</code> limits unavailable desired replicas. A rollout stalls when new Pods never become Ready.</p>

        <h3 id="strategies">Blue/green and canary with primitives</h3>
        <ul>
          <li><strong>Blue/green:</strong> two Deployments with different version labels; switch a Service selector after green is verified.</li>
          <li><strong>Canary:</strong> stable and canary Deployments share the Service's selector; replica ratio approximates traffic percentage.</li>
          <li><strong>Rolling:</strong> one Deployment progressively replaces its ReplicaSet.</li>
        </ul>
        <pre data-lang="bash"># blue/green cutover: Service changes version selector
k patch svc web -p '{"spec":{"selector":{"app":"web","version":"green"}}}'
k get endpointslices -l kubernetes.io/service-name=web</pre>

        <h3 id="helm-kustomize">Helm and Kustomize</h3>
        <pre data-lang="bash">helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm search repo nginx
helm install edge bitnami/nginx -n app --create-namespace --set replicaCount=2
helm list -A
helm upgrade edge bitnami/nginx -n app --set replicaCount=3
helm rollback edge 1 -n app
helm uninstall edge -n app

k kustomize overlays/prod              # render and inspect
k apply -k overlays/prod                # apply the overlay</pre>
        <div class="gotcha"><span class="gotcha-label">render before apply</span>With Helm or Kustomize, inspect the rendered objects and target namespace. A successful package install can still create the wrong replicas, image, labels or Service values.</div>

        <h2 id="observability">4. Observability and Maintenance (15%)</h2>
        <h3 id="probes">Startup, readiness and liveness</h3>
        <table><thead><tr><th>Probe</th><th>Failure effect</th><th>Question it answers</th></tr></thead><tbody>
          <tr><td><strong>startup</strong></td><td>Blocks liveness/readiness until success; restart on repeated failure</td><td>Has the slow app finished starting?</td></tr>
          <tr><td><strong>readiness</strong></td><td>Removes Pod from Service endpoints</td><td>Should this Pod receive traffic now?</td></tr>
          <tr><td><strong>liveness</strong></td><td>Restarts the container</td><td>Is the process stuck and unable to recover?</td></tr>
        </tbody></table>
        <pre data-lang="yaml">startupProbe:
  httpGet: { path: /health/startup, port: 8080 }
  failureThreshold: 30
  periodSeconds: 2
readinessProbe:
  httpGet: { path: /health/ready, port: 8080 }
  periodSeconds: 5
livenessProbe:
  httpGet: { path: /health/live, port: 8080 }
  periodSeconds: 10</pre>
        <div class="gotcha"><span class="gotcha-label">readiness is traffic, liveness is restart</span>Do not use liveness to wait for a slow startup—use a startup probe. An aggressive liveness check creates a restart loop and makes recovery worse.</div>

        <h3 id="debugging">Logs, events and ephemeral debugging</h3>
        <pre data-lang="bash">k describe pod app
k logs app -c api
k logs app -c api --previous
k logs deploy/web --all-containers --tail=100
k get events --sort-by=.lastTimestamp
k exec -it app -c api -- sh
k debug -it app --image=busybox:1.36 --target=api
k top pods -A
k get pod app -o jsonpath='{.status.containerStatuses[*].state}'</pre>
        <p>Debug from outside in: object status → events → logs → effective spec → in-container checks → Service endpoints and policy. For API removals, use <code>kubectl explain</code>, current documentation and tools such as <code>kubectl convert</code> if installed; do not keep deprecated versions merely because old YAML still looks familiar.</p>

        <h2 id="configuration-security">5. Environment, Configuration and Security (25%)</h2>
        <h3 id="configmaps-secrets">ConfigMaps and Secrets</h3>
        <pre data-lang="yaml">envFrom:
- configMapRef: { name: app-config }
env:
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef: { name: db, key: password }
volumeMounts:
- { name: settings, mountPath: /etc/app, readOnly: true }
volumes:
- name: settings
  configMap:
    name: app-config
    items: [{ key: config.yaml, path: config.yaml }]</pre>
        <p>Environment values are captured when the container starts. Mounted ConfigMap/Secret volumes can update eventually, but the application must reload them. A <code>subPath</code> mount does not receive those updates.</p>

        <h3 id="resources">Resources, quotas and limits</h3>
        <pre data-lang="yaml">resources:
  requests: { cpu: 100m, memory: 128Mi }
  limits: { cpu: 500m, memory: 256Mi }</pre>
        <ul>
          <li>Scheduler places using requests. CPU limit causes throttling; memory limit can cause OOM termination.</li>
          <li><strong>ResourceQuota</strong> caps aggregate namespace consumption/object counts.</li>
          <li><strong>LimitRange</strong> supplies or constrains per-object defaults/min/max.</li>
        </ul>

        <h3 id="serviceaccounts">ServiceAccounts, RBAC and admission</h3>
        <pre data-lang="bash">k create sa reporter -n team
k create role pod-reader --verb=get,list,watch --resource=pods -n team
k create rolebinding reporter-read --role=pod-reader \
  --serviceaccount=team:reporter -n team
k auth can-i list pods --as=system:serviceaccount:team:reporter -n team</pre>
        <p>Authentication establishes identity, authorization evaluates permission, and admission validates/mutates the requested object. A ServiceAccount is a workload identity. Set <code>automountServiceAccountToken: false</code> when the Pod does not need API credentials.</p>

        <h3 id="security-context">Application security context</h3>
        <pre data-lang="yaml">spec:
  securityContext:
    runAsNonRoot: true
    seccompProfile: { type: RuntimeDefault }
  containers:
  - name: app
    image: example/app:1.4
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities: { drop: ["ALL"] }</pre>
        <p>Pod-level context supplies defaults; container-level fields can be more specific. Dropping capabilities, disallowing privilege escalation and running as non-root are different controls—apply the exact combination requested.</p>

        <h3 id="crd">CRDs and Operators</h3>
        <pre data-lang="bash">k get crd
k api-resources | grep -i &lt;kind&gt;
k explain &lt;resource&gt;.spec
k get &lt;custom-resource&gt; -A
k describe &lt;custom-resource&gt; &lt;name&gt;</pre>
        <p>A CRD extends the API with a new resource kind. An Operator pairs custom resources with a controller that reconciles domain-specific lifecycle. Discover the actual API group and schema before writing a custom resource.</p>

        <h2 id="networking">6. Services and Networking (20%)</h2>
        <h3 id="services">Services and endpoint troubleshooting</h3>
        <pre data-lang="bash">k expose deploy web --port=80 --target-port=8080
k get svc web -o yaml
k get endpointslices -l kubernetes.io/service-name=web
k get pods --show-labels
k run curl --image=curlimages/curl --rm -it --restart=Never -- \
  curl -sS http://web:80/health</pre>
        <p><code>port</code> is the Service port; <code>targetPort</code> is the backend Pod port. The Service selector must match Pod labels, and readiness must pass before endpoints receive traffic.</p>

        <h3 id="ingress">Ingress</h3>
        <pre data-lang="yaml">apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: web }
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service: { name: web, port: { number: 80 } }</pre>
        <p>An Ingress resource needs an installed Ingress controller. Check class, host/path, Service name and Service port—not the container port.</p>

        <h3 id="network-policy">NetworkPolicy</h3>
        <pre data-lang="yaml">apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: api-from-web, namespace: team }
spec:
  podSelector: { matchLabels: { app: api } }
  policyTypes: [Ingress]
  ingress:
  - from:
    - podSelector: { matchLabels: { app: web } }
    ports: [{ protocol: TCP, port: 8080 }]</pre>
        <div class="gotcha"><span class="gotcha-label">namespace scope matters</span>A <code>podSelector</code> in a peer selects Pods in the policy's namespace unless combined with a <code>namespaceSelector</code>. Policies are additive and require CNI enforcement.</div>

        <h2 id="high-yield-patterns">7. High-yield manifest patterns</h2>
        <h3 id="job-controls">Jobs and CronJobs</h3>
        <pre data-lang="yaml">apiVersion: batch/v1
kind: Job
metadata: { name: report }
spec:
  completions: 6
  parallelism: 2
  backoffLimit: 3
  activeDeadlineSeconds: 300
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: report
        image: example/report:1.2</pre>
        <p><code>completions</code> is successful work items; <code>parallelism</code> is concurrent Pods; <code>backoffLimit</code> bounds retries. CronJobs add <code>schedule</code>, <code>concurrencyPolicy</code>, history limits and <code>startingDeadlineSeconds</code>. To test a CronJob immediately, create a one-off Job from it.</p>
        <pre data-lang="bash">k create job test-run --from=cronjob/cleanup
k get jobs,pods
k logs job/test-run</pre>

        <h3 id="availability">Availability, autoscaling and disruption</h3>
        <pre data-lang="bash">k autoscale deploy web --min=2 --max=10 --cpu-percent=70
k get hpa web
k top pods -l app=web</pre>
        <pre data-lang="yaml">apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: web-pdb }
spec:
  minAvailable: 2
  selector: { matchLabels: { app: web } }</pre>
        <p>An HPA changes replica count from metrics; it needs meaningful requests and a metrics source. A PodDisruptionBudget limits <strong>voluntary</strong> disruptions such as drain, not crashes or node failure. <code>minAvailable</code> and <code>maxUnavailable</code> are alternative ways to express the budget.</p>

        <h3 id="pvc-pattern">PVC consumption</h3>
        <pre data-lang="yaml">apiVersion: v1
kind: PersistentVolumeClaim
metadata: { name: data }
spec:
  accessModes: [ReadWriteOnce]
  resources: { requests: { storage: 2Gi } }
---
spec:
  containers:
  - name: app
    volumeMounts: [{ name: data, mountPath: /var/lib/app }]
  volumes:
  - name: data
    persistentVolumeClaim: { claimName: data }</pre>
        <p>If a Pod is Pending, inspect the PVC too. StorageClass, access mode, requested size, topology and provisioning events must be satisfiable.</p>

        <h3 id="jsonpath">Output, JSONPath and patching</h3>
        <pre data-lang="bash">k get pods -o custom-columns='NAME:.metadata.name,NODE:.spec.nodeName,IMAGE:.spec.containers[*].image'
k get pods --sort-by=.metadata.creationTimestamp
k get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\n"}{end}'
k patch deploy web --type=merge -p '{"spec":{"replicas":4}}'
k label pod app tier=frontend --overwrite
k annotate deploy web owner=platform --overwrite</pre>
        <p>When the task asks you to write output to a file, redirect the exact requested format and inspect the file. JSONPath quoting mistakes are common; test on the terminal before redirecting.</p>

        <h2 id="troubleshooting">8. Status-to-action playbook</h2>
        <table><thead><tr><th>Symptom</th><th>Check first</th><th>Likely fix</th></tr></thead><tbody>
          <tr><td>Pending</td><td>Events, requests, taints, affinity, PVC</td><td>Make placement/storage constraints satisfiable</td></tr>
          <tr><td>ImagePullBackOff</td><td>Image spelling/tag and pull secret</td><td>Correct image or registry credentials</td></tr>
          <tr><td>CrashLoopBackOff</td><td><code>logs --previous</code>, command, config, probes</td><td>Repair process input or probe</td></tr>
          <tr><td>Running but not Ready</td><td>Readiness path/port and app health</td><td>Fix readiness contract or dependency</td></tr>
          <tr><td>Service unreachable</td><td>EndpointSlice, labels, readiness, targetPort</td><td>Repair selector/port/policy</td></tr>
          <tr><td>Rollout stuck</td><td>New ReplicaSet Pods and progress events</td><td>Fix new template or undo rollout</td></tr>
        </tbody></table>

        <h2 id="mistakes">9. Common mistakes and final study order</h2>
        <ul>
          <li>Working in the wrong context or namespace.</li>
          <li>Creating a Pod when the task asks for a Deployment, Job or CronJob.</li>
          <li>Changing labels without updating selectors.</li>
          <li>Confusing container port, Service port and targetPort.</li>
          <li>Using liveness where readiness or startup is required.</li>
          <li>Forgetting the container name for logs/exec in multi-container Pods.</li>
          <li>Expecting a ConfigMap environment variable to hot-reload.</li>
          <li>Writing a NetworkPolicy peer in the wrong namespace scope.</li>
          <li>Applying Helm/Kustomize output without inspecting the render.</li>
          <li>Leaving the object accepted but functionally broken.</li>
        </ul>
        <p>Practice order: <strong>imperative generation → workloads and multi-container Pods → rollouts and deployment strategies → probes/logs/debug → configuration/resources/security → Services/Ingress/NetworkPolicy → timed mixed labs</strong>. Aim to complete ordinary object tasks in 2–4 minutes so debugging tasks can consume the time they deserve.</p>`
};

const cks = {
  code: "CKS",
  examType: "2-hour performance-based",
  title: "CKS — The Certified Kubernetes Security Specialist Cheatsheet.",
  description: "Current CKS v1.35 hands-on exam guide covering cluster setup and hardening, system hardening, microservice vulnerabilities, supply-chain security, audit and runtime detection, security commands, verification, and common exam mistakes.",
  tags: ["kubernetes", "cks", "security", "supply-chain", "exam-prep"],
  official: "https://training.linuxfoundation.org/certification/certified-kubernetes-security-specialist/",
  body: String.raw`
        <blockquote>
          <strong>CKS</strong> is the terminal-speed security finish line: a <strong>2-hour, performance-based</strong> exam on <strong>Kubernetes v1.35</strong>. You must have passed <strong>CKA</strong> before attempting it. Current domains: <strong>Cluster Setup 15% · Cluster Hardening 15% · System Hardening 10% · Minimize Microservice Vulnerabilities 20% · Supply Chain Security 20% · Monitoring, Logging &amp; Runtime Security 20%</strong>. Make the smallest safe change, preserve availability, and prove the control works.
        </blockquote>

        <h2 id="exam-setup">0. First-minute setup and evidence loop</h2>
        <pre data-lang="bash">alias k=kubectl
export do="--dry-run=client -o yaml"
source &lt;(kubectl completion bash)
complete -o default -F __start_kubectl k

# every task
k config use-context &lt;named-context&gt;
k config set-context --current --namespace=&lt;namespace&gt;
k get nodes

# preserve before editing host/control-plane files
sudo cp /etc/kubernetes/manifests/kube-apiserver.yaml \
  /etc/kubernetes/manifests/kube-apiserver.yaml.bak-outside-manifest-dir</pre>
        <div class="gotcha"><span class="gotcha-label">backups outside static-pod directory</span>Any valid manifest left in <code>/etc/kubernetes/manifests</code> can be read by the kubelet as another static Pod. Put backups elsewhere, change one flag at a time, and watch the component return before continuing.</div>
        <p>For each task: <strong>identify boundary → inspect current state → preserve rollback → change → wait → verify positive behavior → verify denied behavior</strong>. A policy that exists but selects nothing is not a security control.</p>

        <h2 id="cluster-setup">1. Cluster Setup (15%)</h2>
        <h3 id="network-policy">Network security policies</h3>
        <pre data-lang="yaml">apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: api-ingress, namespace: team }
spec:
  podSelector: { matchLabels: { app: api } }
  policyTypes: [Ingress]
  ingress:
  - from:
    - namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: ingress } }
      podSelector: { matchLabels: { app: gateway } }
    ports: [{ protocol: TCP, port: 8443 }]</pre>
        <pre data-lang="bash"># verify labels and actual reachability from allowed and denied sources
k get pods -n team --show-labels
k get ns --show-labels
k describe netpol api-ingress -n team
k exec -n ingress deploy/gateway -- wget -qO- --timeout=2 https://api.team:8443
k run denied -n default --image=busybox:1.36 --rm -it --restart=Never -- \
  wget -qO- --timeout=2 http://api.team:8443</pre>
        <div class="gotcha"><span class="gotcha-label">and vs or</span><code>namespaceSelector</code> and <code>podSelector</code> in the same <code>from</code> item are ANDed. Separate list items are ORed. Indentation changes the security meaning.</div>

        <h3 id="cis">CIS benchmark review</h3>
        <pre data-lang="bash"># use the binary/config supplied by the exam environment
kube-bench run --targets master
kube-bench run --targets node

# confirm the effective configuration, not only flags
ps -ef | grep kube-apiserver
sudo grep -nE 'anonymous-auth|authorization-mode|read-only-port' \
  /var/lib/kubelet/config.yaml /etc/kubernetes/manifests/*.yaml</pre>
        <p>CIS output is an assessment, not an automatic mandate. Fix the named control in the named component and validate availability. Some managed or lab configurations have justified exceptions.</p>

        <h3 id="tls-ingress">Ingress TLS</h3>
        <pre data-lang="bash">k create secret tls web-tls --cert=tls.crt --key=tls.key -n app
</pre>
        <pre data-lang="yaml">spec:
  tls:
  - hosts: [app.example.com]
    secretName: web-tls
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service: { name: web, port: { number: 80 } }</pre>
        <p>Certificate hostnames must match the request host, the Secret must be in the Ingress namespace, and a controller must implement the Ingress.</p>

        <h3 id="metadata-binaries">Node metadata, endpoints and binaries</h3>
        <ul>
          <li>Prevent Pods from reaching cloud metadata unless explicitly needed; prefer workload identity to node-wide credentials.</li>
          <li>Restrict kubelet, etcd, runtime sockets and control-plane ports by network and authentication.</li>
          <li>Download binaries from the official channel and verify checksum/signature before execution.</li>
        </ul>
        <pre data-lang="bash">sha256sum kubectl
echo '&lt;expected-sha256&gt;  kubectl' | sha256sum --check
openssl x509 -in tls.crt -noout -subject -issuer -dates -ext subjectAltName</pre>

        <h2 id="cluster-hardening">2. Cluster Hardening (15%)</h2>
        <h3 id="rbac">Least-privilege RBAC</h3>
        <pre data-lang="bash">k auth can-i --list --as=jane -n team
k auth can-i get secrets --as=system:serviceaccount:team:builder -n team
k get rolebindings,clusterrolebindings -A -o wide

k create role deploy-reader --verb=get,list,watch --resource=deployments.apps -n team
k create rolebinding jane-deploy-read --role=deploy-reader --user=jane -n team
k auth can-i list deployments --as=jane -n team
k auth can-i delete deployments --as=jane -n team</pre>
        <ul>
          <li>Avoid wildcards in verbs/resources and avoid <code>cluster-admin</code> for routine workloads.</li>
          <li>Permissions to create Pods can indirectly expose mounted Secrets, service-account tokens, host paths or privileged execution.</li>
          <li>Permissions to create/update Roles or bindings can be privilege escalation.</li>
          <li>Test allowed and forbidden operations with the exact identity and namespace.</li>
        </ul>

        <h3 id="service-accounts">Service-account hygiene</h3>
        <pre data-lang="yaml">apiVersion: v1
kind: Pod
metadata: { name: worker }
spec:
  serviceAccountName: worker
  automountServiceAccountToken: false
  containers:
  - { name: worker, image: example/worker:1.2 }</pre>
        <p>Use dedicated service accounts, minimal RoleBindings and projected short-lived tokens. Disable automount when the process does not call the Kubernetes API.</p>

        <h3 id="api-access">Restrict API access and upgrade</h3>
        <ul>
          <li>Disable anonymous authentication where required and use secure authorization modes.</li>
          <li>Expose the API on trusted networks; use TLS and controlled bastion/VPN paths.</li>
          <li>Protect admin kubeconfigs and rotate compromised credentials.</li>
          <li>Upgrade supported Kubernetes releases to receive security fixes; drain and verify nodes as in CKA.</li>
        </ul>
        <pre data-lang="bash">sudo grep -n -- '--anonymous-auth\|--authorization-mode' \
  /etc/kubernetes/manifests/kube-apiserver.yaml
k get --raw='/readyz?verbose'
k version
k get nodes -o custom-columns=NAME:.metadata.name,KUBELET:.status.nodeInfo.kubeletVersion</pre>

        <h2 id="system-hardening">3. System Hardening (10%)</h2>
        <p>Reduce the host attack surface: minimal OS/packages, patched kernel/runtime, no unused network services, protected runtime sockets, least-privilege users, strong file permissions and host-level mandatory access control.</p>
        <pre data-lang="bash"># inspect listening services and running units
sudo ss -lntup
sudo systemctl --type=service --state=running
sudo find /etc/kubernetes -type f -maxdepth 3 -ls

# AppArmor availability and profiles
sudo aa-status

# seccomp is expressed in the Pod security context
k get pod app -o jsonpath='{.spec.securityContext.seccompProfile.type}'</pre>
        <table><thead><tr><th>Control</th><th>What it restricts</th></tr></thead><tbody>
          <tr><td><strong>seccomp</strong></td><td>Linux system calls available to a process</td></tr>
          <tr><td><strong>AppArmor</strong></td><td>Profile-based file, capability, signal and network access</td></tr>
          <tr><td><strong>capabilities</strong></td><td>Breaks root privilege into discrete powers</td></tr>
          <tr><td><strong>runAsNonRoot</strong></td><td>Prevents UID 0 execution when enforceable</td></tr>
          <tr><td><strong>readOnlyRootFilesystem</strong></td><td>Reduces runtime filesystem mutation</td></tr>
        </tbody></table>
        <div class="gotcha"><span class="gotcha-label">layers, not substitutes</span>seccomp, AppArmor, capabilities and non-root identity constrain different attack paths. One enabled field does not make the others redundant.</div>

        <h2 id="microservices">4. Minimize Microservice Vulnerabilities (20%)</h2>
        <h3 id="restricted-pod">Restricted workload pattern</h3>
        <pre data-lang="yaml">apiVersion: v1
kind: Pod
metadata: { name: api, namespace: team }
spec:
  automountServiceAccountToken: false
  securityContext:
    runAsNonRoot: true
    seccompProfile: { type: RuntimeDefault }
  containers:
  - name: api
    image: registry.example/api@sha256:&lt;digest&gt;
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities: { drop: ["ALL"] }
    resources:
      requests: { cpu: 100m, memory: 128Mi }
      limits: { cpu: 500m, memory: 256Mi }
    volumeMounts:
    - { name: tmp, mountPath: /tmp }
  volumes:
  - { name: tmp, emptyDir: {} }</pre>
        <p>If a read-only image needs writable paths, mount narrow <code>emptyDir</code> volumes instead of making the whole root filesystem writable. Never add privilege merely to silence an application error without understanding the required access.</p>

        <h3 id="psa">Pod Security Admission</h3>
        <pre data-lang="bash"># stage with warn/audit, then enforce after remediation
k label ns team pod-security.kubernetes.io/warn=restricted \
  pod-security.kubernetes.io/warn-version=latest --overwrite
k label ns team pod-security.kubernetes.io/audit=restricted \
  pod-security.kubernetes.io/audit-version=latest --overwrite
k label ns team pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/enforce-version=latest --overwrite</pre>

        <h3 id="secrets-isolation">Secrets and isolation</h3>
        <ul>
          <li>Encrypt Secret data at rest; restrict RBAC and backup access; rotate leaked values.</li>
          <li>Use separate namespaces, identities, quotas and NetworkPolicies for tenants, but recognize namespaces alone are not hard multi-tenancy.</li>
          <li>Use sandboxed runtimes/VM isolation for stronger untrusted-workload boundaries.</li>
          <li>Use Cilium, Istio or another appropriate dataplane for workload-to-workload encryption when required; NetworkPolicy alone does not encrypt.</li>
        </ul>

        <h2 id="supply-chain">5. Supply Chain Security (20%)</h2>
        <h3 id="minimal-images">Minimize and inspect images</h3>
        <pre data-lang="dockerfile">FROM golang:1.24 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /out/app ./cmd/app

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/app /app
USER nonroot:nonroot
ENTRYPOINT ["/app"]</pre>
        <ul>
          <li>Smaller base, fewer packages and no shell/package manager reduce attack surface.</li>
          <li>Run as non-root, pin digest and rebuild from maintained bases.</li>
          <li>Do not place build credentials or secrets in layers; multi-stage builds do not erase a secret copied into an earlier published stage.</li>
        </ul>

        <h3 id="scan-sign">Scan, inventory, sign and admit</h3>
        <pre data-lang="bash"># exact commands depend on tools installed in the exam environment
trivy image --severity HIGH,CRITICAL registry.example/app:1.4
trivy config deployment.yaml
kube-linter lint deployment.yaml
kubesec scan deployment.yaml

# example Sigstore workflow when cosign is supplied
cosign verify --key cosign.pub registry.example/app@sha256:&lt;digest&gt;
cosign verify-attestation --key cosign.pub \
  --type slsaprovenance registry.example/app@sha256:&lt;digest&gt;</pre>
        <table><thead><tr><th>Evidence/control</th><th>Answers</th></tr></thead><tbody>
          <tr><td>Vulnerability scan</td><td>Does known affected software exist?</td></tr>
          <tr><td>Static manifest analysis</td><td>Does configuration violate a policy or best practice?</td></tr>
          <tr><td>SBOM</td><td>Which software components are present?</td></tr>
          <tr><td>Signature</td><td>Who signed this exact artifact; is integrity intact?</td></tr>
          <tr><td>Provenance attestation</td><td>How and where was the artifact built?</td></tr>
          <tr><td>Admission policy</td><td>May this artifact/configuration enter the cluster?</td></tr>
        </tbody></table>
        <p>Enforce trusted registries, digest pinning, signatures/attestations and policy through an admission mechanism available in the environment. Test an allowed image and a deliberately disallowed image.</p>

        <h2 id="runtime">6. Monitoring, Logging and Runtime Security (20%)</h2>
        <h3 id="audit">Kubernetes audit logging</h3>
        <pre data-lang="yaml">apiVersion: audit.k8s.io/v1
kind: Policy
rules:
- level: Metadata
  resources:
  - group: ""
    resources: ["secrets"]
- level: RequestResponse
  verbs: ["create", "update", "patch", "delete"]
- level: None
  nonResourceURLs: ["/healthz*", "/readyz*"]
- level: Metadata</pre>
        <pre data-lang="bash"># API server flags need both policy and log destination plus hostPath mounts
sudo grep -n -- '--audit-' /etc/kubernetes/manifests/kube-apiserver.yaml
sudo tail -f /var/log/kubernetes/audit/audit.log
k get --raw=/readyz</pre>
        <p>Audit levels are <strong>None, Metadata, Request, RequestResponse</strong>. Rules are evaluated in order; first match wins. Avoid logging sensitive request bodies unless the task explicitly requires it.</p>

        <h3 id="runtime-detection">Runtime detection and investigation</h3>
        <p>Behavioral detection observes what running workloads actually do: unexpected shells, package installation, writes to sensitive paths, privilege changes, suspicious network connections or access to credentials. Falco-style rules commonly match kernel/runtime events against conditions.</p>
        <pre data-lang="bash"># investigate a suspicious workload
k get pod suspicious -o yaml
k describe pod suspicious
k logs suspicious --all-containers --since=30m
k get events --field-selector involvedObject.name=suspicious
k auth can-i --list --as=system:serviceaccount:team:app -n team

# node/runtime evidence when authorized
sudo crictl ps -a
sudo crictl inspect &lt;container-id&gt;
sudo journalctl -u kubelet --since '30 min ago'</pre>
        <ol>
          <li>Preserve relevant evidence and timestamps.</li>
          <li>Scope identity, namespace, node, image digest, network and affected objects.</li>
          <li>Contain with minimal blast radius—policy, scale/isolate, credential rotation as appropriate.</li>
          <li>Remove persistence and repair the exploited control.</li>
          <li>Recover from trusted artifacts and verify monitoring catches recurrence.</li>
        </ol>

        <h3 id="immutability">Runtime immutability</h3>
        <ul>
          <li>Use read-only root filesystems with explicit writable volumes.</li>
          <li>Disallow exec/package-manager workflows for production change; rebuild and redeploy a new image.</li>
          <li>Pin images by digest and detect drift from declared state.</li>
          <li>Drop privilege and prevent hostPath/host namespaces unless explicitly required.</li>
        </ul>

        <h2 id="admission-encryption">7. Admission policy and encryption at rest</h2>
        <h3 id="admission-flow">Validate before persistence</h3>
        <p>Admission runs after authentication and authorization but before an object is stored. <strong>Mutating</strong> admission changes a request; <strong>validating</strong> admission accepts or rejects it. Policy can enforce trusted registries, digest pinning, required labels, restricted security context and prohibited host access. Failure policy matters: <code>Fail</code> preserves enforcement when a webhook is unavailable; <code>Ignore</code> favors availability but can fail open.</p>
        <pre data-lang="bash">k get validatingwebhookconfigurations,mutatingwebhookconfigurations
k get validatingadmissionpolicies,validatingadmissionpolicybindings 2&gt;/dev/null || true
k get events -A --sort-by=.lastTimestamp | tail -30

# test policy with server-side dry-run before persistence
k apply --dry-run=server -f compliant.yaml
k apply --dry-run=server -f deliberately-denied.yaml</pre>
        <div class="gotcha"><span class="gotcha-label">do not lock out the control plane</span>Scope webhooks carefully with selectors and rules, use reachable TLS endpoints, and exclude the webhook's own recovery path where appropriate. A broad failing webhook can block every matching API write.</div>

        <h3 id="secret-encryption">Encrypt Kubernetes API data at rest</h3>
        <pre data-lang="yaml">apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
- resources: [secrets]
  providers:
  - aesgcm:
      keys:
      - name: key1
        secret: &lt;base64-encoded-32-byte-key&gt;
  - identity: {}</pre>
        <p>The first provider writes new data; later providers can read existing data. The <code>identity</code> fallback supports migration from plaintext but means plaintext remains readable. Mount the configuration into the API server, add <code>--encryption-provider-config</code>, verify readiness, then rewrite existing Secrets so they are re-encrypted:</p>
        <pre data-lang="bash"># after the API server is healthy with the provider
k get secrets -A -o json | k replace -f -

# verify storage carefully from etcd: ciphertext should not expose the value
ETCDCTL_API=3 etcdctl get /registry/secrets/team/db \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key</pre>
        <p>Protect and rotate encryption keys; losing them can make data unrecoverable. Encryption at rest does not replace RBAC, TLS in transit or secret rotation.</p>

        <h3 id="runtime-rules">Runtime rule reasoning</h3>
        <pre data-lang="yaml"># conceptual Falco-style rule; use the installed tool's schema
- rule: Shell in production container
  condition: container and proc.name in (bash, sh, zsh) and k8s.ns.name = "prod"
  output: "shell in prod (user=%user.name pod=%k8s.pod.name cmd=%proc.cmdline)"
  priority: WARNING</pre>
        <p>A useful runtime rule has a narrow behavior, enough context for triage and tolerable noise. Baseline legitimate automation, exclude by stable identity rather than broad process names, and test with a controlled event. Runtime detection complements prevention because signed, scanned and admitted software can still be exploited after startup.</p>

        <h2 id="verification">8. Security verification matrix</h2>
        <table><thead><tr><th>Control</th><th>Positive test</th><th>Negative test</th></tr></thead><tbody>
          <tr><td>RBAC</td><td>Required verb succeeds as target identity</td><td>Unneeded verb returns forbidden</td></tr>
          <tr><td>NetworkPolicy</td><td>Allowed source reaches exact port</td><td>Denied source times out/fails</td></tr>
          <tr><td>Pod security</td><td>Compliant Pod admits and starts</td><td>Privileged/non-compliant Pod is rejected</td></tr>
          <tr><td>Image policy</td><td>Trusted signed digest admits</td><td>Unknown registry/signature is denied</td></tr>
          <tr><td>Audit</td><td>Relevant request produces expected event</td><td>Noise/sensitive bodies are excluded as designed</td></tr>
          <tr><td>Control plane</td><td><code>/readyz</code> and kubectl return</td><td>Anonymous/unauthorized access fails</td></tr>
        </tbody></table>

        <h2 id="mistakes">9. Common mistakes and final study order</h2>
        <ul>
          <li>Editing the wrong cluster or namespace.</li>
          <li>Leaving a static-Pod manifest backup in the manifests directory.</li>
          <li>Applying a default-deny policy before proving required DNS/egress paths.</li>
          <li>Writing a NetworkPolicy that selects no Pods because labels are wrong.</li>
          <li>Granting broad RBAC because the narrow Role was slightly harder to write.</li>
          <li>Assuming non-root alone prevents privilege escalation.</li>
          <li>Breaking an app with read-only rootfs without mounting its required writable paths.</li>
          <li>Calling a scan, SBOM or signature interchangeable.</li>
          <li>Enabling audit flags without mounting the policy/log path into the API server static Pod.</li>
          <li>Making several control-plane changes before verifying the first one.</li>
        </ul>
        <p>Practice order: <strong>NetworkPolicy → RBAC/service accounts → restricted Pods/PSA → API/CIS hardening → seccomp/AppArmor → image scanning/signing/admission → audit policy → runtime investigation</strong>. Rehearse every task with a positive and negative test; security without evidence is only configuration.</p>`
};

const guides = [kcna, kcsa, ckad, cks];

for (const guide of guides) {
  fs.writeFileSync(path.join(posts, `cheat-${guide.code.toLowerCase()}.html`), articlePage(guide));
}

fs.writeFileSync(path.join(site, "series-kubestronaut.html"), landingPage());

console.log(`Built ${guides.length} Kubestronaut certification guides and the series landing page.`);

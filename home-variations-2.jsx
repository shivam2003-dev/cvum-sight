/* More homepage variations */

// =============== HOME 03 — "Terminal / Notebook" ===============
const HomeTerminal = () => (
  <div className="wf" style={{ width: 1200, height: 1500 }}>
    <div className="wf-inner">
      <Topbar active="home" />

      {/* big intro block */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, marginBottom: 24 }}>
        <div className="sk-box" style={{ padding: '20px 24px', background: '#1e1a14', color: 'var(--paper)', borderColor: 'var(--ink)' }}>
          <div style={{ fontFamily: 'var(--hand-mono)', fontSize: 12, color: 'var(--yellow)' }}>$ whoami</div>
          <div style={{ fontFamily: 'var(--hand-mono)', fontSize: 13, lineHeight: 1.6, color: 'var(--paper)', marginTop: 6 }}>
            cvam — devops engineer (5y), security foundations (cks/oscp-ish),<br/>
            currently doing a masters in ai/ml. postgres true believer.<br/>
            writes weekly. ships code daily. forgets things often, hence this site.
          </div>
          <div style={{ fontFamily: 'var(--hand-mono)', fontSize: 12, color: 'var(--yellow)', marginTop: 16 }}>$ ls ./recent_thoughts/</div>
          <div style={{ fontFamily: 'var(--hand-mono)', fontSize: 12, color: 'var(--paper)', lineHeight: 1.6, marginTop: 4 }}>
            <div>2026-04-28  softmax-temperature.md</div>
            <div>2026-04-26  pg-logical-replication-on-k8s.md</div>
            <div>2026-04-23  homelab-threat-model.md</div>
            <div>2026-04-19  backprop-by-hand.md</div>
            <div style={{ color: 'var(--yellow)' }}>_</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <StickyNote>
            <div style={{ fontSize: 11, fontFamily: 'var(--hand-mono)', textTransform: 'uppercase', marginBottom: 6 }}>// now</div>
            <div style={{ fontSize: 16, fontFamily: 'var(--hand)', lineHeight: 1.3 }}>
              week 23 of masters. shipping a vector db side-project. not sleeping enough.
            </div>
          </StickyNote>

          <div className="sk-box" style={{ padding: 12 }}>
            <div className="sk-meta" style={{ marginBottom: 8 }}>WRITE STREAK</div>
            <ContribGrid rows={3} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--hand-mono)', fontSize: 11 }}>
              <span>14d 🔥</span>
              <span>47 posts · 72k words</span>
            </div>
          </div>
        </div>
      </div>

      {/* featured */}
      <div className="sk-box" style={{ padding: 18, marginBottom: 22, position: 'relative' }}>
        <Stamp style={{ top: -10, right: 16 }}>FEATURED</Stamp>
        <div className="sk-meta" style={{ marginBottom: 4 }}>// latest · apr 28</div>
        <div style={{ fontFamily: 'var(--hand-display)', fontSize: 44, lineHeight: 1, fontWeight: 700, marginBottom: 8 }}>
          why softmax temperature is just confidence, rebranded.
        </div>
        <div style={{ fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5, maxWidth: 760, marginBottom: 12 }}>
          spent the morning unlearning what I thought I knew. notes from chapter 4 of the deep learning book + a sketch I drew on the back of a napkin.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="sk-tag fill">ml</span>
          <span className="sk-tag">fundamentals</span>
          <span className="sk-meta">7 min · 1240 words</span>
          <button className="sk-btn primary" style={{ marginLeft: 'auto' }}>open →</button>
        </div>
      </div>

      {/* feed grouped by category */}
      <div className="sk-meta" style={{ marginBottom: 12 }}>BY CATEGORY //</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        {[
          { name: 'ml', count: 14, color: 'var(--yellow)' },
          { name: 'devops', count: 11, color: 'var(--paper-2)' },
          { name: 'postgres', count: 9, color: 'var(--paper-2)' },
          { name: 'security', count: 6, color: 'var(--paper-2)' },
        ].map((c, i) => (
          <div key={i} className="sk-box" style={{ padding: 14, background: c.color }}>
            <div style={{ fontFamily: 'var(--hand-display)', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{c.name}</div>
            <div className="sk-meta" style={{ marginTop: 4 }}>{c.count} posts</div>
            <div style={{ marginTop: 10, fontFamily: 'var(--hand)', fontSize: 12, lineHeight: 1.4 }}>
              <div>· latest post →</div>
              <div>· popular →</div>
              <div>· browse all →</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sk-meta" style={{ marginBottom: 10 }}>RECENT // chronological</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {SamplePosts.slice(1, 5).map((p, i) => <PostCard key={i} {...p} />)}
      </div>

      <Footer />

      <ArrowAnno style={{ top: 100, right: 380, transform: 'rotate(-6deg)' }}>
        terminal-style intro
      </ArrowAnno>
    </div>
  </div>
);

// =============== HOME 04 — "Newsprint / minimal column" ===============
const HomeNewsprint = () => (
  <div className="wf" style={{ width: 1200, height: 1500 }}>
    <div className="wf-inner">
      {/* masthead */}
      <div style={{ borderTop: '3px solid var(--ink)', borderBottom: '1.5px solid var(--ink)', padding: '14px 0', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="sk-meta">vol. 01 · issue 47 · apr 30, 2026</div>
        <div style={{ fontFamily: 'var(--hand-display)', fontSize: 56, fontWeight: 700, lineHeight: 1 }}>cvam.sight</div>
        <div className="sk-meta">written in chennai · ⌘K to search</div>
      </div>
      <div style={{ borderBottom: '1.5px solid var(--ink)', padding: '6px 0 10px', textAlign: 'center', fontFamily: 'var(--hand)', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 18 }}>
        a weekly-ish log on devops, postgres, security & a masters-in-progress in ml
      </div>

      {/* nav strip */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginBottom: 22, fontFamily: 'var(--hand-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        <span style={{ background: 'var(--yellow)', padding: '2px 6px', border: '1.2px solid var(--ink)' }}>HOME</span>
        <span>ML</span>
        <span>DEVOPS</span>
        <span>POSTGRES</span>
        <span>SECURITY</span>
        <span>RESOURCES</span>
        <span>ABOUT</span>
      </div>

      {/* 3-column newsprint feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 22 }}>
        {/* lead column */}
        <div style={{ borderRight: '1px solid var(--ink)', paddingRight: 22 }}>
          <div className="sk-meta" style={{ marginBottom: 6 }}>// lead story</div>
          <div style={{ fontFamily: 'var(--hand-display)', fontSize: 42, lineHeight: 0.95, fontWeight: 700, marginBottom: 10 }}>
            why softmax temperature is just confidence, rebranded.
          </div>
          <div className="sk-hatch yellow" style={{ height: 200, marginBottom: 10 }}>
            [napkin sketch]
          </div>
          <div style={{ fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.55, columnCount: 1 }}>
            spent the morning unlearning what I thought I knew about logits. notes from chapter 4 of the deep learning book + a sketch I drew on the back of a napkin while waiting for k8s pods to schedule. the short version: tau is a knob for how much you trust your model. the long version is below, in 1240 words and three diagrams →
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            <span className="sk-tag fill">ml</span>
            <span className="sk-tag">fundamentals</span>
            <span className="sk-meta" style={{ marginLeft: 'auto' }}>apr 28 · 7 min</span>
          </div>
        </div>

        {/* middle */}
        <div style={{ borderRight: '1px solid var(--ink)', paddingRight: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div className="sk-meta" style={{ marginBottom: 6 }}>// devops</div>
            <div style={{ fontFamily: 'var(--hand-display)', fontSize: 24, lineHeight: 1.05, fontWeight: 600, marginBottom: 6 }}>
              postgres logical replication on k8s, the bits no one mentions.
            </div>
            <FakeText lines={4} widths={['100%', '95%', '90%', '60%']} />
            <div className="sk-meta" style={{ marginTop: 8 }}>apr 26 · 11 min</div>
          </div>

          <hr className="sk-line dashed" />

          <div>
            <div className="sk-meta" style={{ marginBottom: 6 }}>// security</div>
            <div style={{ fontFamily: 'var(--hand-display)', fontSize: 22, lineHeight: 1.05, fontWeight: 600, marginBottom: 6 }}>
              threat model for my homelab in 12 questions.
            </div>
            <FakeText lines={3} widths={['100%', '85%', '50%']} />
            <div className="sk-meta" style={{ marginTop: 8 }}>apr 23 · 5 min</div>
          </div>

          <hr className="sk-line dashed" />

          <div>
            <div className="sk-meta" style={{ marginBottom: 6 }}>// ml notes</div>
            <div style={{ fontFamily: 'var(--hand-display)', fontSize: 22, lineHeight: 1.05, fontWeight: 600, marginBottom: 6 }}>
              backprop by hand, one more time.
            </div>
            <FakeText lines={3} widths={['100%', '92%', '70%']} />
            <div className="sk-meta" style={{ marginTop: 8 }}>apr 19 · 9 min</div>
          </div>
        </div>

        {/* right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <StickyNote style={{ transform: 'rotate(1deg)' }}>
            <div className="sk-meta" style={{ marginBottom: 4 }}>// now</div>
            <div style={{ fontFamily: 'var(--hand)', fontSize: 14, lineHeight: 1.3 }}>
              week 23 of masters. shipping a vector db side-project.
            </div>
          </StickyNote>

          <div className="sk-box" style={{ padding: 12 }}>
            <div className="sk-meta" style={{ marginBottom: 8 }}>STATS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--hand-display)', fontSize: 22 }}>
              <div>47<div className="sk-meta" style={{ fontSize: 9 }}>posts</div></div>
              <div>14d<div className="sk-meta" style={{ fontSize: 9 }}>streak</div></div>
              <div>9<div className="sk-meta" style={{ fontSize: 9 }}>topics</div></div>
            </div>
          </div>

          <div className="sk-box" style={{ padding: 12 }}>
            <div className="sk-meta" style={{ marginBottom: 8 }}>READING LIST</div>
            <div style={{ fontFamily: 'var(--hand)', fontSize: 13, lineHeight: 1.5 }}>
              → deep learning · goodfellow<br/>
              → designing data-intensive apps<br/>
              → karpathy zero-to-hero<br/>
              → attention is all you need
            </div>
          </div>

          <div className="sk-box" style={{ padding: 12 }}>
            <div className="sk-meta" style={{ marginBottom: 8 }}>POPULAR TAGS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {['postgres', 'k8s', 'ml', 'fundamentals', 'replication', 'threat-model', 'derivations', 'masters'].map((t, i) => (
                <span key={i} className="sk-tag" style={{ fontSize: 11 }}>#{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <hr className="sk-line" style={{ margin: '24px 0 18px' }} />

      <div className="sk-meta" style={{ marginBottom: 10 }}>// older entries</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {SamplePosts.slice(0, 4).map((p, i) => (
          <div key={i} style={{ borderTop: '1.5px solid var(--ink)', paddingTop: 8 }}>
            <div className="sk-meta">{p.date} · {p.cat}</div>
            <div style={{ fontFamily: 'var(--hand-display)', fontSize: 18, lineHeight: 1.05, fontWeight: 600, marginTop: 4 }}>{p.title}</div>
          </div>
        ))}
      </div>

      <Footer />

      <ArrowAnno style={{ top: 30, left: 30, transform: 'rotate(-4deg)' }}>
        masthead like an old<br/>broadsheet ↘
      </ArrowAnno>
    </div>
  </div>
);

window.HomeTerminal = HomeTerminal;
window.HomeNewsprint = HomeNewsprint;

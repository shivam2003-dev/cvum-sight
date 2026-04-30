/* Homepage wireframe variations */

// =============== HOME 01 — "Editorial / Magazine spread" ===============
const HomeEditorial = () => (
  <div className="wf" style={{ width: 1200, height: 1500 }}>
    <div className="wf-inner">
      <Topbar active="home" />

      {/* hero — featured latest post */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginBottom: 28, position: 'relative' }}>
        <div style={{ borderRight: '1.5px solid var(--ink)', paddingRight: 24 }}>
          <div className="sk-meta" style={{ marginBottom: 8 }}>// latest · apr 28 · 7 min</div>
          <div style={{ fontFamily: 'var(--hand-display)', fontSize: 64, lineHeight: 0.95, fontWeight: 700, marginBottom: 12 }}>
            why softmax<br/>temperature is just<br/>confidence, rebranded.
          </div>
          <div style={{ fontFamily: 'var(--hand)', fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 16, maxWidth: 520 }}>
            spent the morning unlearning what I thought I knew about logits. notes from chapter 4 of the deep learning book + a sketch I drew on the back of a napkin →
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <span className="sk-tag fill">ml</span>
            <span className="sk-tag">fundamentals</span>
            <span className="sk-tag">masters</span>
          </div>
          <button className="sk-btn primary">read post →</button>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="sk-hatch yellow" style={{ height: 280, marginBottom: 12 }}>
            [napkin sketch — softmax temperature curves]
          </div>
          <div className="sk-meta">fig. 01 — annotated by hand</div>
          <Stamp style={{ top: -8, right: -8 }}>NEW</Stamp>
        </div>
      </div>

      <hr className="sk-line" style={{ marginBottom: 20 }} />

      {/* now + stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
        <StickyNote style={{ transform: 'rotate(-1.5deg)' }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--hand-mono)', textTransform: 'uppercase', marginBottom: 6 }}>NOW //</div>
          <div style={{ fontSize: 18, lineHeight: 1.2, fontFamily: 'var(--hand)' }}>
            reading karpathy's zero-to-hero. building a search index for my notes. ignoring my inbox.
          </div>
        </StickyNote>
        <div className="sk-box" style={{ padding: 14 }}>
          <div className="sk-meta" style={{ marginBottom: 10 }}>STATS // 2026</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><div style={{ fontFamily: 'var(--hand-display)', fontSize: 32, lineHeight: 1 }}>47</div><div className="sk-meta">posts</div></div>
            <div><div style={{ fontFamily: 'var(--hand-display)', fontSize: 32, lineHeight: 1 }}>14d</div><div className="sk-meta">streak</div></div>
            <div><div style={{ fontFamily: 'var(--hand-display)', fontSize: 32, lineHeight: 1 }}>9</div><div className="sk-meta">topics</div></div>
            <div><div style={{ fontFamily: 'var(--hand-display)', fontSize: 32, lineHeight: 1 }}>72k</div><div className="sk-meta">words</div></div>
          </div>
        </div>
        <div className="sk-box" style={{ padding: 14 }}>
          <div className="sk-meta" style={{ marginBottom: 8 }}>READING //</div>
          <div style={{ fontFamily: 'var(--hand)', fontSize: 14, lineHeight: 1.5 }}>
            <div>📖 deep learning · goodfellow</div>
            <div>📄 “attention is all you need”</div>
            <div>📺 zero-to-hero · ep 4</div>
            <div className="sk-meta" style={{ marginTop: 6 }}>see all →</div>
          </div>
        </div>
      </div>

      {/* feed */}
      <div className="sk-meta" style={{ marginBottom: 10 }}>RECENT // chronological</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {SamplePosts.slice(1, 7).map((p, i) => <PostCard key={i} {...p} />)}
      </div>

      <Footer />

      {/* annotations */}
      <ArrowAnno style={{ top: 130, right: 30, transform: 'rotate(8deg)' }}>
        ← featured post = biggest type
      </ArrowAnno>
    </div>
  </div>
);

// =============== HOME 02 — "Index / Directory" ===============
const HomeIndex = () => (
  <div className="wf" style={{ width: 1200, height: 1500 }}>
    <div className="wf-inner">
      <Topbar active="home" />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 28 }}>
        {/* sidebar */}
        <div>
          <div style={{ fontFamily: 'var(--hand-display)', fontSize: 42, lineHeight: 1, fontWeight: 700, marginBottom: 8 }}>
            cvam.<br/>sight
          </div>
          <div style={{ fontFamily: 'var(--hand)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 18 }}>
            devops by day · ml masters by night · postgres always · writing it down so I remember.
          </div>

          <div className="sk-box" style={{ padding: 12, marginBottom: 14 }}>
            <div className="sk-meta" style={{ marginBottom: 6 }}>NOW</div>
            <div style={{ fontFamily: 'var(--hand)', fontSize: 13, lineHeight: 1.4 }}>
              writing about backprop. fixing my home server. learning torch.compile.
            </div>
          </div>

          <div className="sk-meta" style={{ marginBottom: 6 }}>CATEGORIES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 18 }}>
            {[['ml', 14], ['devops', 11], ['postgres', 9], ['security', 6], ['resources', 4], ['notes', 3]].map(([n, c]) => (
              <div key={n} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--ink-faint)', padding: '3px 0', fontFamily: 'var(--hand-mono)', fontSize: 12 }}>
                <span>// {n}</span>
                <span>{c}</span>
              </div>
            ))}
          </div>

          <div className="sk-meta" style={{ marginBottom: 6 }}>STATS</div>
          <div className="sk-box" style={{ padding: 10, marginBottom: 14 }}>
            <ContribGrid rows={5} />
            <div className="sk-meta" style={{ marginTop: 8, textAlign: 'center' }}>14 day streak · 47 posts</div>
          </div>

          <div className="sk-meta" style={{ marginBottom: 6 }}>READING</div>
          <div style={{ fontFamily: 'var(--hand)', fontSize: 12, lineHeight: 1.6 }}>
            → goodfellow, dl<br/>
            → attention is all you need<br/>
            → karpathy zero-to-hero<br/>
            → designing data-intensive apps
          </div>
        </div>

        {/* feed as a numbered index */}
        <div style={{ borderLeft: '1.5px solid var(--ink)', paddingLeft: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <div className="sk-h2">log // 2026</div>
            <div className="sk-meta">47 entries · newest first</div>
          </div>

          {SamplePosts.concat(SamplePosts).slice(0, 9).map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 70px 90px 1fr 80px', gap: 12, padding: '12px 0', borderBottom: '1px dashed var(--ink)' }}>
              <div style={{ fontFamily: 'var(--hand-mono)', fontSize: 11, color: 'var(--ink-faint)' }}>{String(47 - i).padStart(3, '0')}</div>
              <div className="sk-meta">{p.date}</div>
              <div><span className="sk-tag fill">{p.cat}</span></div>
              <div>
                <div style={{ fontFamily: 'var(--hand-display)', fontSize: 20, lineHeight: 1.1, fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontFamily: 'var(--hand)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{p.excerpt}</div>
              </div>
              <div className="sk-meta" style={{ textAlign: 'right' }}>{p.time} min</div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
            <button className="sk-btn">load older →</button>
          </div>
        </div>
      </div>

      <Footer />

      <ArrowAnno style={{ top: 240, left: 320, transform: 'rotate(-4deg)' }}>
        index-style log,<br/>kept dense on purpose
      </ArrowAnno>
    </div>
  </div>
);

window.HomeEditorial = HomeEditorial;
window.HomeIndex = HomeIndex;

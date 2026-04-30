/* Supporting screens — category, resources, search, tags, single post */

// =============== CATEGORY / ARCHIVE ===============
const CategoryArchive = () => (
  <div className="wf" style={{ width: 1200, height: 1400 }}>
    <div className="wf-inner">
      <Topbar active="archive" />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 6 }}>
        <div className="sk-meta">// archive →</div>
        <div style={{ fontFamily: 'var(--hand-display)', fontSize: 64, lineHeight: 1, fontWeight: 700 }}>
          ml.
        </div>
        <div className="sk-meta">14 entries · 18,420 words</div>
      </div>
      <div style={{ fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--ink-soft)', maxWidth: 700, marginBottom: 18 }}>
        notes, derivations, and half-baked ideas from my masters in ai/ml. mostly first-principles, some paper notes, occasional rant.
      </div>

      {/* category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1.5px solid var(--ink)', paddingBottom: 10 }}>
        {[
          ['ml', 14, true], ['devops', 11], ['postgres', 9], ['security', 6], ['resources', 4], ['notes', 3]
        ].map(([n, c, active], i) => (
          <span key={i} className={`sk-tag ${active ? 'fill' : ''}`} style={{ fontSize: 12, padding: '4px 12px' }}>
            // {n} · {c}
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 30 }}>
        <div>
          {/* timeline */}
          <div className="sk-meta" style={{ marginBottom: 10 }}>2026 // april</div>
          {SamplePosts.slice(0, 2).map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 18, paddingBottom: 16, marginBottom: 16, borderBottom: '1px dashed var(--ink)' }}>
              <div>
                <div style={{ fontFamily: 'var(--hand-display)', fontSize: 26, lineHeight: 1, fontWeight: 600 }}>{p.date.split(' ')[1]}</div>
                <div className="sk-meta">{p.date.split(' ')[0]}</div>
              </div>
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}><span className="sk-tag fill">{p.cat}</span></div>
                <div style={{ fontFamily: 'var(--hand-display)', fontSize: 26, lineHeight: 1.05, fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontFamily: 'var(--hand)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 6 }}>{p.excerpt}</div>
                <div className="sk-meta">{p.time} min · {p.words} words · {p.tags.map(t => '#' + t).join(' · ')}</div>
              </div>
            </div>
          ))}

          <div className="sk-meta" style={{ marginBottom: 10, marginTop: 24 }}>2026 // march</div>
          {SamplePosts.slice(2, 5).map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 18, paddingBottom: 16, marginBottom: 16, borderBottom: '1px dashed var(--ink)' }}>
              <div>
                <div style={{ fontFamily: 'var(--hand-display)', fontSize: 26, lineHeight: 1, fontWeight: 600 }}>{14 + i * 3}</div>
                <div className="sk-meta">mar</div>
              </div>
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}><span className="sk-tag fill">{p.cat}</span></div>
                <div style={{ fontFamily: 'var(--hand-display)', fontSize: 24, lineHeight: 1.05, fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontFamily: 'var(--hand)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{p.excerpt}</div>
              </div>
            </div>
          ))}
        </div>

        {/* sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="sk-box" style={{ padding: 12 }}>
            <div className="sk-meta" style={{ marginBottom: 8 }}>POSTS PER MONTH</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {[3, 5, 2, 4, 7, 6, 4, 5, 8, 4, 6, 7].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h * 10}%`, background: i === 11 ? 'var(--yellow)' : 'var(--paper-2)', border: '1px solid var(--ink)' }}></div>
              ))}
            </div>
            <div className="sk-meta" style={{ marginTop: 6 }}>may → apr</div>
          </div>

          <div className="sk-box" style={{ padding: 12 }}>
            <div className="sk-meta" style={{ marginBottom: 8 }}>SUB-TOPICS IN ML</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {[['fundamentals', 6], ['derivations', 4], ['papers', 3], ['masters', 8], ['transformers', 2], ['rl', 1]].map(([t, c], i) => (
                <span key={i} className="sk-tag" style={{ fontSize: 11 }}>#{t} {c}</span>
              ))}
            </div>
          </div>

          <div className="sk-box" style={{ padding: 12 }}>
            <div className="sk-meta" style={{ marginBottom: 8 }}>FILTER BY YEAR</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--hand-mono)', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>2026</span><span>14</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-faint)' }}><span>2025</span><span>—</span></div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <ArrowAnno style={{ top: 110, right: 30, transform: 'rotate(6deg)' }}>
        big category title<br/>+ tabs to other cats
      </ArrowAnno>
    </div>
  </div>
);

// =============== RESOURCES ===============
const ResourcesPage = () => (
  <div className="wf" style={{ width: 1200, height: 1300 }}>
    <div className="wf-inner">
      <Topbar active="resources" />

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: 'var(--hand-display)', fontSize: 56, lineHeight: 1, fontWeight: 700 }}>resources.</div>
        <div style={{ fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--ink-soft)', maxWidth: 700, marginTop: 8 }}>
          things i actually use, not just things i bookmarked. updated when something new earns a place.
        </div>
      </div>

      {/* filter strip */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {['all', 'books', 'papers', 'courses', 'tools', 'people'].map((f, i) => (
          <span key={i} className={`sk-tag ${i === 0 ? 'fill' : ''}`} style={{ fontSize: 12, padding: '4px 12px' }}>{f}</span>
        ))}
      </div>

      {/* sections */}
      {[
        { name: 'BOOKS // currently reading', items: [
          { t: 'Deep Learning', a: 'Goodfellow, Bengio, Courville', n: 'on chapter 4. dense but worth it.' },
          { t: 'Designing Data-Intensive Applications', a: 'Kleppmann', n: 'second pass. still my desert-island book.' },
          { t: 'Database Internals', a: 'Petrov', n: 'paired with the postgres source code.' },
        ]},
        { name: 'PAPERS // i actually finished', items: [
          { t: 'Attention Is All You Need', a: 'Vaswani et al., 2017', n: 're-read with karpathy’s video. clicked.' },
          { t: 'The Bitter Lesson', a: 'Sutton, 2019', n: 'short. uncomfortable. true.' },
          { t: 'Aria: A Database Replication Approach', a: 'Lu et al.', n: 'because postgres replication is my whole life.' },
        ]},
        { name: 'COURSES & VIDEOS', items: [
          { t: 'Neural Networks: Zero to Hero', a: 'Andrej Karpathy', n: 'the best ml teaching on the internet.' },
          { t: 'CMU Database Systems', a: 'Andy Pavlo', n: 'free lectures, the gold standard.' },
        ]},
        { name: 'TOOLS // daily drivers', items: [
          { t: 'pgvector', a: 'postgres extension', n: 'every side project I start now uses it.' },
          { t: 'tailscale', a: 'mesh vpn', n: 'changed my homelab security model.' },
          { t: 'obsidian', a: 'note app', n: 'where these posts start, in markdown.' },
        ]},
      ].map((sec, i) => (
        <div key={i} style={{ marginBottom: 26 }}>
          <div className="sk-meta" style={{ marginBottom: 10 }}>{sec.name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {sec.items.map((it, j) => (
              <div key={j} className="sk-box" style={{ padding: 14, position: 'relative' }}>
                <div className="sk-hatch" style={{ height: 60, marginBottom: 10, background: 'var(--paper-2)' }}>cover</div>
                <div style={{ fontFamily: 'var(--hand-display)', fontSize: 20, fontWeight: 700, lineHeight: 1.05 }}>{it.t}</div>
                <div className="sk-meta" style={{ marginTop: 2 }}>{it.a}</div>
                <div style={{ fontFamily: 'var(--hand)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.4 }}>“{it.n}”</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Footer />
    </div>
  </div>
);

// =============== TAGS ===============
const TagsPage = () => {
  const tags = [
    ['postgres', 9, 32], ['ml', 14, 38], ['k8s', 7, 28], ['fundamentals', 6, 26],
    ['security', 6, 26], ['masters', 8, 30], ['threat-model', 3, 18], ['replication', 4, 20],
    ['indexing', 3, 18], ['homelab', 5, 22], ['derivations', 4, 20], ['papers', 3, 18],
    ['transformers', 2, 16], ['python', 5, 22], ['rust', 2, 16], ['notes', 3, 18],
    ['reading', 2, 16], ['rl', 1, 14], ['vector-db', 2, 16], ['observability', 4, 20],
    ['ssh', 2, 16], ['linux', 6, 26], ['career', 1, 14], ['side-project', 3, 18],
  ];
  return (
    <div className="wf" style={{ width: 1200, height: 1100 }}>
      <div className="wf-inner">
        <Topbar active="tags" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div style={{ fontFamily: 'var(--hand-display)', fontSize: 56, lineHeight: 1, fontWeight: 700 }}>tags.</div>
          <div className="sk-meta">24 tags · sized by post count</div>
        </div>
        <div style={{ fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--ink-soft)', maxWidth: 600, marginBottom: 22 }}>
          a flat view of every tag i've used. bigger = more posts. click any to see all entries.
        </div>

        <div className="sk-box double" style={{ padding: 30, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: '12px 18px', alignItems: 'baseline', justifyContent: 'center' }}>
          {tags.map(([t, c, size], i) => (
            <span key={i} style={{
              fontFamily: 'var(--hand-display)', fontWeight: 700,
              fontSize: size, lineHeight: 1,
              color: c >= 8 ? 'var(--ink)' : 'var(--ink-soft)',
              background: c >= 8 ? 'var(--yellow)' : 'transparent',
              padding: c >= 8 ? '2px 8px' : '0',
              border: c >= 8 ? '1.5px solid var(--ink)' : 'none',
              transform: `rotate(${(i % 5 - 2) * 0.4}deg)`
            }}>
              #{t}<span style={{ fontFamily: 'var(--hand-mono)', fontSize: 11, color: 'var(--ink-faint)', marginLeft: 4 }}>{c}</span>
            </span>
          ))}
        </div>

        {/* grouped by category */}
        <div className="sk-meta" style={{ marginBottom: 10 }}>BY CATEGORY //</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            ['ml', ['fundamentals', 'masters', 'derivations', 'papers', 'transformers', 'rl']],
            ['devops', ['k8s', 'observability', 'linux', 'side-project']],
            ['postgres', ['indexing', 'replication', 'vector-db']],
            ['security', ['threat-model', 'homelab', 'ssh']],
          ].map(([cat, ts], i) => (
            <div key={i} className="sk-box" style={{ padding: 12 }}>
              <div className="sk-meta" style={{ marginBottom: 8 }}>// {cat}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {ts.map((t, j) => <span key={j} className="sk-tag" style={{ fontSize: 11 }}>#{t}</span>)}
              </div>
            </div>
          ))}
        </div>

        <Footer />

        <ArrowAnno style={{ top: 220, left: 30, transform: 'rotate(-6deg)' }}>
          weighted cloud →<br/>scale = post count
        </ArrowAnno>
      </div>
    </div>
  );
};

// =============== SEARCH ===============
const SearchPage = () => (
  <div className="wf" style={{ width: 1200, height: 1000 }}>
    <div className="wf-inner">
      <Topbar active="" />

      <div style={{ maxWidth: 800, margin: '20px auto 0' }}>
        {/* search input */}
        <div className="sk-box" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, boxShadow: '4px 4px 0 var(--ink)' }}>
          <div style={{ width: 18, height: 18, border: '2px solid var(--ink)', borderRadius: '50%', position: 'relative' }}>
            <div style={{ position: 'absolute', right: -6, bottom: -6, width: 9, height: 2, background: 'var(--ink)', transform: 'rotate(45deg)' }}></div>
          </div>
          <div style={{ fontFamily: 'var(--hand-display)', fontSize: 32, color: 'var(--ink)', flex: 1 }}>
            postgres replic<span style={{ borderRight: '2px solid var(--ink)', marginLeft: 1 }}></span>
          </div>
          <span className="sk-meta">⌘K</span>
        </div>
        <div style={{ display: 'flex', gap: 8, fontFamily: 'var(--hand-mono)', fontSize: 11, color: 'var(--ink-faint)', marginBottom: 22, padding: '0 6px' }}>
          <span>filters →</span>
          <span className="sk-tag fill" style={{ fontSize: 10 }}>posts</span>
          <span className="sk-tag" style={{ fontSize: 10 }}>resources</span>
          <span className="sk-tag" style={{ fontSize: 10 }}>tags</span>
          <span style={{ marginLeft: 'auto' }}>4 results · 31ms</span>
        </div>

        {/* results */}
        {[
          { t: 'Postgres logical replication on k8s, the bits no one mentions', cat: 'devops', date: 'apr 26', snip: 'WAL sender timeouts, publication identity columns, and that one quirk with sequences after failover.', match: 'replication' },
          { t: 'JSONB indexing patterns I keep reaching for', cat: 'postgres', date: 'apr 12', snip: 'GIN vs BRIN, when path ops actually pay off, and the query that taught me to read EXPLAIN again.', match: 'postgres' },
          { t: 'Aria: a database replication approach', cat: 'resources', date: 'mar 02', snip: 'Lu et al. — paper notes. why I think this matters for postgres clusters.', match: 'replication' },
          { t: 'Tag #replication', cat: 'tag', date: '4 posts', snip: 'all entries tagged replication →', match: 'replication' },
        ].map((r, i) => (
          <div key={i} className="sk-box" style={{ padding: 14, marginBottom: 10, display: 'grid', gridTemplateColumns: '70px 1fr 60px', gap: 14, alignItems: 'center' }}>
            <span className="sk-tag fill" style={{ fontSize: 10, justifySelf: 'start' }}>{r.cat}</span>
            <div>
              <div style={{ fontFamily: 'var(--hand-display)', fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>
                {r.t.split(new RegExp(`(${r.match})`, 'i')).map((part, j) =>
                  part.toLowerCase() === r.match.toLowerCase()
                    ? <span key={j} style={{ background: 'var(--yellow)', padding: '0 3px' }}>{part}</span>
                    : <span key={j}>{part}</span>
                )}
              </div>
              <div style={{ fontFamily: 'var(--hand)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>{r.snip}</div>
            </div>
            <div className="sk-meta" style={{ textAlign: 'right' }}>{r.date}</div>
          </div>
        ))}

        <div className="sk-meta" style={{ textAlign: 'center', marginTop: 24 }}>
          ↑↓ to navigate · ⏎ to open · esc to close
        </div>
      </div>

      <ArrowAnno style={{ top: 110, right: 80, transform: 'rotate(8deg)' }}>
        ⌘K opens this overlay<br/>from anywhere ↘
      </ArrowAnno>
    </div>
  </div>
);

// =============== SINGLE POST ===============
const SinglePost = () => (
  <div className="wf" style={{ width: 1200, height: 1700 }}>
    <div className="wf-inner">
      <Topbar active="" />

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 220px', gap: 30 }}>
        {/* TOC sidebar */}
        <div style={{ position: 'sticky', top: 0 }}>
          <div className="sk-meta" style={{ marginBottom: 8 }}>ON THIS PAGE</div>
          <div style={{ fontFamily: 'var(--hand)', fontSize: 13, lineHeight: 1.6 }}>
            <div style={{ borderLeft: '3px solid var(--yellow)', paddingLeft: 8 }}>1. the question</div>
            <div style={{ paddingLeft: 8, color: 'var(--ink-soft)' }}>2. what tau actually does</div>
            <div style={{ paddingLeft: 8, color: 'var(--ink-soft)' }}>3. derivation</div>
            <div style={{ paddingLeft: 8, color: 'var(--ink-soft)' }}>4. the napkin</div>
            <div style={{ paddingLeft: 8, color: 'var(--ink-soft)' }}>5. where this breaks</div>
          </div>

          <div className="sk-meta" style={{ marginTop: 22, marginBottom: 8 }}>RELATED</div>
          <div style={{ fontFamily: 'var(--hand)', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            → backprop by hand<br/>
            → cross-entropy intuition<br/>
            → when not to use softmax
          </div>
        </div>

        {/* article */}
        <article style={{ borderLeft: '1.5px solid var(--ink)', borderRight: '1.5px solid var(--ink)', padding: '0 28px' }}>
          <div className="sk-meta" style={{ marginBottom: 6 }}>// ml · apr 28, 2026 · 7 min · 1240 words</div>
          <h1 style={{ fontFamily: 'var(--hand-display)', fontSize: 56, lineHeight: 1, fontWeight: 700, margin: '0 0 14px' }}>
            why softmax temperature is just confidence, rebranded.
          </h1>
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            <span className="sk-tag fill">ml</span>
            <span className="sk-tag">fundamentals</span>
            <span className="sk-tag">masters</span>
          </div>

          <p style={{ fontFamily: 'var(--hand)', fontSize: 15, lineHeight: 1.65, marginBottom: 14 }}>
            spent the morning unlearning what i thought i knew about logits. i had been treating temperature like a creativity dial. it isn't. it's a confidence calibrator, and once you see it that way the rest of the math falls out for free.
          </p>

          <div style={{ fontFamily: 'var(--hand-display)', fontSize: 28, fontWeight: 700, margin: '20px 0 8px' }}>1. the question</div>
          <FakeText lines={4} widths={['100%', '98%', '92%', '85%']} />

          <div style={{ fontFamily: 'var(--hand-display)', fontSize: 28, fontWeight: 700, margin: '24px 0 8px' }}>2. what tau actually does</div>
          <FakeText lines={3} widths={['100%', '95%', '70%']} />

          {/* code block */}
          <div className="sk-code" style={{ margin: '16px 0' }}>
{`<span class="c-com"># softmax with temperature</span>
<span class="c-key">def</span> softmax_t(logits, tau=1.0):
    z = logits / tau
    e = np.exp(z - z.max())
    <span class="c-key">return</span> e / e.sum()`.split('\n').map((l, i) => (
              <div key={i} dangerouslySetInnerHTML={{ __html: l }}></div>
            ))}
          </div>

          {/* math callout */}
          <div className="sk-box" style={{ padding: '14px 18px', background: 'var(--paper-2)', margin: '16px 0', textAlign: 'center', fontFamily: 'var(--hand-mono)' }}>
            <div className="sk-meta" style={{ marginBottom: 6 }}>EQ. 1 — KaTeX</div>
            <div style={{ fontSize: 18 }}>p<sub>i</sub> = exp(z<sub>i</sub> / τ) / Σ<sub>j</sub> exp(z<sub>j</sub> / τ)</div>
          </div>

          <FakeText lines={3} widths={['100%', '90%', '60%']} />

          {/* diagram */}
          <div className="sk-hatch yellow" style={{ height: 220, margin: '20px 0' }}>
            [diagram: temperature curves at τ=0.5, 1.0, 2.0]
          </div>
          <div className="sk-meta" style={{ textAlign: 'center', marginTop: -10, marginBottom: 16 }}>fig. 02 — same logits, three confidences</div>

          <div style={{ fontFamily: 'var(--hand-display)', fontSize: 28, fontWeight: 700, margin: '24px 0 8px' }}>3. derivation</div>
          <FakeText lines={5} widths={['100%', '95%', '90%', '85%', '50%']} />

          {/* footnote */}
          <div style={{ borderLeft: '3px solid var(--yellow)', paddingLeft: 12, fontFamily: 'var(--hand)', fontSize: 13, color: 'var(--ink-soft)', margin: '16px 0', fontStyle: 'italic' }}>
            ¹ technically you can take the gradient with respect to τ too, which is fun but i'll save it for next week.
          </div>

          <FakeText lines={3} widths={['100%', '88%', '70%']} />

          {/* end of post nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid var(--ink)', paddingTop: 16, marginTop: 30 }}>
            <div>
              <div className="sk-meta">← previous</div>
              <div style={{ fontFamily: 'var(--hand-display)', fontSize: 18, fontWeight: 600 }}>postgres logical replication on k8s</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="sk-meta">next →</div>
              <div style={{ fontFamily: 'var(--hand-display)', fontSize: 18, fontWeight: 600 }}>backprop by hand, one more time</div>
            </div>
          </div>

          {/* comments */}
          <div style={{ marginTop: 28 }}>
            <div className="sk-meta" style={{ marginBottom: 10 }}>COMMENTS // 3</div>
            {[
              { who: 'priya k.', when: '2h ago', what: 'this finally made it click for me. the napkin sketch in particular.' },
              { who: 'arjun', when: '6h ago', what: 'small nit — eq. 1 should clarify the j ranges over classes, not samples. otherwise yes!' },
              { who: 'maya', when: '1d ago', what: 'do you have a follow-up on temperature scheduling during training?' },
            ].map((c, i) => (
              <div key={i} className="sk-box" style={{ padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--hand)', fontWeight: 700 }}>{c.who}</span>
                  <span className="sk-meta">{c.when}</span>
                </div>
                <div style={{ fontFamily: 'var(--hand)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>{c.what}</div>
              </div>
            ))}
            <div className="sk-box" style={{ padding: 12, marginTop: 12, borderStyle: 'dashed' }}>
              <div className="sk-meta">add a comment...</div>
            </div>
          </div>
        </article>

        {/* margin notes */}
        <div style={{ position: 'sticky', top: 0 }}>
          <div className="sk-meta" style={{ marginBottom: 10 }}>MARGIN NOTES</div>
          <StickyNote style={{ transform: 'rotate(2deg)', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontFamily: 'var(--hand)' }}>
              "creativity dial" — i blame every llm tutorial for this framing.
            </div>
          </StickyNote>
          <StickyNote style={{ transform: 'rotate(-1.5deg)', background: 'var(--paper-2)' }}>
            <div style={{ fontSize: 12, fontFamily: 'var(--hand)' }}>
              this post is part of week 23 of my masters. see <span style={{ textDecoration: 'underline' }}>masters log</span>.
            </div>
          </StickyNote>

          <div className="sk-meta" style={{ marginTop: 20, marginBottom: 6 }}>SHARE</div>
          <div style={{ fontFamily: 'var(--hand-mono)', fontSize: 11, lineHeight: 1.8 }}>
            → copy link<br/>
            → mastodon<br/>
            → email
          </div>
        </div>
      </div>

      <Footer />

      <ArrowAnno style={{ top: 240, left: 240, transform: 'rotate(-4deg)' }}>
        sticky TOC ↑
      </ArrowAnno>
      <ArrowAnno style={{ top: 380, right: 30, transform: 'rotate(6deg)' }}>
        ← margin notes &<br/>footnotes live here
      </ArrowAnno>
    </div>
  </div>
);

window.CategoryArchive = CategoryArchive;
window.ResourcesPage = ResourcesPage;
window.TagsPage = TagsPage;
window.SearchPage = SearchPage;
window.SinglePost = SinglePost;

/* Shared wireframe primitives — exported to window */

const Topbar = ({ active = 'home', siteName = 'cvam.sight' }) => (
  <div className="topbar">
    <div className="logo">
      <span className="dot"></span>
      {siteName}
      <span style={{ fontFamily: 'var(--hand-mono)', fontSize: 10, color: 'var(--ink-faint)', marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        // notes from a devops + ml apprentice
      </span>
    </div>
    <nav>
      <a className={active === 'home' ? 'active' : ''}>Home</a>
      <a className={active === 'archive' ? 'active' : ''}>Archive</a>
      <a className={active === 'tags' ? 'active' : ''}>Tags</a>
      <a className={active === 'resources' ? 'active' : ''}>Resources</a>
      <a className={active === 'about' ? 'active' : ''}>About</a>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span className="icon" style={{ width: 10, height: 10, border: '1.5px solid var(--ink)', borderRadius: '50%', position: 'relative', display: 'inline-block' }}></span>
        ⌘K
      </span>
    </nav>
  </div>
);

const Footer = () => (
  <div className="footer">
    <span>© cvam — written in plaintext, served warm</span>
    <span style={{ display: 'flex', gap: 12 }}>
      <span>RSS</span>
      <span>GITHUB</span>
      <span>EMAIL</span>
    </span>
  </div>
);

const FakeText = ({ lines = 3, widths = ['100%', '90%', '70%'], gap = 6 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="sk-text" style={{ width: widths[i % widths.length] }}></div>
    ))}
  </div>
);

const PostCard = ({ cat = 'devops', title, excerpt, date, time, words, tags = [] }) => (
  <div className="post-card">
    <span className="cat">{cat}</span>
    <h4>{title}</h4>
    <div className="excerpt">{excerpt}</div>
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {tags.map((t, i) => <span key={i} className="sk-tag">#{t}</span>)}
    </div>
    <div className="meta">
      <span>{date}</span>
      <span>· {time} min</span>
      <span>· {words} words</span>
    </div>
  </div>
);

const StickyNote = ({ children, style = {} }) => (
  <div className="sk-sticky" style={style}>
    {children}
  </div>
);

const Stamp = ({ children, style }) => (
  <div className="stamp" style={style}>{children}</div>
);

const ArrowAnno = ({ children, style }) => (
  <div className="callout" style={style}>{children}</div>
);

// quick contrib heatmap
const ContribGrid = ({ rows = 7 }) => {
  const cells = [];
  const total = rows * 26;
  for (let i = 0; i < total; i++) {
    const r = Math.random();
    let lvl = '';
    if (r > 0.92) lvl = 'l4';
    else if (r > 0.78) lvl = 'l3';
    else if (r > 0.55) lvl = 'l2';
    else if (r > 0.30) lvl = 'l1';
    cells.push(<div key={i} className={`cell ${lvl}`}></div>);
  }
  return <div className="contrib" style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}>{cells}</div>;
};

const SamplePosts = [
  { cat: 'ml', title: 'Why softmax temperature is just confidence rebranded', excerpt: 'Spent the morning unlearning what I thought I knew. Notes from chapter 4 of the deep learning book + a sketch...', date: 'apr 28', time: 7, words: 1240, tags: ['ml', 'fundamentals', 'masters'] },
  { cat: 'devops', title: 'Postgres logical replication on k8s, the bits no one mentions', excerpt: 'WAL sender timeouts, publication identity columns, and that one quirk with sequences after failover.', date: 'apr 26', time: 11, words: 2010, tags: ['postgres', 'k8s', 'replication'] },
  { cat: 'security', title: 'Threat model for my homelab in 12 questions', excerpt: 'Started with “who actually wants in?” and worked outward. Includes the answers I was embarrassed to write.', date: 'apr 23', time: 5, words: 880, tags: ['threat-model', 'homelab'] },
  { cat: 'ml', title: 'Backprop by hand, one more time', excerpt: 'I keep forgetting the chain rule shape. So here it is on paper, with every dimension annotated.', date: 'apr 19', time: 9, words: 1560, tags: ['ml', 'derivations'] },
  { cat: 'resources', title: 'My current ML reading list (apr ’26)', excerpt: 'Three textbooks, two papers I actually finished, one course I abandoned.', date: 'apr 15', time: 3, words: 540, tags: ['reading', 'ml'] },
  { cat: 'postgres', title: 'JSONB indexing patterns I keep reaching for', excerpt: 'GIN vs BRIN, when path ops actually pay off, and the query that taught me to read EXPLAIN again.', date: 'apr 12', time: 8, words: 1410, tags: ['postgres', 'indexing'] },
];

Object.assign(window, {
  Topbar, Footer, FakeText, PostCard, StickyNote, Stamp, ArrowAnno, ContribGrid, SamplePosts,
});

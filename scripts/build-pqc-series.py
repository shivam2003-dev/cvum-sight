#!/usr/bin/env python3
"""Render the authored Markdown course. Install scripts/pqc-requirements.txt first."""
import json, re, html, math
from pathlib import Path
import markdown, yaml
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
manifest=json.loads((ROOT/'content/pqc/series.json').read_text())
versions=json.loads((SITE/'shared-asset-versions.json').read_text())
template=(SITE/'posts/post-quantum-cryptography-foundations-survey.html').read_text()
articles=[]
for p in sorted((ROOT/'content/pqc').glob('*.md')):
    _,front,body=p.read_text().split('---',2)
    meta=yaml.safe_load(front)
    assert meta['slug']==manifest[meta['part']-1]['slug']
    body=re.sub(r'^# .+\n','',body.strip(),count=1)
    rendered=markdown.markdown(body,extensions=['tables','fenced_code','toc','sane_lists'])
    def wrap_table(match):
        columns=len(re.findall(r"<th>",match[1]))
        width=max(580,170*columns)
        return f'<div class="pqc-table-wrap" role="region" aria-label="Scrollable comparison table" tabindex="0"><table style="min-width:{width}px">{match[1]}</table></div>'
    rendered=re.sub(r'<table>(.*?)</table>',wrap_table,rendered,flags=re.S)
    words=len(re.findall(r"\b[\w’-]+\b",html.unescape(re.sub('<[^>]+>',' ',rendered))))
    meta.update(rendered=rendered,words=words,time=math.ceil(words/200))
    articles.append(meta)
assert [a['part'] for a in articles]==list(range(1,len(articles)+1))
for i,a in enumerate(articles):
    page=template
    title=html.escape(a['title']); desc=html.escape(a['description'],quote=True)
    page=re.sub(r'<title>.*?</title>',f'<title>{title} — cvam.sight</title>',page)
    page=re.sub(r'<meta name="description"[^>]*>',f'<meta name="description" content="{desc}">',page)
    page=re.sub(r'<link rel="canonical"[^>]*>',f'<link rel="canonical" href="https://shivam2003.com/posts/{a["slug"]}">',page)
    header=f'<div class="post-header"><p class="meta">Sep 11, 2026 · security · {a["time"]} min read · {a["words"]:,} words</p><h1>{title}</h1><p>Post-Quantum Cryptography · Part {a["part"]} of 18 · {a["difficulty"]}</p><div class="tag-row"><span class="tag fill">security</span><span class="tag">post-quantum</span><span class="tag">cryptography</span></div></div>'
    page=re.sub(r'<div class="post-header">.*?(?=<div class="post-body)',header+'\n',page,flags=re.S)
    nav='<a href="../series-pqc.html">All 18 parts</a>'
    if i: nav=f'<a href="{articles[i-1]["slug"]}.html">← Part {i}</a>'+nav
    if i+1<len(articles):nav+=f'<a href="{articles[i+1]["slug"]}.html">Part {i+2} →</a>'
    page=re.sub(r'(<div class="post-body osc-body pqc-survey">).*?(?=\s*</article>)',lambda m:m[1]+'\n'+a['rendered']+'\n</div><nav class="post-nav" aria-label="Series navigation">'+nav+'</nav>',page,flags=re.S)
    page=page.replace('</style>','.pqc-survey p,.pqc-survey li{overflow-wrap:break-word}.pqc-survey pre{max-width:100%;overflow-x:auto}.pqc-survey blockquote code{font-family:var(--font-mono)}\n</style>')
    (SITE/'posts'/f'{a["slug"]}.html').write_text(page)
entries=[]
for a in reversed(articles):
    entries.append(json.dumps(dict(slug=a['slug'],title=a['title'],date='Sep 11, 2026',cat='security',tags=['security','post-quantum','cryptography'],time=a['time'],words=a['words'],excerpt=a['description'],series='pqc',seriesNum=str(a['part'])),ensure_ascii=False,indent=2))
p=SITE/'posts.js'; data=p.read_text()
data=re.sub(r'\n  /\* PQC COURSE START \*/.*?/\* PQC COURSE END \*/\n','\n',data,flags=re.S)
data=data.replace('const POSTS = [','const POSTS = [\n  /* PQC COURSE START */\n'+',\n'.join(entries)+',\n  /* PQC COURSE END */')
p.write_text(data)
# Reuse the article shell so the course index inherits the same typography and controls.
page=template
page=re.sub(r'<title>.*?</title>','<title>Post-Quantum Cryptography: an engineering course — cvam.sight</title>',page)
page=re.sub(r'<meta name="description"[^>]*>','<meta name="description" content="An 18-part course from cryptography foundations to PQC standards, implementations, protocols, migration, and research.">',page)
page=re.sub(r'<link rel="canonical"[^>]*>','<link rel="canonical" href="https://shivam2003.com/series-pqc">',page)
page=page.replace('../','')
intro=f'<div class="post-header"><p class="meta">COURSE · {len(articles)} OF 18 PARTS PUBLISHED</p><h1>Post-Quantum Cryptography</h1><p>From the first cryptographic primitive to a migration you can measure. A rigorous engineering course with worked mathematics, standards, protocol flows, and reproducible labs.</p></div>'
page=re.sub(r'<div class="post-header">.*?(?=<div class="post-body)',intro,page,flags=re.S)
body='<h2 id="learning-path">Your learning path</h2><p>Read in order, or use the prerequisites in each chapter. Sources and standards are dated; examples distinguish toy mathematics from deployable software.</p><ol>'
for i,m in enumerate(manifest):
    label=html.escape(m['title'])
    body+=f'<li><a href="posts/{m["slug"]}.html">{label}</a> — {articles[i]["time"]} min</li>' if i<len(articles) else f'<li>{label} — forthcoming</li>'
body+='</ol><h2 id="surveys">Companion surveys</h2><p><a href="posts/post-quantum-cryptography-foundations-survey.html">Foundations survey</a> · <a href="posts/post-quantum-cryptography-migration-survey.html">Migration survey</a></p>'
page=re.sub(r'(<div class="post-body osc-body pqc-survey">).*?(?=\s*</article>)',lambda m:m[1]+body+'</div>',page,flags=re.S)
(SITE/'series-pqc.html').write_text(page)
for asset,v in versions.items():
    for p in [SITE/'series-pqc.html']+[SITE/'posts'/f'{a["slug"]}.html' for a in articles]:
        s=p.read_text();s=re.sub(re.escape(asset)+r'\?v=\d+',asset+'?v='+v,s);p.write_text(s)
print(json.dumps([{'part':a['part'],'slug':a['slug'],'words':a['words']} for a in articles],indent=2))

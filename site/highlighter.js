/* highlighter.js — Shiki syntax highlighting + copy button for all <pre> blocks */
(async () => {
  // Target bare <pre> and <pre><code> blocks inside .post-body
  const pres = Array.from(document.querySelectorAll('.post-body pre')).filter(
    p => !p.closest('.code-block-wrap')
  );
  if (!pres.length) return;

  let codeToHtml;
  try {
    ({ codeToHtml } = await import('https://esm.sh/shiki@1'));
  } catch (e) {
    return; // leave unstyled if CDN unreachable
  }

  for (const pre of pres) {
    const innerCode = pre.querySelector('code');
    // Detect language from class on <code> or <pre>, or data-lang
    const langSource = innerCode || pre;
    const langMatch = langSource.className.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1] : (pre.dataset.lang || 'text');
    const rawText = pre.textContent;

    try {
      const highlighted = await codeToHtml(rawText, {
        lang,
        theme: 'one-dark-pro',
      });

      // Build wrapper
      const wrap = document.createElement('div');
      wrap.className = 'code-block-wrap';

      // Header bar: dots + lang label + copy button
      const header = document.createElement('div');
      header.className = 'code-block-header';
      header.innerHTML =
        '<span class="code-dots"><i></i><i></i><i></i></span>' +
        (lang !== 'text' ? '<span class="code-lang">' + lang + '</span>' : '') +
        '<button class="code-copy-btn">copy</button>';

      wrap.appendChild(header);
      wrap.insertAdjacentHTML('beforeend', highlighted);

      // Shiki wraps in <pre><code> — CSS handles sizing and scroll
      const shikiPre = wrap.querySelector('pre');
      if (shikiPre) {
        shikiPre.style.borderRadius = '0 0 10px 10px';
      }

      // Copy handler
      header.querySelector('.code-copy-btn').addEventListener('click', function () {
        navigator.clipboard.writeText(rawText).then(() => {
          this.textContent = 'copied!';
          setTimeout(() => { this.textContent = 'copy'; }, 1800);
        }).catch(() => {
          // fallback for older browsers
          const ta = document.createElement('textarea');
          ta.value = rawText;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          this.textContent = 'copied!';
          setTimeout(() => { this.textContent = 'copy'; }, 1800);
        });
      });

      pre.replaceWith(wrap);
    } catch (e) {
      // leave original pre untouched if this block fails
    }
  }
})();

/* Lightweight code chrome + copy button for explicit-language <pre> blocks. */
(() => {
  // Target bare <pre> and <pre><code> blocks inside .post-body
  const blocks = Array.from(document.querySelectorAll('.post-body pre'))
    .filter(pre => !pre.closest('.code-block-wrap'))
    .map(pre => {
      const innerCode = pre.querySelector('code');
      const langSource = innerCode || pre;
      const langMatch = langSource.className.match(/language-([\w-]+)/);
      const lang = langMatch ? langMatch[1] : (pre.dataset.lang || 'text');
      return { pre, lang, rawText: pre.textContent };
    })
    .filter(block => block.lang !== 'text');
  if (!blocks.length) return;

  // Apply all wrappers in one frame. The code stays as native text, so there is
  // no remote grammar/WASM download, parser long task, or delayed scroll shift.
  requestAnimationFrame(() => {
    blocks.forEach(({ pre, lang, rawText }) => {
      const wrap = document.createElement('div');
      wrap.className = 'code-block-wrap';

      // Header bar: dots + lang label + copy button
      const header = document.createElement('div');
      header.className = 'code-block-header';
      header.innerHTML =
        '<span class="code-dots"><i></i><i></i><i></i></span>' +
        (lang !== 'text' ? '<span class="code-lang">' + lang + '</span>' : '') +
        '<button class="code-copy-btn">copy</button>';

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
      wrap.appendChild(header);
      wrap.appendChild(pre);
    });
  });
})();

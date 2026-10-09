(() => {
  if (document.querySelector('[data-back]')) return;
  const a = document.createElement('a');
  a.href = '../index.html';
  a.dataset.back = '1';
  a.textContent = '← Reportes';
  a.style.cssText = 'position:sticky;top:0;z-index:20;display:block;background:#f3f1ec;color:#1c1b19;text-decoration:none;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:.04em;padding:10px 18px;border-bottom:1px solid #e4ddd2;';
  document.body.prepend(a);
})();

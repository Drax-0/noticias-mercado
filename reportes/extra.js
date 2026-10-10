(() => {
  const css = document.createElement("style");
  css.textContent = "@media (max-width:860px){body{padding-top:0 !important;}#scorebar{position:sticky !important;top:0;z-index:50;display:flex !important;flex-wrap:wrap;align-items:center;gap:8px 12px;grid-template-columns:none !important;padding:10px 14px !important;font-size:15px !important;}#scorebar>a{order:1;font-size:13px !important;}#scorebar>div{order:2;flex:1 1 140px;justify-content:flex-start !important;min-width:0;}#scorebar>div>span:last-child{font-size:14px;}#scorebar>span:last-child{display:none;}#tv-toggle{order:3;margin-left:auto;background:#1c232d;color:#e6edf3;border:1px solid #314050;border-radius:8px;padding:7px 10px;font:12px Segoe UI,Helvetica,Arial,sans-serif;letter-spacing:.04em;}#tv-drawer{position:sticky;top:48px;z-index:40;background:#0e1116;border-bottom:1px solid #2a3340;max-height:0;overflow:hidden;opacity:0;transform:translateY(-6px);transition:max-height .32s ease,opacity .22s ease,transform .32s ease;}#tv-drawer.open{max-height:190px;opacity:1;transform:none;}nav[aria-label=TradingView]{position:static !important;right:auto !important;top:auto !important;width:100% !important;flex-direction:row !important;flex-wrap:nowrap;gap:8px;overflow-x:auto;padding:10px 12px 0;background:transparent;border:0;}nav[aria-label=TradingView]>p{display:none;}nav[aria-label=TradingView] a{flex:0 0 132px;width:132px;}#tv-collapse{display:grid;place-items:center;width:100%;height:28px;background:transparent;border:0;color:#8b97a6;font-size:16px;} .wrap{padding:18px 14px 80px;} .mast{flex-direction:column;align-items:flex-start;gap:8px;} .meta{text-align:left;min-width:0;} h1{font-size:22px;} h2{font-size:20px;} .lead{padding:14px 14px 4px;} table{display:block;overflow-x:auto;} #pager-dia{left:50% !important;transform:translateX(-50%);bottom:12px;}}";
  document.head.appendChild(css);
  const nav = document.querySelector('nav[aria-label="TradingView"]');
  if (nav && window.matchMedia("(max-width:860px)").matches) {
    const drawer = document.createElement("div");
    drawer.id = "tv-drawer";
    nav.parentNode.insertBefore(drawer, nav);
    drawer.appendChild(nav);
    const close = document.createElement("button");
    close.id = "tv-collapse";
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar gráficos");
    close.textContent = "↑";
    drawer.appendChild(close);
    const toggle = document.createElement("button");
    toggle.id = "tv-toggle";
    toggle.type = "button";
    toggle.textContent = "Gráficos";
    const bar = document.getElementById("scorebar");
    if (bar) bar.appendChild(toggle);
    function setOpen(on) {
      drawer.classList.toggle("open", on);
      toggle.textContent = on ? "Cerrar" : "Gráficos";
    }
    toggle.onclick = () => setOpen(!drawer.classList.contains("open"));
    close.onclick = () => setOpen(false);
  }
  const m = location.pathname.match(/(20\d{2}-\d{2}-\d{2})/);
  if (!m) return;
  const date = m[1];
  const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const NAMES = { NQ: "NQ", ES: "ES", "XAU/USD": "Oro", "Crudo WTI": "WTI", WTI: "WTI", BTC: "BTC" };
  function label(iso) {
    const [y, mo, d] = iso.split("-");
    return Number(d) + " " + MESES[Number(mo) - 1];
  }
  function num(s) { return Number(String(s).replace(/\./g, "").replace(",", ".").replace(/[^\d.\-−]/g, "").replace("−", "-")); }
  function signed(a, b) {
    const d = num(a) - num(b);
    if (!isFinite(d)) return "";
    return (d > 0 ? "+" : "") + d.toLocaleString("es-AR", { maximumFractionDigits: 2 });
  }
  function prices(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const out = {};
    doc.querySelectorAll("tr").forEach(tr => {
      const cells = [...tr.children].map(td => td.textContent.trim());
      const name = NAMES[cells[0]];
      if (name && cells[1]) out[name] = cells[1];
    });
    return out;
  }
  fetch("files.json?t=" + Date.now())
    .then(r => r.json())
    .then(files => {
      const dates = files.filter(n => /^20\d{2}-\d{2}-\d{2}\.html$/.test(n)).map(n => n.slice(0, 10)).sort();
      const i = dates.indexOf(date);
      const prev = i > 0 ? dates[i - 1] : null;
      const next = i >= 0 && i < dates.length - 1 ? dates[i + 1] : null;
      const pager = document.createElement("div");
      pager.id = "pager-dia";
      pager.style.cssText = "position:fixed;z-index:40;display:flex;align-items:center;gap:10px;background:#2a313b;border:1px solid #3c4654;border-radius:10px;padding:7px 8px;font:13px Segoe UI,Helvetica,Arial,sans-serif;color:#f2f4f7;box-shadow:0 10px 28px rgba(0,0,0,.35);";
      function arrow(iso, text) {
        if (!iso) return '<span style="width:30px;height:30px;display:grid;place-items:center;color:#7d8794;">' + text + "</span>";
        return '<a href="' + iso + '.html" style="width:30px;height:30px;display:grid;place-items:center;color:#f2f4f7;text-decoration:none;border-radius:7px;">' + text + "</a>";
      }
      pager.innerHTML = arrow(prev, "←") + '<span style="min-width:68px;text-align:center;letter-spacing:.04em;">' + label(date) + "</span>" + arrow(next, "→");
      document.body.appendChild(pager);
      function place() {
        const col = document.querySelector(".wrap") || document.querySelector("h1");
        const edge = col ? col.getBoundingClientRect().left : 220;
        pager.style.left = Math.max(8, (edge - (pager.offsetWidth || 150)) / 2) + "px";
        pager.style.bottom = "18px";
      }
      place();
      window.addEventListener("resize", place);
      document.addEventListener("keydown", e => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key === "Escape") location.href = "../index.html";
        if (e.key === "ArrowRight" && next) location.href = next + ".html";
        if (e.key === "ArrowLeft" && prev) location.href = prev + ".html";
      });
      if (!prev) return;
      return fetch(prev + ".html").then(r => r.text()).then(html => {
        const a = prices(document.documentElement.outerHTML);
        const b = prices(html);
        const bits = Object.keys(NAMES).filter((k, i, arr) => NAMES[k] && arr.findIndex(x => NAMES[x] === NAMES[k]) === i).map(k => {
          const name = NAMES[k];
          if (!a[name] || !b[name]) return "";
          const d = signed(a[name], b[name]);
          return '<span style="margin-right:14px;">' + name + ' <b style="color:' + (d.startsWith("+") ? "#3dd68c" : "#f07178") + '">' + d + '</b> <span style="color:#8d867c">vs ' + b[name] + "</span></span>";
        }).join("");
        if (!bits) return;
        const bar = document.createElement("div");
        bar.style.cssText = "max-width:980px;margin:0 auto 14px;padding:8px 18px;color:#eceae6;font:13px Segoe UI,Helvetica,Arial,sans-serif;";
        bar.innerHTML = '<span style="color:#8d867c;letter-spacing:.08em;text-transform:uppercase;font-size:11px;margin-right:10px;">Vs ' + label(prev) + "</span>" + bits;
        const wrap = document.querySelector(".wrap");
        if (wrap) wrap.insertBefore(bar, wrap.firstChild);
      });
    })
    .catch(() => {});
})();

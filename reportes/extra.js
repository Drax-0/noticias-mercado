(() => {
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

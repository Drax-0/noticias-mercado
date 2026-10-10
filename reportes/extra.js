(() => {
  document.querySelectorAll("a[data-back]").forEach(a => a.remove());
  const m = location.pathname.match(/(20\d{2}-\d{2}-\d{2})/);
  if (!m) return;
  const date = m[1];
  const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  function label(iso) {
    const [y, mo, d] = iso.split("-");
    return Number(d) + " " + MESES[Number(mo) - 1];
  }
  function num(s) { return Number(String(s).replace(/\./g, "").replace(",", ".").replace(/[^\d.\-]/g, "")); }
  function signed(a, b) {
    const d = num(a) - num(b);
    if (!isFinite(d)) return "";
    return (d > 0 ? "+" : "") + d.toLocaleString("es-AR", { maximumFractionDigits: 2 });
  }
  fetch("manifest.json?v=2", { cache: "no-store" }).then(r => r.json()).then(items => {
    items.sort((a, b) => a.date.localeCompare(b.date));
    const i = items.findIndex(it => it.date === date);
    const prev = i > 0 ? items[i - 1] : null;
    const next = i >= 0 && i < items.length - 1 ? items[i + 1] : null;
    const cur = items[i] || { date: date, levels: {} };
    const fill = {
      "2026-10-06": { NQ: { px: "31.443,50", var: "+0,40%" }, ES: { px: "7.846,00", var: "+0,25%" }, BTC: { px: "86.100", var: "+0,6%" } },
      "2026-10-07": { NQ: { px: "31.325", var: "−0,50%" }, ES: { px: "7.858", var: "−0,21%" }, BTC: { px: "84.100", var: "−1,6%" } },
      "2026-10-08": { NQ: { px: "31.129", var: "−0,87%" }, ES: { px: "7.805", var: "−0,61%" }, BTC: { px: "82.980", var: "−3,0%" } }
    };
    cur.levels = Object.assign({}, fill[date] || {}, cur.levels || {});
    if (cur && prev) {
      const keys = [["NQ","NQ"],["ES","ES"],["XAU/USD","Oro"],["WTI","WTI"],["BTC","BTC"]];
      const bits = keys.map(([k, name]) => {
        const a = cur.levels && cur.levels[k];
        const b = prev.levels && prev.levels[k];
        if (!a || !b) return "";
        const d = signed(a.px, b.px);
        const up = d.startsWith("+");
        return '<span style="margin-right:14px;">' + name + ' <b style="color:' + (up ? "#3dd68c" : "#f07178") + '">' + d + '</b> <span style="color:#8d867c">vs ' + b.px + '</span></span>';
      }).join("");
      const bar = document.createElement("div");
      bar.style.cssText = "max-width:980px;margin:0 auto 14px;padding:8px 18px;color:#eceae6;font:13px Segoe UI,Helvetica,Arial,sans-serif;";
      bar.innerHTML = '<span style="color:#8d867c;letter-spacing:.08em;text-transform:uppercase;font-size:11px;margin-right:10px;">Vs ' + label(prev.date) + '</span>' + bits;
      const wrap = document.querySelector(".wrap");
      if (wrap) wrap.insertBefore(bar, wrap.firstChild);
      else document.body.appendChild(bar);
    }
    const pager = document.createElement("div");
    pager.style.cssText = "position:fixed;z-index:40;display:flex;align-items:center;gap:10px;background:#2a313b;border:1px solid #3c4654;border-radius:10px;padding:7px 8px;font:13px Segoe UI,Helvetica,Arial,sans-serif;color:#f2f4f7;box-shadow:0 10px 28px rgba(0,0,0,.35);";
    function arrow(item, text) {
      if (!item) return '<span style="width:30px;height:30px;display:grid;place-items:center;color:#7d8794;">' + text + '</span>';
      return '<a href="' + item.file + '" style="width:30px;height:30px;display:grid;place-items:center;color:#f2f4f7;text-decoration:none;border-radius:7px;">' + text + '</a>';
    }
    pager.innerHTML = arrow(prev, "←") + '<span style="min-width:68px;text-align:center;letter-spacing:.04em;">' + label(date) + '</span>' + arrow(next, "→");
    pager.id = "pager-dia";
    document.body.appendChild(pager);
    function placePager() {
      const col = document.querySelector(".wrap") || document.querySelector("main") || document.querySelector("h1");
      const w = pager.offsetWidth || 150;
      const edge = col ? col.getBoundingClientRect().left : 220;
      const x = Math.max(8, (edge - w) / 2);
      pager.style.left = x + "px";
      pager.style.top = "auto";
      pager.style.bottom = "18px";
      pager.style.transform = "none";
    }
    placePager();
    window.addEventListener("resize", placePager);
    if (document.getElementById("tv-static")) {
      /* tarjetas ya están en el HTML */
    } else {
    const assets = [
      ["NQ", "Nasdaq", "CME_MINI:NQ1!", "NQ"],
      ["ES", "S&P 500", "CME_MINI:ES1!", "ES"],
      ["ORO", "Oro", "TVC:GOLD", "XAU/USD"],
      ["WTI", "Crudo", "TVC:USOIL", "WTI"],
      ["BTC", "Bitcoin", "BITSTAMP:BTCUSD", "BTC"]
    ];
    const rail = document.createElement("nav");
    rail.setAttribute("aria-label", "TradingView");
    rail.style.cssText = "position:fixed;right:16px;top:88px;z-index:30;width:148px;display:flex;flex-direction:column;gap:8px;font-family:Segoe UI,Helvetica,Arial,sans-serif;";
    rail.innerHTML = '<p style="margin:0 0 2px;color:#8b97a6;font-size:11px;letter-spacing:.06em;text-transform:uppercase;">Tradingview: Gráficos</p>' + assets.map(([ticker, name, symbol, key]) => {
      const lv = cur && cur.levels && cur.levels[key];
      const raw = lv ? lv.var : "";
      const up = raw.indexOf("−") === -1 && raw.indexOf("-") === -1 && raw !== "";
      const color = raw ? (up ? "#3dd68c" : "#f07178") : "#8b97a6";
      const flecha = raw ? (up ? "↑" : "↓") : "";
      return '<a href="https://www.tradingview.com/chart/?symbol=' + encodeURIComponent(symbol) + '" target="_blank" rel="noopener" style="display:block;text-decoration:none;background:#1c232d;border:1px solid #314050;border-radius:10px;padding:10px 12px;color:#e6edf3;"><span style="display:block;font-size:13px;letter-spacing:.08em;">' + ticker + '</span><span style="display:block;margin-top:2px;color:#8b97a6;font-size:12px;">' + name + '</span><span style="display:block;margin-top:8px;color:' + color + ';font-size:14px;font-variant-numeric:tabular-nums;">' + flecha + ' ' + raw + '</span></a>';
    }).join("");
    document.body.appendChild(rail);
    const style = document.createElement("style");
    style.textContent = '@media(max-width:860px){nav[aria-label="TradingView"]{position:sticky;top:42px;right:auto;width:auto;flex-direction:row;flex-wrap:wrap;padding:10px 18px;background:#0e1116;border-bottom:1px solid #2a3340;}nav[aria-label="TradingView"] a{width:140px;}}';
    document.head.appendChild(style);
    }
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "Escape") location.href = "../index.html";
      if (e.key === "ArrowRight" && next) location.href = next.file;
      if (e.key === "ArrowLeft" && prev) location.href = prev.file;
    });
  }).catch(() => {});
})();

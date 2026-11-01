(() => {
  const root = document.documentElement;
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const raf = requestAnimationFrame;
  const NS = "http://www.w3.org/2000/svg";

  function onReady(fn) {
    if (root.classList.contains("ready")) return fn();
    const mo = new MutationObserver(() => {
      if (root.classList.contains("ready")) { mo.disconnect(); fn(); }
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
  }

  function initChrome() {
    const bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.prepend(bar);

    const head = q(".site-head");
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max) : 0);
      head && head.classList.toggle("is-scrolled", scrollY > 12);
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; raf(update); } }, { passive: true });
    update();

    if (!fine || reduce) return;
    const ring = document.createElement("div");
    ring.className = "cursor";
    ring.setAttribute("aria-hidden", "true");
    document.body.append(ring);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      ring.classList.add("on");
      ring.classList.toggle("hot", !!e.target.closest("a,button,.card,.list li"));
    }, { passive: true });
    document.addEventListener("pointerleave", () => ring.classList.remove("on"));
    const loop = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf(loop);
    };
    loop();
  }

  function initHeroTitle() {
    const title = q("#titre");
    if (!title) return;
    const label = title.textContent.replace(/\s+/g, " ").trim();
    const frag = document.createDocumentFragment();
    let count = 0;
    const total = label.replace(/[\s/]/g, "").length;

    [...title.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(" ")); return; }
          const word = document.createElement("span");
          word.className = "word";
          word.setAttribute("aria-hidden", "true");
          [...part].forEach((c) => {
            const s = document.createElement("span");
            s.className = "ch";
            s.textContent = c;
            s.style.setProperty("--i", count);
                        count++;
            word.append(s);
          });
          frag.append(word);
        });
      } else {
        const wrap = document.createElement("span");
        wrap.className = "rise";
        wrap.style.cssText = "--d:350;display:inline-block";
        wrap.setAttribute("aria-hidden", "true");
        wrap.append(node);
        frag.append(wrap);
      }
    });

    title.textContent = "";
    title.setAttribute("aria-label", label);
    title.append(frag);
  }

  function initMarquee() {
    const track = q("#marquee");
    if (!track) return;
    const names = ((window.SITE && window.SITE.projets) || []).map((p) => p.nom).filter(Boolean);
    if (!names.length) { track.closest(".marquee").hidden = true; return; }
    const make = () => names.map((n) => { const s = document.createElement("span"); s.textContent = n; return s; });
    track.append(...make(), ...make(), ...make(), ...make());
    track.style.animationDuration = Math.max(26, names.length * 6) + "s";
  }

  function initCardFx() {
    qa(".card").forEach((card) => {
      const a = document.createElementNS(NS, "svg");
      a.setAttribute("viewBox", "0 0 24 24");
      a.setAttribute("width", "16");
      a.setAttribute("height", "16");
      a.innerHTML = '<path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
      const wrap = document.createElement("span");
      wrap.className = "arrow";
      wrap.setAttribute("aria-hidden", "true");
      wrap.append(a);
      card.append(wrap);
    });
  }

  function initMagnetic() {
    if (!fine || reduce) return;
    qa(".cta .btn, .contact-card .btn, .head-actions .btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--tx", (e.clientX - r.left - r.width / 2) * 0.22 + "px");
        btn.style.setProperty("--ty", (e.clientY - r.top - r.height / 2) * 0.3 + "px");
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.setProperty("--tx", "0px");
        btn.style.setProperty("--ty", "0px");
      });
    });
  }

  function countUp(node, delay) {
    const end = parseInt(node.textContent, 10);
    if (isNaN(end) || end < 1 || reduce) return;
    const t0 = performance.now() + delay;
    node.textContent = "0";
    const step = (t) => {
      if (t < t0) return raf(step);
      const p = Math.min(1, (t - t0) / 1300);
      node.textContent = Math.round((1 - Math.pow(1 - p, 4)) * end);
      if (p < 1) raf(step);
    };
    raf(step);
  }

  function initCounters() {
    const ids = ["stat-projects", "stat-bots", "stat-results", "dc-projets", "dc-resultats"];
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!nodes.length) return;
    onReady(() => nodes.forEach((n, i) => countUp(n, 500 + i * 110)));
  }

  function initReveal() {
    qa("[data-reveal]").forEach((sec) => {
      qa(".card, .list li, .contact-card", sec).forEach((n, i) => n.style.setProperty("--i", Math.min(i, 9)));
    });
    const legal = qa(".legal > *");
    if (!legal.length) return;
    legal.forEach((n, i) => { n.setAttribute("data-reveal", ""); n.style.setProperty("--i", Math.min(i, 6)); });
    if (!("IntersectionObserver" in window)) { legal.forEach((n) => n.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    legal.forEach((n) => io.observe(n));
  }

  function initThemeAnim() {
    const btn = q("#theme");
    btn && btn.addEventListener("click", () => {
      root.classList.add("theme-anim");
      setTimeout(() => root.classList.remove("theme-anim"), 700);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    [initChrome, initHeroTitle, initMarquee, initCardFx, initMagnetic, initCounters, initReveal, initThemeAnim]
      .forEach((fn) => { try { fn(); } catch (err) { console.error(fn.name, err); } });
  });
})();

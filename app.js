const SITE = window.SITE || {
  profil: {
    nom: "Primary Asset",
    pseudo: "@primary-asset",
    discordId: "1156589290252419212",
    accroche: "",
    langue: "FR",
  },
  projets: [],
  bots: [],
  resultats: [],
};

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

const q = (sel, root = document) => root.querySelector(sel);
const qa = (sel, root = document) => [...root.querySelectorAll(sel)];

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

const pad = (n, size = 2) => String(n).padStart(size, "0");

function linkFor(value) {
  const raw = (value || "").trim();
  if (!raw) return `https://discord.com/users/${SITE.profil.discordId}`;
  return raw;
}

function isExternal(url) {
  return /^https?:\/\//i.test(url);
}

function decorateLink(node, url) {
  node.href = url;
  node.rel = "noopener";
  if (isExternal(url)) {
    node.target = "_blank";
    node.append(el("span", "sr-only", " (nouvel onglet)"));
  }
  return node;
}

function renderProfile() {
  const { nom, pseudo, discordId, accroche, langue } = SITE.profil;

  const title = q("#titre");
  if (title) {
    const words = String(nom).trim().split(/\s+/).filter(Boolean);
    title.textContent = "";
    if (words.length > 1) {
      title.append(document.createTextNode(words[0] + " "));
      title.append(el("span", "slash", "/"));
      title.append(document.createTextNode(" " + words.slice(1).join(" ")));
    } else {
      title.textContent = words[0] || "";
    }
  }

  const lede = q("#accroche");
  if (lede && accroche) lede.textContent = accroche;

  const pseudoNode = q("#pseudo");
  if (pseudoNode) pseudoNode.textContent = pseudo;

  const idNode = q("#badge-id");
  if (idNode) idNode.textContent = discordId;

  const contactId = q("#discord-id");
  if (contactId) contactId.textContent = discordId;

  const footId = q("#foot-id");
  if (footId) footId.textContent = discordId;

  const copy = q("#copy");
  if (copy) copy.dataset.copy = discordId;

  const lang = q("#stat-langue");
  if (lang) lang.textContent = langue;

  const url = `https://discord.com/users/${discordId}`;
  qa("[data-discord]").forEach((node) => {
    node.href = url;
    node.rel = "me noopener";
  });
}

function cdnUrl(kind, hash, size) {
  const id = SITE.profil.discordId;
  if (!hash || !id) return "";
  return `https://cdn.discordapp.com/${kind}/${id}/${hash}.webp?size=${size}`;
}

function mediaSrc(value, kind, size) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.includes("/")) return raw;
  return cdnUrl(kind, raw, size);
}

function renderCard() {
  const c = SITE.carte || {};
  const set = (sel, value) => {
    const node = q(sel);
    if (node && value != null) node.textContent = value;
  };

  const banner = mediaSrc(c.banniere, "banners", 1024);
  const avatar = mediaSrc(c.avatar, "avatars", 256);

  const bannerNode = q("#dc-banner");
  const card = q(".dcard");

  const paintBanner = () => {
    if (!bannerNode || !banner) return;
    bannerNode.style.backgroundImage = `url("${banner}")`;
    const probe = new Image();
    probe.onerror = () => {
      bannerNode.style.backgroundImage = "";
    };
    probe.src = banner;
  };

  if (card && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          paintBanner();
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(card);
    setTimeout(() => {
      paintBanner();
      io.disconnect();
    }, 2500);
  } else {
    paintBanner();
  }

  const avatarNode = q("#dc-avatar");
  if (avatarNode) {
    avatarNode.setAttribute("aria-label", `Avatar Discord de ${SITE.profil.nom}`);
    if (avatar) {
      avatarNode.style.backgroundImage = `url("${avatar}")`;
      const probe = new Image();
      probe.onerror = () => {
        avatarNode.style.backgroundImage = "";
      };
      probe.src = avatar;
    }
  }

  set("#dc-name", SITE.profil.nom);
  set("#dc-handle", SITE.profil.pseudo);
  set("#dc-id", SITE.profil.discordId);
  set("#dc-statut", c.statut || "HORS LIGNE");
  set("#dc-state", c.statut || "HORS LIGNE");
  set("#dc-tag", c.tag ? `🇫🇷 ${c.tag}` : "");
  set("#dc-role", c.role || "Non renseigné");
  set("#dc-serveur", c.serveur || "Non renseigné");
  set("#dc-membres", c.membres ? `${c.membres}${c.enLigne ? `, ${c.enLigne} en ligne` : ""}` : "Non renseigné");
  set("#dc-connexion", c.connexion || "Non renseigné");
  set("#dc-langue", SITE.profil.langue);

  const online = /en ligne|online/i.test(c.statut || "");
  q("#dc-dot")?.classList.toggle("is-on", online);
  q("#dc-state")?.classList.toggle("is-on", online);

  set("#dc-projets", SITE.projets.length);
  set("#dc-resultats", SITE.resultats.length);
}

function initClock() {
  const dateNode = q("#dc-date");
  const timeNode = q("#dc-time");
  if (!dateNode || !timeNode) return;

  const tick = () => {
    const now = new Date();
    dateNode.textContent = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    timeNode.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  tick();
  setInterval(tick, 1000);
}

const LANYARD_URL = "https://api.lanyard.rest/v1/users/";

const LIVE_STATUS = {
  online: { label: "EN LIGNE", color: "#3ddc97" },
  idle: { label: "INACTIF", color: "#f0b232" },
  dnd: { label: "NE PAS DÉRANGER", color: "#f23f43" },
  offline: { label: "HORS LIGNE", color: "#8b9aab" },
};

let liveTimer = null;

async function fetchPresence() {
  const res = await fetch(LANYARD_URL + SITE.profil.discordId, { cache: "no-store" });
  if (!res.ok) throw new Error(`Lanyard ${res.status}`);
  const payload = await res.json();
  if (!payload.success || !payload.data) throw new Error("Lanyard indisponible");
  return payload.data;
}

function paintPresence(data) {
  const status = LIVE_STATUS[data.discord_status] || LIVE_STATUS.offline;

  const statut = q("#dc-statut");
  if (statut) {
    statut.textContent = status.label;
    statut.style.color = status.color;
  }

  const state = q("#dc-state");
  if (state) {
    state.textContent = status.label;
    state.style.color = status.color;
  }

  const dot = q("#dc-dot");
  if (dot) {
    dot.style.background = status.color;
    dot.classList.toggle("is-on", data.discord_status !== "offline");
  }

  q(".dcard-live")?.classList.toggle("is-off", data.discord_status === "offline");

  const activities = data.activities || [];
  const current = activities.find((item) => item.type !== 2 && item.type !== 4 && item.name);
  const custom = activities.find((item) => item.type === 4);

  let activite = "Aucune";
  if (data.listening_to_spotify && data.spotify) {
    const { song, artist } = data.spotify;
    activite = song && artist ? `Spotify : ${song}, ${artist}` : "Spotify";
  } else if (current) {
    activite = current.name;
  } else if (custom && custom.state) {
    activite = custom.state;
  }

  const label = q("#dc-connexion-k");
  if (label) label.textContent = "Activité";

  const value = q("#dc-connexion");
  if (value) value.textContent = activite;

  const text = q("#dc-live-text");
  if (text) {
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    text.textContent = `Direct ${time}`;
  }
}

function resetPresence() {
  const c = SITE.carte || {};

  const statut = q("#dc-statut");
  if (statut) {
    statut.textContent = c.statut || "HORS LIGNE";
    statut.style.color = "";
  }

  const state = q("#dc-state");
  if (state) {
    state.textContent = c.statut || "HORS LIGNE";
    state.style.color = "";
    state.classList.toggle("is-on", /en ligne|online/i.test(c.statut || ""));
  }

  const dot = q("#dc-dot");
  if (dot) {
    dot.style.background = "";
    dot.classList.toggle("is-on", /en ligne|online/i.test(c.statut || ""));
  }

  q(".dcard-live")?.classList.remove("is-off");

  const label = q("#dc-connexion-k");
  if (label) label.textContent = "Dernière connexion";

  const value = q("#dc-connexion");
  if (value) value.textContent = c.connexion || "Non renseigné";
}

async function refreshPresence(first = false) {
  try {
    paintPresence(await fetchPresence());
  } catch {
    if (!first) return;
    stopPresence(true);
    const text = q("#dc-live-text");
    if (text) text.textContent = "Direct indisponible";
    setTimeout(() => {
      const node = q("#dc-live-text");
      if (node) node.textContent = "Activer le statut en direct";
    }, 2600);
  }
}

function startPresence(persist = true) {
  const btn = q("#dc-live-toggle");
  if (!btn) return;

  btn.setAttribute("aria-pressed", "true");
  if (persist) store.set("pa-live", "1");

  const text = q("#dc-live-text");
  if (text) text.textContent = "Connexion au direct…";

  refreshPresence(true);

  clearInterval(liveTimer);
  liveTimer = setInterval(() => {
    if (!document.hidden) refreshPresence();
  }, 30000);
}

function stopPresence(keepLabel = false) {
  const btn = q("#dc-live-toggle");
  if (btn) btn.setAttribute("aria-pressed", "false");

  clearInterval(liveTimer);
  liveTimer = null;
  store.del("pa-live");
  resetPresence();

  if (!keepLabel) {
    const text = q("#dc-live-text");
    if (text) text.textContent = "Activer le statut en direct";
  }
}

function initPresence() {
  const btn = q("#dc-live-toggle");
  if (!btn) return;

  if (!("fetch" in window)) {
    btn.hidden = true;
    return;
  }

  btn.addEventListener("click", () => {
    const active = btn.getAttribute("aria-pressed") === "true";
    if (active) stopPresence();
    else startPresence();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && liveTimer) refreshPresence();
  });

  if (store.get("pa-live") === "1") startPresence(false);
}

function renderProjects() {
  const host = q("#projects");
  if (!host) return;

  host.textContent = "";
  const frag = document.createDocumentFragment();

  SITE.projets.forEach((project, i) => {
    const url = linkFor(project.lien);
    const card = decorateLink(el("a", "card"), url);

    const name = project.nom || "Sans titre";
    const hue = [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 360, 7);
    const top = el("div", "card-top");
    const mark = el("span", "mark", name.trim().charAt(0).toUpperCase());
    mark.style.setProperty("--h", hue);
    top.append(mark, el("h3", null, name));
    card.append(top);

    const empty = !String(project.bio || "").trim();
    const bio = el("p", empty ? "bio is-empty" : "bio", empty ? "Bio à venir." : project.bio);
    card.append(bio);

    const tags = (project.tags || []).filter(Boolean);
    if (tags.length) {
      const row = el("div", "tags");
      tags.forEach((tag) => row.append(el("span", null, tag)));
      card.append(row);
    }

    if (isExternal(url)) {
      try { card.append(el("span", "host", new URL(url).hostname.replace(/^www\./, ""))); } catch {}
    }

    frag.append(card);
  });

  host.append(frag);

  const stat = q("#stat-projects");
  if (stat) stat.textContent = SITE.projets.length;
}

function renderBots() {
  const host = q("#bots-list");
  if (!host) return;

  host.textContent = "";
  const frag = document.createDocumentFragment();

  SITE.bots.forEach((bot, i) => {
    const project = SITE.projets.find((p) => p.nom === bot.nom);
    const url = project && project.lien ? project.lien : "";
    const li = el("li");
    const body = el("div");

    const title = el("b");
    if (url) title.append(decorateLink(el("a", "name", bot.nom || "Sans nom"), url));
    else title.textContent = bot.nom || "Sans nom";
    body.append(title);
    body.append(el("small", null, bot.detail || ""));

    li.append(el("span", "n", pad(i + 1)));
    li.append(body);
    li.append(url ? decorateLink(el("a", "go", "Voir"), url) : el("span", "go", ""));
    frag.append(li);
  });

  host.append(frag);

  const stat = q("#stat-bots");
  if (stat) stat.textContent = SITE.bots.length;
}

function renderResults() {
  const host = q("#results-list");
  if (!host) return;

  host.textContent = "";
  const frag = document.createDocumentFragment();

  SITE.resultats.forEach((result, i) => {
    const url = linkFor(result.lien);
    const li = el("li");
    const body = el("div");

    body.append(decorateLink(el("a", "name", result.titre || "Sans titre"), url));
    body.append(el("small", null, result.detail || ""));

    const labels = String(result.etiquette || "").split(",").map((t) => t.trim()).filter(Boolean);
    if (labels.length) {
      const row = el("div", "tags res-tags");
      labels.forEach((t) => row.append(el("span", null, t)));
      body.append(row);
    }

    li.append(el("span", "n", pad(i + 1, 3)));
    li.append(body);
    li.append(decorateLink(el("a", "go", "Voir"), url));
    frag.append(li);
  });

  host.append(frag);

  const stat = q("#stat-results");
  if (stat) stat.textContent = SITE.resultats.length;
}

function initTheme() {
  const root = document.documentElement;
  const btn = q("#theme");
  const stored = store.get("pa-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

  root.dataset.theme = stored || (prefersLight ? "light" : "dark");
  btn?.setAttribute("aria-label", root.dataset.theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre");

  btn?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    store.set("pa-theme", next);
    btn.setAttribute(
      "aria-label",
      next === "dark" ? "Passer en thème clair" : "Passer en thème sombre"
    );
  });
}

function initCopy() {
  const btn = q("#copy");
  if (!btn) return;

  const initial = btn.textContent;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy || SITE.profil.discordId);
      btn.textContent = "Copié";
    } catch {
      btn.textContent = "Ctrl+C";
    }
    setTimeout(() => {
      btn.textContent = initial;
    }, 1600);
  });
}

function initBoot() {
  const root = document.documentElement;
  const boot = q("#boot");
  const ready = () => root.classList.add("ready");
  if (!boot) { ready(); return; }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    boot.classList.add("is-done");
    setTimeout(ready, 300);
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finished = true;
    boot.classList.add("is-done");
    ready();
    return;
  }

  const word = q(".boot-word", boot);
  let n = 0;
  const wrapLetters = (text) => {
    const frag = document.createDocumentFragment();
    [...text].forEach((c) => {
      if (c === " ") { frag.append(document.createTextNode(" ")); return; }
      const s = el("span", null, c);
      s.style.setProperty("--i", n++);
      frag.append(s);
    });
    return frag;
  };
  [...word.childNodes].forEach((node) => {
    if (node.nodeType === 3) node.replaceWith(wrapLetters(node.textContent));
    else { const t = node.textContent; node.textContent = ""; node.append(wrapLetters(t)); }
  });

  const bar = q(".boot-bar i", boot);
  const count = q("#boot-count", boot);
  const dur = 1500;
  const t0 = performance.now();
  const tick = (t) => {
    if (finished) return;
    const p = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    if (bar) bar.style.setProperty("--bp", e.toFixed(3));
    count.textContent = Math.round(e * 100) + "%";
    if (p < 1) requestAnimationFrame(tick);
    else setTimeout(finish, 180);
  };
  requestAnimationFrame(tick);
  boot.addEventListener("click", finish);
}

function initReveal() {
  const targets = qa("[data-reveal]");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );

  targets.forEach((t) => io.observe(t));
}

function initNavSpy() {
  const links = qa(".nav a[href^='#']");
  if (!links.length || !("IntersectionObserver" in window)) return;

  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.removeAttribute("aria-current"));
        map.get(entry.target.id)?.setAttribute("aria-current", "true");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  map.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) io.observe(section);
  });
}

const str = (v) => JSON.stringify(v == null ? "" : String(v));

function serializeSite(site) {
  const p = site.profil;
  const c = site.carte || {};

  const projects = site.projets
    .map(
      (item) => `    {
      nom: ${str(item.nom)},
      bio: ${str(item.bio)},
      tags: [${(item.tags || []).filter(Boolean).map(str).join(", ")}],
      lien: ${str(item.lien)},
    },`
    )
    .join("\n");

  const bots = site.bots
    .map((item) => `    { nom: ${str(item.nom)}, detail: ${str(item.detail)} },`)
    .join("\n");

  const results = site.resultats
    .map(
      (item) => `    {
      titre: ${str(item.titre)},
      detail: ${str(item.detail)},
      lien: ${str(item.lien)},
      etiquette: ${str(item.etiquette)},
    },`
    )
    .join("\n");

  return `window.SITE = {
  profil: {
    nom: ${str(p.nom)},
    pseudo: ${str(p.pseudo)},
    discordId: ${str(p.discordId)},
    accroche:
      ${str(p.accroche)},
    langue: ${str(p.langue)},
  },

  carte: {
    label: ${str(c.label)},
    tag: ${str(c.tag)},
    role: ${str(c.role)},
    serveur: ${str(c.serveur)},
    membres: ${str(c.membres)},
    enLigne: ${str(c.enLigne)},
    statut: ${str(c.statut)},
    connexion: ${str(c.connexion)},
    avatar: ${str(c.avatar)},
    banniere: ${str(c.banniere)},
  },

  projets: [
${projects}
  ],

  bots: [
${bots}
  ],

  resultats: [
${results}
  ],
};
`;
}

function openEditor() {
  const state = JSON.parse(JSON.stringify(SITE));

  const overlay = el("div", "editor-overlay");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Édition du contenu");

  const panel = el("div", "editor-panel");

  const head = el("div", "editor-head");
  head.append(el("h2", null, "Édition rapide"));
  head.append(
    el("p", "editor-sub", "Modifie les textes, puis télécharge content.js et remplace l'ancien fichier.")
  );
  const close = el("button", "editor-close", "✕");
  close.type = "button";
  close.setAttribute("aria-label", "Fermer");
  close.addEventListener("click", () => overlay.remove());
  head.append(close);

  const body = el("div", "editor-body");

  const profileBlock = el("fieldset", "editor-group");
  profileBlock.append(el("legend", null, "Profil"));

  const mkInput = (label, value, opts = {}) => {
    const wrap = el("label", "editor-field");
    wrap.append(el("span", null, label));
    const input = opts.multiline ? el("textarea") : el("input");
    if (opts.multiline) input.rows = 3;
    else input.type = "text";
    input.value = value ?? "";
    input.dataset.key = opts.key || "";
    wrap.append(input);
    return { wrap, input };
  };

  const nom = mkInput("Nom affiché", state.profil.nom);
  const pseudo = mkInput("Pseudo", state.profil.pseudo);
  const discordId = mkInput("ID Discord", state.profil.discordId);
  const accroche = mkInput("Phrase d'accueil", state.profil.accroche, { multiline: true });
  profileBlock.append(nom.wrap, pseudo.wrap, discordId.wrap, accroche.wrap);
  body.append(profileBlock);

  const projectsBlock = el("fieldset", "editor-group");
  projectsBlock.append(el("legend", null, "Projets"));
  const projectsList = el("div", "editor-projects");
  projectsBlock.append(projectsList);

  const addProjectRow = (project = { nom: "", bio: "", tags: [], lien: "" }) => {
    const row = el("div", "editor-project");

    const rowHead = el("div", "editor-project-head");
    const nameWrap = mkInput("Nom du projet", project.nom);
    const remove = el("button", "btn btn-sm editor-remove", "Retirer");
    remove.type = "button";
    remove.addEventListener("click", () => row.remove());
    rowHead.append(nameWrap.wrap, remove);

    const bio = mkInput("Bio", project.bio, { multiline: true });
    const tags = mkInput("Tags (séparés par des virgules)", (project.tags || []).join(", "));
    const lien = mkInput("Lien (vide = profil Discord)", project.lien);

    row.append(rowHead, bio.wrap, tags.wrap, lien.wrap);
    row._data = { nameInput: nameWrap.input, bioInput: bio.input, tagsInput: tags.input, lienInput: lien.input };
    projectsList.append(row);
  };

  state.projets.forEach((project) => addProjectRow(project));
  body.append(projectsBlock);

  const addBtn = el("button", "btn btn-sm", "+ Ajouter un projet");
  addBtn.type = "button";
  addBtn.addEventListener("click", () => {
    addProjectRow();
    projectsList.lastElementChild.querySelector("input").focus();
  });
  projectsBlock.append(addBtn);

  const actions = el("div", "editor-actions");
  const download = el("button", "btn btn-primary", "Télécharger content.js");
  const copyAll = el("button", "btn", "Copier le code");
  const reset = el("button", "btn btn-ghost", "Annuler");

  const collect = () => {
    const next = JSON.parse(JSON.stringify(state));

    next.profil.nom = nom.input.value.trim();
    next.profil.pseudo = pseudo.input.value.trim();
    next.profil.discordId = discordId.input.value.trim();
    next.profil.accroche = accroche.input.value.trim();

    next.projets = [...projectsList.children].map((row) => ({
      nom: row._data.nameInput.value.trim(),
      bio: row._data.bioInput.value.trim(),
      tags: row._data.tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      lien: row._data.lienInput.value.trim(),
    })).filter((p) => p.nom || p.bio);

    return next;
  };

  download.type = "button";
  download.addEventListener("click", () => {
    const code = serializeSite(collect());
    const blob = new Blob([code], { type: "text/javascript;charset=utf-8" });
    const a = el("a");
    a.href = URL.createObjectURL(blob);
    a.download = "content.js";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    download.textContent = "Téléchargé ✓";
    setTimeout(() => {
      download.textContent = "Télécharger content.js";
    }, 2200);
  });

  copyAll.type = "button";
  copyAll.addEventListener("click", async () => {
    const code = serializeSite(collect());
    try {
      await navigator.clipboard.writeText(code);
      copyAll.textContent = "Copié ✓";
    } catch {
      copyAll.textContent = "Copie impossible";
    }
    setTimeout(() => {
      copyAll.textContent = "Copier le code";
    }, 2000);
  });

  reset.type = "button";
  reset.addEventListener("click", () => overlay.remove());

  actions.append(download, copyAll, reset);
  body.append(actions);

  panel.append(head, body);
  overlay.append(panel);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  const onKey = (e) => {
    if (e.key === "Escape") overlay.remove();
  };
  document.addEventListener("keydown", onKey);
  new MutationObserver((_, obs) => {
    if (!overlay.isConnected) {
      document.removeEventListener("keydown", onKey);
      obs.disconnect();
    }
  }).observe(document.body, { childList: true });

  document.body.append(overlay);
  nom.input.focus();

  window.__serializeSite = serializeSite;
}

document.addEventListener("DOMContentLoaded", () => {
  // Chaque bloc est isolé : une erreur dans l'un ne bloque plus le reste de la page.
  [
    renderProfile, renderCard, renderProjects, renderBots, renderResults,
    initTheme, initCopy, initBoot, initReveal, initNavSpy, initClock, initPresence,
  ].forEach((fn) => {
    try { fn(); } catch (err) { console.error(fn.name, err); }
  });

  const year = q("#year");
  if (year) year.textContent = new Date().getFullYear();

  if (location.hash.replace("#", "").toLowerCase() === "edition") openEditor();
});

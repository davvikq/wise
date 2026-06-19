(() => {
  "use strict";

  const state = {
    lang: "en",
    theme: "dark",
    authorId: "all",
    current: null,

    font: { ru: "instrument", en: "instrument" },
    sizeFactor: 1,
    align: "left",
    kicker: true,
    nick: "",
    custom: { bg: null, text: null, accent: null },
  };

  const THEMES = {
    dark: {
      bgFrom: "#16181d", bgTo: "#0c0d10",
      quote: "#f4f1ea", name: "#ece8dc", meta: "#7f828c", accent: "#6a8eff",
      faint: "rgba(255,255,255,0.13)",
    },
    cream: {
      bgFrom: "#f3ebd8", bgTo: "#e6dabf",
      quote: "#1c1a14", name: "#2a261c", meta: "#736a59", accent: "#b07a2a",
      faint: "rgba(0,0,0,0.16)",
    },
    blue: {
      bgFrom: "#1c3a8f", bgTo: "#2c57cc",
      quote: "#ffffff", name: "#ffffff", meta: "rgba(255,255,255,0.72)", accent: "#cdd9ff",
      faint: "rgba(255,255,255,0.26)",
    },
  };

  const FONTS = {

    instrument:  { weight: 400, lh: 1.16, stack: '"Instrument Serif", "PT Serif", Georgia, serif', label: null },
    playfair:    { weight: 600, lh: 1.18, stack: '"Playfair Display", Georgia, serif', label: "Playfair Display" },
    ptserif:     { weight: 700, lh: 1.3,  stack: '"PT Serif", Georgia, serif', label: "PT Serif" },
    lora:        { weight: 600, lh: 1.3,  stack: '"Lora", Georgia, serif', label: "Lora" },
    forum:       { weight: 400, lh: 1.22, stack: '"Forum", Georgia, serif', label: "Forum" },
    segoescript: { weight: 400, lh: 1.34, stack: '"Segoe Script", "Palatino Linotype", "Brush Script MT", cursive', label: "Segoe Script" },
    ebgaramond:  { weight: 600, lh: 1.22, stack: '"EB Garamond", Georgia, serif', label: "EB Garamond" },
    sourceserif: { weight: 600, lh: 1.26, stack: '"Source Serif 4", Georgia, serif', label: "Source Serif 4" },
    librebodoni: { weight: 600, lh: 1.2,  stack: '"Libre Bodoni", Georgia, serif', label: "Libre Bodoni" },
    literata:    { weight: 500, lh: 1.3,  stack: '"Literata", Georgia, serif', label: "Literata" },
    oldstandard: { weight: 700, lh: 1.3,  stack: '"Old Standard TT", Georgia, serif', label: "Old Standard TT" },
  };

  const FONT_LISTS = {
    ru: ["instrument", "playfair", "ptserif", "lora", "forum", "segoescript"],
    en: ["instrument", "playfair", "ebgaramond", "sourceserif", "librebodoni", "literata", "oldstandard"],
  };

  const currentFont = () => FONTS[state.font[state.lang]] || FONTS.instrument;

  const SYSTEM_FONTS = ["Georgia", "Segoe Script", "Palatino Linotype", "Brush Script MT"];
  async function ensureFont(f) {
    const fams = (f.stack.match(/"([^"]+)"/g) || [])
      .map((s) => s.replace(/"/g, ""))
      .filter((n) => !SYSTEM_FONTS.includes(n));
    try {
      await Promise.all(fams.map((n) => document.fonts.load(`${f.weight} 80px "${n}"`)));
    } catch (e) {}
  }

  function hexA(hex, a) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }

  function palette() {
    if (state.theme === "custom") {
      const c = state.custom;
      const bg = c.bg || "#16181d";
      const text = c.text || "#f4f1ea";
      const accent = c.accent || "#6a8eff";
      return {
        bgFrom: bg, bgTo: bg, quote: text, name: text,
        meta: hexA(text, 0.62), accent, faint: hexA(text, 0.16),
      };
    }
    return THEMES[state.theme];
  }

  const I18N = {
    ru: {
      docTitle: "Цитаты великих — мудрость в одну картинку",
      brand: 'цитаты<span class="brand-dim">.выдача</span>',
      eyebrow: "— МУДРОСТЬ ВЕКОВ",
      title: "Цитаты <em>великих</em>",
      subtitle: "Выберите мыслителя — цитата станет картинкой, готовой поделиться.",
      random: "Случайная цитата",
      download: "Скачать PNG",
      copy: "Копировать",
      copied: "Скопировано ✓",
      skip: "К содержимому",
      allChip: "Все",
      theme_dark: "Тёмный", theme_cream: "Бумага", theme_blue: "Синий",
      foot_authors: "АВТОРОВ", foot_quotes: "ЦИТАТ", foot_format: "ФОРМАТ",
      disclaimer: "Формулировки могут отличаться от отдельных изданий и переводов.",
      aria_lang: "Язык цитат", aria_picker: "Выбор автора",
      aria_canvas: "Картинка с цитатой", aria_theme: "Фон картинки",
      customize: "Настроить", c_font: "Шрифт", c_size: "Размер",
      c_align: "Выравнивание", c_colors: "Цвета", c_bg: "Фон",
      c_text: "Текст", c_accent: "Акцент", c_nick: "Ваш ник",
      c_reset: "Сбросить настройки", font_original: "Оригинал",
      c_kicker: "Метка", c_kicker_show: "Показывать «Цитата»",
      al_left: "Слева", al_center: "По центру", al_right: "Справа",
    },
    en: {
      docTitle: "Great Minds, Quoted — wisdom in one image",
      brand: 'quotes<span class="brand-dim">.feed</span>',
      eyebrow: "— WISDOM OF THE AGES",
      title: "Words of the <em>wise</em>",
      subtitle: "Pick a thinker — the quote becomes an image, ready to share.",
      random: "Random quote",
      download: "Download PNG",
      copy: "Copy",
      copied: "Copied ✓",
      skip: "Skip to content",
      allChip: "All",
      theme_dark: "Dark", theme_cream: "Paper", theme_blue: "Blue",
      foot_authors: "AUTHORS", foot_quotes: "QUOTES", foot_format: "FORMAT",
      disclaimer: "Wording may differ between editions and translations.",
      aria_lang: "Quote language", aria_picker: "Choose author",
      aria_canvas: "Quote image", aria_theme: "Card background",
      customize: "Customize", c_font: "Font", c_size: "Size",
      c_align: "Alignment", c_colors: "Colors", c_bg: "Bg",
      c_text: "Text", c_accent: "Accent", c_nick: "Your handle",
      c_reset: "Reset settings", font_original: "Original",
      c_kicker: "Label", c_kicker_show: "Show “Quote”",
      al_left: "Left", al_center: "Center", al_right: "Right",
    },
  };

  function applyI18n() {
    const t = I18N[state.lang];
    document.documentElement.lang = state.lang;
    document.title = t.docTitle;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = t[el.dataset.i18n];
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const v = t[el.dataset.i18nHtml];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const v = t[el.dataset.i18nTitle];
      if (v != null) el.setAttribute("title", v);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const v = t[el.dataset.i18nAria];
      if (v != null) el.setAttribute("aria-label", v);
    });
  }

  const canvas = document.getElementById("quoteCanvas");
  const ctx = canvas.getContext("2d");
  const chipsEl = document.getElementById("authorChips");
  const randomBtn = document.getElementById("randomBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const copyBtn = document.getElementById("copyBtn");
  const customizeToggle = document.getElementById("customizeToggle");
  const customPanel = document.getElementById("customPanel");
  const fontSelect = document.getElementById("fontSelect");
  const sizeRange = document.getElementById("sizeRange");
  const alignToggle = document.getElementById("alignToggle");
  const bgColor = document.getElementById("bgColor");
  const textColor = document.getElementById("textColor");
  const accentColor = document.getElementById("accentColor");
  const nickInput = document.getElementById("nickInput");
  const kickerToggle = document.getElementById("kickerToggle");
  const resetBtn = document.getElementById("resetBtn");

  const W = 1920;
  const H = 1080;

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function authorPool() {
    if (state.authorId === "all") return ALL_QUOTES;
    const a = AUTHORS.find((x) => x.id === state.authorId);
    return a.quotes.map((q) => ({ author: a, quote: q }));
  }

  function nextQuote() {
    const pool = authorPool();
    if (pool.length === 1) return pool[0];
    let next = pick(pool);

    let guard = 0;
    while (state.current && next.quote === state.current.quote && guard++ < 8) {
      next = pick(pool);
    }
    return next;
  }

  function wrapText(text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function fitQuote(text, maxWidth, maxHeight) {
    const f = currentFont();
    let fontSize = 124;
    const minSize = 40;
    let lines = [];
    while (fontSize >= minSize) {
      ctx.font = `${f.weight} ${fontSize}px ${f.stack}`;
      lines = wrapText(text, maxWidth);
      if (lines.length * fontSize * f.lh <= maxHeight) break;
      fontSize -= 4;
    }

    fontSize = Math.round(fontSize * state.sizeFactor);
    ctx.font = `${f.weight} ${fontSize}px ${f.stack}`;
    lines = wrapText(text, maxWidth);
    return { fontSize, lineHeight: fontSize * f.lh, lines, font: f };
  }

  function draw() {
    if (!state.current) return;
    const t = palette();
    const { author, quote } = state.current;
    const text = quote[state.lang];
    const name = author.name[state.lang];
    const era = author.era[state.lang];

    const MX = 132;
    const right = W - MX;
    const ruleY = 930;
    const metaY = ruleY + 58;
    const align = state.align;
    const ax = align === "center" ? W / 2 : align === "right" ? right : MX;

    const g = ctx.createLinearGradient(0, 0, W * 0.65, H);
    g.addColorStop(0, t.bgFrom);
    g.addColorStop(1, t.bgTo);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.textBaseline = "alphabetic";

    if (state.kicker) {
      const kicker = state.lang === "ru" ? "ЦИТАТА" : "QUOTE";
      ctx.strokeStyle = t.accent;
      ctx.lineWidth = 3;
      ctx.fillStyle = t.meta;
      ctx.font = `400 26px "Space Mono", monospace`;
      ctx.letterSpacing = "4px";
      if (align === "center") {
        ctx.beginPath(); ctx.moveTo(W / 2 - 31, 150); ctx.lineTo(W / 2 + 31, 150); ctx.stroke();
        ctx.textAlign = "center"; ctx.fillText(kicker, W / 2, 188);
      } else if (align === "right") {
        ctx.beginPath(); ctx.moveTo(right - 62, 170); ctx.lineTo(right, 170); ctx.stroke();
        ctx.textAlign = "right"; ctx.fillText(kicker, right, 200);
      } else {
        ctx.beginPath(); ctx.moveTo(MX, 170); ctx.lineTo(MX + 62, 170); ctx.stroke();
        ctx.textAlign = "left"; ctx.fillText(kicker, MX + 84, 180);
      }
      ctx.letterSpacing = "0px";
    }

    const maxWidth = W - MX * 2 - (align === "left" ? 108 : 0);
    const regionTop = 250;
    const regionBottom = 850;
    const { fontSize, lineHeight, lines } = fitQuote(text, maxWidth, regionBottom - regionTop);

    ctx.fillStyle = t.quote;
    ctx.textAlign = align;
    const blockHeight = lines.length * lineHeight;
    let y = (regionTop + regionBottom) / 2 - blockHeight / 2 + fontSize * 0.78;
    for (const line of lines) {
      ctx.fillText(line, ax, y);
      y += lineHeight;
    }

    ctx.strokeStyle = t.faint;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(MX, ruleY);
    ctx.lineTo(right, ruleY);
    ctx.stroke();

    if (align === "center") {
      ctx.textAlign = "center";
      ctx.fillStyle = t.name;
      ctx.font = `700 31px "Space Mono", monospace`;
      ctx.letterSpacing = "2px";
      ctx.fillText(name.toUpperCase(), W / 2, metaY);
      ctx.letterSpacing = "1px";
      ctx.fillStyle = t.meta;
      ctx.font = `400 25px "Space Mono", monospace`;
      ctx.fillText(era, W / 2, metaY + 40);
      ctx.letterSpacing = "0px";
    } else {
      const nameX = align === "right" ? right : MX + 30;
      const eraX = align === "right" ? MX : right;

      if (align === "left") {
        ctx.fillStyle = t.accent;
        ctx.fillRect(MX, metaY - 21, 11, 11);
      }
      ctx.fillStyle = t.name;
      ctx.font = `700 31px "Space Mono", monospace`;
      ctx.letterSpacing = "2px";
      ctx.textAlign = align === "right" ? "right" : "left";
      ctx.fillText(name.toUpperCase(), nameX, metaY);
      ctx.letterSpacing = "1px";
      ctx.fillStyle = t.meta;
      ctx.font = `400 27px "Space Mono", monospace`;
      ctx.textAlign = align === "right" ? "left" : "right";
      ctx.fillText(era, eraX, metaY);
      ctx.letterSpacing = "0px";
    }

    const nick = (state.nick || "").trim();
    if (nick) {
      ctx.textAlign = "center";
      ctx.fillStyle = t.meta;
      ctx.font = `400 20px "Space Mono", monospace`;
      ctx.letterSpacing = "1px";
      ctx.fillText(nick, W / 2, H - 34);
      ctx.letterSpacing = "0px";
    }

    ctx.textAlign = "left";
  }

  function imageFilename() {
    const id = state.current ? state.current.author.id : "quote";
    return `wise-${id}-${Date.now()}.png`;
  }

  function dataURLtoBlob(dataURL) {
    const [head, b64] = dataURL.split(",");
    const mime = (head.match(/:(.*?);/) || [])[1] || "image/png";
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function saveImage() {
    const name = imageFilename();
    const blob = dataURLtoBlob(canvas.toDataURL("image/png"));
    const file = new File([blob], name, { type: "image/png" });
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
    if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file] }).catch(() => downloadBlob(blob, name));
    } else {
      downloadBlob(blob, name);
    }
  }

  function copyText() {
    if (!state.current) return;
    const { author, quote } = state.current;
    const q = quote[state.lang];
    const name = author.name[state.lang];
    const open = state.lang === "ru" ? "«" : "“";
    const close = state.lang === "ru" ? "»" : "”";
    const text = open + q + close + "\n— " + name;

    const ok = () => flashCopied();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(() => fallbackCopy(text, ok));
    } else {
      fallbackCopy(text, ok);
    }
  }

  function fallbackCopy(text, cb) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    if (cb) cb();
  }

  let copyTimer = null;
  function flashCopied() {
    const span = copyBtn.querySelector(".btn-label");
    if (!span) return;
    span.textContent = I18N[state.lang].copied;
    copyBtn.classList.add("is-done");
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      span.textContent = I18N[state.lang].copy;
      copyBtn.classList.remove("is-done");
    }, 1600);
  }

  function buildChips() {
    chipsEl.innerHTML = "";

    const allChip = document.createElement("button");
    allChip.className = "chip chip-all is-active";
    allChip.type = "button";
    allChip.dataset.id = "all";
    allChip.textContent = I18N[state.lang].allChip;
    chipsEl.appendChild(allChip);

    for (const a of AUTHORS) {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.type = "button";
      chip.dataset.id = a.id;
      chip.textContent = a.name[state.lang];
      chipsEl.appendChild(chip);
    }

    chipsEl.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.authorId = chip.dataset.id;
        chipsEl.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        state.current = nextQuote();
        draw();
      });
    });
  }

  function syncChipsActive() {
    chipsEl.querySelectorAll(".chip").forEach((c) => {
      c.classList.toggle("is-active", c.dataset.id === state.authorId);
    });
  }

  randomBtn.addEventListener("click", () => {
    state.current = nextQuote();
    draw();
  });

  downloadBtn.addEventListener("click", saveImage);
  copyBtn.addEventListener("click", copyText);

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      state.lang = btn.dataset.lang;
      document.querySelectorAll(".lang-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      applyI18n();
      buildChips();
      syncChipsActive();
      syncControls();
      await ensureFont(currentFont());
      draw();
    });
  });

  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.theme = btn.dataset.theme;
      syncControls();
      persist();
      draw();
    });
  });

  const LS_KEY = "quotecard.custom.v1";

  function persist() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        theme: state.theme, font: state.font, sizeFactor: state.sizeFactor,
        align: state.align, kicker: state.kicker, nick: state.nick, custom: state.custom,
      }));
    } catch (e) {}
  }

  function loadPersisted() {
    try {
      const s = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (s) {
        if (s.theme) state.theme = s.theme;
        if (s.font) {
          state.font = typeof s.font === "string"
            ? { ru: s.font, en: s.font }
            : { ru: s.font.ru || "instrument", en: s.font.en || "instrument" };
        }
        if (typeof s.sizeFactor === "number") state.sizeFactor = s.sizeFactor;
        if (s.align) state.align = s.align;
        if (typeof s.kicker === "boolean") state.kicker = s.kicker;
        if (typeof s.nick === "string") state.nick = s.nick;
        if (s.custom) state.custom = s.custom;
      }
    } catch (e) {}

    ["ru", "en"].forEach((L) => {
      if (!FONT_LISTS[L].includes(state.font[L])) state.font[L] = "instrument";
    });
  }

  function populateFonts() {
    const list = FONT_LISTS[state.lang] || FONT_LISTS.ru;
    fontSelect.innerHTML = list
      .map((k) => `<option value="${k}">${FONTS[k].label || I18N[state.lang].font_original}</option>`)
      .join("");
  }

  function syncControls() {
    populateFonts();
    fontSelect.value = state.font[state.lang];
    sizeRange.value = String(Math.round(state.sizeFactor * 100));
    nickInput.value = state.nick;
    kickerToggle.checked = state.kicker;
    alignToggle.querySelectorAll(".align-btn").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.align === state.align));
    if (state.theme === "custom") {
      bgColor.value = state.custom.bg || "#16181d";
      textColor.value = state.custom.text || "#f4f1ea";
      accentColor.value = state.custom.accent || "#6a8eff";
    } else {
      const th = THEMES[state.theme] || THEMES.dark;
      bgColor.value = th.bgFrom;
      textColor.value = th.quote;
      accentColor.value = th.accent;
    }
    document.querySelectorAll(".theme-btn").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.theme === state.theme));
  }

  fontSelect.addEventListener("change", async () => {
    state.font[state.lang] = fontSelect.value;
    await ensureFont(currentFont());
    persist();
    draw();
  });

  sizeRange.addEventListener("input", () => {
    state.sizeFactor = Math.max(0.5, Math.min(1, (+sizeRange.value || 100) / 100));
    persist();
    draw();
  });

  alignToggle.querySelectorAll(".align-btn").forEach((b) => {
    b.addEventListener("click", () => {
      state.align = b.dataset.align;
      alignToggle.querySelectorAll(".align-btn").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      persist();
      draw();
    });
  });

  function onColor() {
    state.theme = "custom";
    state.custom = { bg: bgColor.value, text: textColor.value, accent: accentColor.value };
    document.querySelectorAll(".theme-btn").forEach((b) => b.classList.remove("is-active"));
    persist();
    draw();
  }
  bgColor.addEventListener("input", onColor);
  textColor.addEventListener("input", onColor);
  accentColor.addEventListener("input", onColor);

  nickInput.addEventListener("input", () => {
    state.nick = nickInput.value;
    persist();
    draw();
  });

  kickerToggle.addEventListener("change", () => {
    state.kicker = kickerToggle.checked;
    persist();
    draw();
  });

  customizeToggle.addEventListener("click", () => {
    const open = customPanel.hasAttribute("hidden");
    if (open) customPanel.removeAttribute("hidden");
    else customPanel.setAttribute("hidden", "");
    customizeToggle.setAttribute("aria-expanded", String(open));
  });

  resetBtn.addEventListener("click", () => {
    state.theme = "dark";
    state.font = { ru: "instrument", en: "instrument" };
    state.sizeFactor = 1;
    state.align = "left";
    state.kicker = true;
    state.nick = "";
    state.custom = { bg: null, text: null, accent: null };
    syncControls();
    persist();
    draw();
  });

  document.getElementById("statAuthors").textContent = AUTHORS.length;
  document.getElementById("statQuotes").textContent = ALL_QUOTES.length;

  async function start() {
    loadPersisted();
    populateFonts();
    applyI18n();
    buildChips();
    syncControls();
    try {
      if (document.fonts && document.fonts.ready) {
        await Promise.all([
          document.fonts.load('700 31px "Space Mono"'),
          document.fonts.load('400 26px "Space Mono"'),
          ensureFont(currentFont()),
        ]);
        await document.fonts.ready;
      }
    } catch (e) {}
    state.current = nextQuote();
    draw();

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  }

  applyI18n();
  start();
})();

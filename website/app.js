/* Casting landing page — interactions & animations */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---- Year ---- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Sticky nav shadow ---- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  const toggle = $('#navToggle');
  const menu = $('#mobileMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('a', menu).forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---- Theme toggle ---- */
  const root = document.documentElement;
  const themeToggle = $('#themeToggle');
  const getTheme = () => (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = getTheme() === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      themeToggle.setAttribute('aria-label', next === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
      try { localStorage.setItem('casting-theme', next); } catch (e) { /* ignore */ }
    });
  }
  // Follow system changes only when the user hasn't picked a theme.
  const mq = window.matchMedia('(prefers-color-scheme: light)');
  mq.addEventListener('change', (e) => {
    let stored = null;
    try { stored = localStorage.getItem('casting-theme'); } catch (err) { /* ignore */ }
    if (stored !== 'light' && stored !== 'dark') {
      root.setAttribute('data-theme', e.matches ? 'light' : 'dark');
    }
  });

  /* ---- Reveal on scroll ---- */
  const revealEls = $$('.reveal');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = Math.min(i * 40, 160);
          setTimeout(() => entry.target.classList.add('in'), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---- Feature card cursor glow ---- */
  $$('.feature-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---- Count-up stats ---- */
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion || target === 0) { el.textContent = (target === 0 ? '0' : target) + suffix; return; }
    const dur = 1200;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const statsIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { runCount(entry.target); statsIO.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  $$('.stat-num').forEach(el => statsIO.observe(el));

  /* ---- Animated bars ---- */
  const barIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.pct + '%';
        barIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  $$('.bar-fill').forEach(el => barIO.observe(el));

  /* ---- Copy buttons (install boxes) ---- */
  const flashCopied = (btn) => {
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1400);
  };
  $$('.install').forEach((box) => {
    const btn = $('.copy-btn', box);
    if (!btn) return;
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(box.dataset.copy || '').then(() => flashCopied(btn));
    });
  });

  /* ---- Copy buttons (code blocks) ---- */
  $$('.code-block .code-copy').forEach((btn) => {
    btn.addEventListener('click', () => {
      const code = $('code', btn.parentElement);
      const text = code ? code.textContent : '';
      navigator.clipboard.writeText(text).then(() => flashCopied(btn));
    });
  });

  /* ---- Tabs ---- */
  const tabs = $('#tabs');
  if (tabs) {
    const tabButtons = $$('.tab', tabs);
    const panels = $$('.tab-panel', tabs);
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = $(`.tab-panel[data-panel="${btn.dataset.tab}"]`, tabs);
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ---- Typed terminal demo ---- */
  const termBody = $('#terminalBody');
  const termLines = [
    { t: '$ ', cls: 'accent', typed: 'npx casting-cli component Box', clsTyped: 'cmd' },
    { blank: true },
    { text: '✓ Created 3 files in src/components/Box', cls: 'ok' },
    { text: '  ├── ✓ Box.tsx', cls: 'muted' },
    { text: '  ├── ✓ Box.module.css', cls: 'muted' },
    { text: '  └── ✓ Box.test.tsx', cls: 'muted' },
    { blank: true },
    { text: '⚡ Detected TypeScript + CSS Modules · formatted with Prettier', cls: 'accent' },
  ];

  const startTerminal = () => {
    if (!termBody) return;
    if (reduceMotion) {
      termBody.innerHTML = termLines.map((l) => {
        if (l.blank) return '';
        if (l.typed) return `<span class="accent">$ </span><span class="cmd">${l.typed}</span>`;
        return `<span class="${l.cls}">${escapeHtml(l.text)}</span>`;
      }).join('\n');
      return;
    }

    let lineIdx = 0;
    const renderStatic = (upTo) => {
      let html = '';
      for (let i = 0; i < upTo; i++) {
        const l = termLines[i];
        if (l.blank) { html += '\n'; continue; }
        if (l.typed) html += `<span class="accent">$ </span><span class="cmd">${escapeHtml(l.typed)}</span>\n`;
        else html += `<span class="${l.cls}">${escapeHtml(l.text)}</span>\n`;
      }
      return html;
    };

    const typeCommand = (line, done) => {
      const full = line.typed;
      let i = 0;
      const tick = () => {
        const partial = full.slice(0, i);
        termBody.innerHTML = renderStatic(lineIdx)
          + `<span class="accent">$ </span><span class="cmd">${escapeHtml(partial)}</span><span class="cursor"></span>`;
        i++;
        if (i <= full.length) setTimeout(tick, 45 + Math.random() * 40);
        else setTimeout(done, 450);
      };
      tick();
    };

    const next = () => {
      if (lineIdx >= termLines.length) {
        termBody.innerHTML = renderStatic(termLines.length) + '<span class="cursor"></span>';
        return;
      }
      const line = termLines[lineIdx];
      if (line.typed) {
        typeCommand(line, () => { lineIdx++; next(); });
      } else {
        lineIdx++;
        termBody.innerHTML = renderStatic(lineIdx) + '<span class="cursor"></span>';
        setTimeout(next, line.blank ? 120 : 260);
      }
    };
    next();
  };

  function escapeHtml(str) {
    return String(str).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }

  const term = $('#terminal');
  if (term) {
    const termIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { startTerminal(); termIO.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    termIO.observe(term);
  }

  /* ---- Starfield canvas ---- */
  const canvas = $('#starfield');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    let w, h, raf;

    const resize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      const count = Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 14000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.3 + 0.3) * devicePixelRatio,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * 0.02 + 0.004,
        dir: Math.random() > 0.5 ? 1 : -1,
        vy: (Math.random() * 0.12 + 0.02) * devicePixelRatio,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.a += s.tw * s.dir;
        if (s.a <= 0.15 || s.a >= 0.85) s.dir *= -1;
        s.y += s.vy;
        if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 210, 255, ${s.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(resize, 200); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }

  /* ---- Active nav link on scroll ---- */
  const sections = ['features', 'how', 'compare', 'docs'].map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = $$('.nav-links a');
  if (sections.length && navLinks.length) {
    const linkIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.style.color = a.getAttribute('href') === `#${entry.target.id}` ? 'var(--text)' : '');
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(s => linkIO.observe(s));
  }
})();

/* Viktor Lorentz — site script. No dependencies. */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  /* ---------- Theme ---------- */
  const toggle = document.querySelector('[data-theme-toggle]');

  const applyTheme = (theme, persist) => {
    root.setAttribute('data-theme', theme);
    if (toggle) toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    if (persist) {
      try { localStorage.setItem('theme', theme); } catch (_) { /* private mode */ }
    }
  };

  applyTheme(root.getAttribute('data-theme') || 'light', false);

  toggle?.addEventListener('click', () => {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });

  // Follow the OS setting until the visitor picks one explicitly.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (_) { /* ignore */ }
    if (!saved) applyTheme(e.matches ? 'dark' : 'light', false);
  });

  /* ---------- Nav: border on scroll + active section ---------- */
  const nav = document.querySelector('.nav');
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
  let ticking = false;

  const update = () => {
    ticking = false;
    nav?.classList.toggle('scrolled', window.scrollY > 8);

    const probe = window.scrollY + window.innerHeight * 0.4;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = null;
    for (const s of targets) if (s.offsetTop <= probe) current = s;
    if (atBottom && targets.length) current = targets[targets.length - 1];

    for (const a of links) {
      const on = !!current && a.hash === `#${current.id}`;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const label = btn.querySelector('span');
    const idle = label ? label.textContent : '';
    let timer;

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add('copied');
        if (label) label.textContent = 'Copied';
        clearTimeout(timer);
        timer = setTimeout(() => {
          btn.classList.remove('copied');
          if (label) label.textContent = idle;
        }, 1800);
      } catch (_) {
        window.location.href = `mailto:${btn.dataset.copy}`;
      }
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();

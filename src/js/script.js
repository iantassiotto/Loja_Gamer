/* ============================================================
   LOJA GAMER — script.js
   Funcionalidades: hamburger menu, tema claro/escuro,
   validação de formulário, filtro de cards,
   countdown de promoção, scroll reveal, carrossel.
   ============================================================ */

/* ── Utilitário: query helpers ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. MENU HAMBURGUER (responsivo)
   ============================================================ */
function initHamburger() {
  const btn   = $('.hamburger');
  const links = $('.nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    links.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  /* Fecha ao clicar em um link */
  $$('a', links).forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });
}

/* ============================================================
   2. TEMA CLARO / ESCURO
   ============================================================ */
function initThemeToggle() {
  const btn = $('.theme-toggle');
  if (!btn) return;

  /* Carrega preferência salva ou usa dark como padrão */
  const saved = localStorage.getItem('loja-gamer-theme') || 'dark';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const current = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('loja-gamer-theme', next);
  });
}

function applyTheme(theme) {
  const btn = $('.theme-toggle');
  if (theme === 'light') {
    document.body.classList.add('light-mode');
    if (btn) btn.textContent = '🌙';
    if (btn) btn.setAttribute('title', 'Modo escuro');
  } else {
    document.body.classList.remove('light-mode');
    if (btn) btn.textContent = '☀️';
    if (btn) btn.setAttribute('title', 'Modo claro');
  }
}

/* ============================================================
   3. LINK ATIVO NA NAV
   ============================================================ */
function initActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === current) a.classList.add('active');
  });
}

/* ============================================================
   4. SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   5. FILTRO DE CARDS (portifólio)
   ============================================================ */
function initProductFilter() {
  const btns  = $$('.filter-btn');
  const cards = $$('.product-card');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      /* Atualiza botão ativo */
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.classList.remove('hidden');
          /* Animação de reentrada */
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = '';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ============================================================
   6. COUNTDOWN DE PROMOÇÃO
   ============================================================ */
function initCountdown() {
  const timer = $('.promo-timer');
  if (!timer) return;

  /* Define o fim do countdown como 3 dias a partir de hoje,
     ou usa uma data salva para que não reinicie a cada visita */
  const storageKey = 'loja-gamer-promo-end';
  let endTime = parseInt(localStorage.getItem(storageKey), 10);

  if (!endTime || endTime < Date.now()) {
    endTime = Date.now() + 3 * 24 * 60 * 60 * 1000; /* 3 dias */
    localStorage.setItem(storageKey, endTime);
  }

  const daysEl    = $('#timer-days');
  const hoursEl   = $('#timer-hours');
  const minsEl    = $('#timer-mins');
  const secsEl    = $('#timer-secs');

  if (!daysEl) return;

  function update() {
    const diff = Math.max(0, endTime - Date.now());
    if (diff === 0) {
      clearInterval(id);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    daysEl.textContent  = String(d).padStart(2, '0');
    hoursEl.textContent = String(h).padStart(2, '0');
    minsEl.textContent  = String(m).padStart(2, '0');
    secsEl.textContent  = String(s).padStart(2, '0');
  }

  update();
  const id = setInterval(update, 1000);
}

/* ============================================================
   7. VALIDAÇÃO DO FORMULÁRIO DE CONTATO
   ============================================================ */
function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (validateForm(form)) {
      showSuccess(form);
    }
  });

  /* Limpa erro ao digitar */
  $$('input, textarea', form).forEach(field => {
    field.addEventListener('input', () => clearError(field));
  });
}

function validateForm(form) {
  let valid = true;

  const name    = $('#contact-name');
  const email   = $('#contact-email');
  const subject = $('#contact-subject');
  const msg     = $('#contact-msg');

  if (name && name.value.trim().length < 3) {
    setError(name, 'Digite seu nome completo (mínimo 3 caracteres).');
    valid = false;
  }

  if (email && !isValidEmail(email.value.trim())) {
    setError(email, 'Digite um e-mail válido.');
    valid = false;
  }

  if (subject && subject.value === '') {
    setError(subject, 'Selecione um assunto.');
    valid = false;
  }

  if (msg && msg.value.trim().length < 20) {
    setError(msg, 'Descreva sua mensagem (mínimo 20 caracteres).');
    valid = false;
  }

  return valid;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setError(field, message) {
  field.classList.add('error');
  const err = field.parentElement.querySelector('.field-error');
  if (err) { err.textContent = message; err.classList.add('show'); }
}

function clearError(field) {
  field.classList.remove('error');
  const err = field.parentElement.querySelector('.field-error');
  if (err) err.classList.remove('show');
}

function showSuccess(form) {
  form.style.display = 'none';
  const msg = $('#form-success');
  if (msg) msg.classList.add('show');
}

/* ============================================================
   8. CARROSSEL DE DEPOIMENTOS (sobre.html)
   ============================================================ */
function initCarousel() {
  const wrapper = $('.carousel-wrapper');
  if (!wrapper) return;

  const track  = $('.carousel-track', wrapper);
  const slides = $$('.carousel-slide', track);
  const dots   = $$('.carousel-dot');
  const prevBtn = $('.carousel-btn.prev', wrapper.parentElement);
  const nextBtn = $('.carousel-btn.next', wrapper.parentElement);

  if (!slides.length) return;

  let current = 0;
  let autoplay;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); resetAutoplay(); }));

  function resetAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(() => goTo(current + 1), 5000);
  }

  goTo(0);
  resetAutoplay();
}

/* ============================================================
   9. ANIMAÇÃO DE CONTAGEM DOS STATS (index.html)
   ============================================================ */
function initCountUp() {
  const numbers = $$('[data-count]');
  if (!numbers.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        let start    = 0;
        const step   = Math.ceil(target / 60);
        const id     = setInterval(() => {
          start += step;
          if (start >= target) { el.textContent = target + suffix; clearInterval(id); }
          else { el.textContent = start + suffix; }
        }, 30);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  numbers.forEach(n => observer.observe(n));
}

/* ============================================================
   10. CARRINHO — contador animado
   ============================================================ */
function initCart() {
  const cartBtn   = $('.cart-btn');
  const cartCount = $('.cart-count');
  if (!cartBtn || !cartCount) return;

  let count = 0;

  /* Reset ao clicar no ícone */
  cartBtn.addEventListener('click', () => {
    if (count === 0) return;
    count = 0;
    cartCount.textContent = '0';
    cartCount.classList.add('hidden');
  });

  /* Delegação: captura cliques em qualquer .btn-buy na página */
  document.addEventListener('click', e => {
    const buyBtn = e.target.closest('.btn-buy');
    if (!buyBtn) return;

    count++;
    cartCount.textContent = String(count);
    cartCount.classList.remove('hidden');

    /* Pulsa o contador */
    cartCount.classList.remove('pulse');
    cartCount.offsetWidth; /* reflow para reiniciar animação */
    cartCount.classList.add('pulse');

    /* Partícula que "voa" do botão até o ícone do carrinho */
    flyToCart(buyBtn, cartBtn, buyBtn.dataset.icon || '🛒');
  });
}

function flyToCart(origin, target, icon) {
  const from = origin.getBoundingClientRect();
  const to   = target.getBoundingClientRect();

  const el = document.createElement('span');
  el.className = 'fly-item';
  el.textContent = icon;

  /* Posição inicial: centro do botão comprar */
  const startX = from.left + from.width  / 2;
  const startY = from.top  + from.height / 2;

  /* Vetor até o centro do ícone carrinho */
  const dx = (to.left + to.width  / 2) - startX;
  const dy = (to.top  + to.height / 2) - startY;

  el.style.cssText = `
    left: ${startX}px;
    top:  ${startY}px;
    --fly-x: ${dx}px;
    --fly-y: ${dy}px;
    animation: fly-arc 0.55s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
  `;

  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/* ============================================================
   INIT — executa após o DOM estar pronto
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initHamburger();
  initThemeToggle();
  initActiveNav();
  initScrollReveal();
  initProductFilter();
  initCountdown();
  initContactForm();
  initCarousel();
  initCountUp();
  initCart();
});

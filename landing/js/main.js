// ─── Suprfly Main JS ───

// Scroll reveal
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// FAQ accordion (delegated)
document.querySelectorAll('.faq-q').forEach((q) => {
  q.addEventListener('click', () => {
    q.parentElement.classList.toggle('open');
  });
});

// Mobile nav
const mobileBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav-overlay');
if (mobileBtn && mobileNav) {
  mobileBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
    document.body.classList.toggle('nav-open');
  });
  mobileNav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('active');
      document.body.classList.remove('nav-open');
    });
  });
}

// Active nav link
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-links a, .mobile-nav-overlay a').forEach((link) => {
  const href = link.getAttribute('href');
  if (href && (href === currentPath || (currentPath.endsWith('/') && href === '/index.html'))) {
    link.classList.add('active');
  }
  if (currentPath.includes('/blog') && href && href.includes('/blog')) {
    link.classList.add('active');
  }
});

// Pricing toggle (annual/monthly)
const pricingToggle = document.querySelector('.pricing-toggle');
if (pricingToggle) {
  const monthlyBtn = pricingToggle.querySelector('[data-interval="monthly"]');
  const annualBtn = pricingToggle.querySelector('[data-interval="annual"]');

  function setPricing(interval) {
    document.querySelectorAll('[data-monthly]').forEach((el) => {
      el.textContent = interval === 'monthly' ? el.dataset.monthly : el.dataset.annual;
    });
    document.querySelectorAll('[data-monthly-sub]').forEach((el) => {
      el.textContent = interval === 'monthly' ? el.dataset.monthlySub : el.dataset.annualSub;
    });
    if (monthlyBtn) monthlyBtn.classList.toggle('active', interval === 'monthly');
    if (annualBtn) annualBtn.classList.toggle('active', interval === 'annual');
  }

  if (monthlyBtn) monthlyBtn.addEventListener('click', () => setPricing('monthly'));
  if (annualBtn) annualBtn.addEventListener('click', () => setPricing('annual'));
}

// Blog category filter
document.querySelectorAll('.category-filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.category;
    document.querySelectorAll('.category-filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.blog-card').forEach((card) => {
      if (cat === 'all' || card.dataset.category === cat) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

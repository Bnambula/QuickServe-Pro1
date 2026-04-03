/* ============================================================
   QUICKSERVE PRO — MASTER JAVASCRIPT
   Version 3.0 | Psychology-Driven | Mobile-Optimised
============================================================ */

'use strict';

/* ── PAGE ROUTER ─────────────────────────────────────────── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
  closeMobile();
  setTimeout(initReveal, 80);
}

/* ── MOBILE NAV ──────────────────────────────────────────── */
function toggleMobile() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
}

/* ── MODALS ─────────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById('modal-' + id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById('modal-' + id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ── CONSENT ─────────────────────────────────────────────── */
function openConsent() {
  const el = document.getElementById('consentModal');
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeConsent() {
  const el = document.getElementById('consentModal');
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
function updateConsent(inp) {
  const val = inp.value.trim();
  const btn = document.getElementById('consentSubmit');
  const out = document.getElementById('consentOutput');
  if (!btn || !out) return;
  if (val.length > 3) {
    const now = new Date().toLocaleString('en-UG');
    out.innerHTML = `<strong>Signed:</strong> "I, ${val}, agree to this QuickServe Pro service agreement."<br><small style="color:var(--gray-400)">${now}</small>`;
    out.style.display = 'block';
    btn.disabled = false;
  } else {
    out.style.display = 'none';
    btn.disabled = true;
  }
}
function submitConsent() {
  const name = document.getElementById('consentName')?.value?.trim() || 'User';
  closeConsent();
  showToast('✅ Agreement signed by ' + name + '. Proceeding to payment...');
}

/* ── TOAST ──────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, duration = 3800) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

/* ── SCROLL REVEAL ─────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    el.classList.remove('visible');
    obs.observe(el);
  });
}

/* ── NAVBAR SCROLL ─────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── HERO CYCLING TEXT ─────────────────────────────────── */
const heroTexts = [
  'Laundry picked in 30 mins',
  'Trusted cleaners near you',
  'Your time, saved',
  'Safe, verified professionals',
  'Pay securely via MoMo',
  'Book in under 60 seconds'
];
let heroIdx = 0;
function cycleHeroText() {
  const el = document.getElementById('heroCycleText');
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(-12px)';
  setTimeout(() => {
    heroIdx = (heroIdx + 1) % heroTexts.length;
    el.textContent = heroTexts[heroIdx];
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    el.style.transition = 'opacity .4s ease, transform .4s ease';
  }, 350);
}
setInterval(cycleHeroText, 2600);

/* ── HERO SERVICE SELECTOR ─────────────────────────────── */
function selectSvc(el, name, price) {
  document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const pv = document.getElementById('priceVal');
  if (pv) pv.textContent = price;
}
function selectTime(el) {
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

/* ── LIVE ACTIVITY FEED ─────────────────────────────────── */
const activityFeed = [
  { emoji:'📍', msg:'3 people booked cleaning in Ntinda just now' },
  { emoji:'⭐', msg:'Sarah from Kira just rated Grace 5 stars' },
  { emoji:'🚗', msg:'Car wash booked in Bukoto · 2 mins ago' },
  { emoji:'👶', msg:'Babysitter matched in Naalya · Just now' },
  { emoji:'🧺', msg:'Laundry pickup confirmed in Kira · 4 mins ago' },
  { emoji:'🏠', msg:'House cleaning booked in Muyenga · 1 min ago' },
  { emoji:'⚡', msg:'Express service activated in Naguru · Now' },
  { emoji:'✅', msg:'Payment released to Grace · Job complete' },
];
let actIdx = 0;
function updateLiveActivity() {
  const els = document.querySelectorAll('.live-activity-item');
  if (!els.length) return;
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      actIdx = (actIdx + 1) % activityFeed.length;
      const item = activityFeed[actIdx];
      el.innerHTML = `<span>${item.emoji}</span> ${item.msg}`;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
    }, 300);
  });
}
setInterval(updateLiveActivity, 3500);

/* ── NEARBY COUNTER ANIMATION ───────────────────────────── */
function animateNearby() {
  const el = document.getElementById('nearbyCount');
  if (!el) return;
  const counts = [2, 3, 4, 2, 5, 3, 4];
  let i = 0;
  setInterval(() => {
    el.textContent = counts[i % counts.length];
    i++;
  }, 4000);
}

/* ── BEFORE/AFTER SLIDER ────────────────────────────────── */
function initBASlider() {
  const slider = document.getElementById('baSlider');
  if (!slider) return;
  const handle = slider.querySelector('.ba-handle');
  const before = slider.querySelector('.ba-before');
  if (!handle || !before) return;

  let dragging = false;
  const setPos = (clientX) => {
    const rect = slider.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(5, Math.min(95, pct));
    before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = pct + '%';
  };

  handle.addEventListener('mousedown', () => { dragging = true; });
  window.addEventListener('mouseup', () => { dragging = false; });
  slider.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });

  handle.addEventListener('touchstart', e => { dragging = true; e.preventDefault(); }, { passive: false });
  window.addEventListener('touchend', () => { dragging = false; });
  slider.addEventListener('touchmove', e => {
    if (dragging) setPos(e.touches[0].clientX);
  }, { passive: true });
}

/* ── AI CHAT WIDGET ─────────────────────────────────────── */
const botResponses = {
  'laundry': { reply: 'Great! I can book laundry pickup for you. What area are you in?', action: () => openModal('book') },
  'clean':   { reply: 'House cleaning starts from UGX 25,000. Want me to find a verified cleaner near you?', action: () => openModal('book') },
  'car':     { reply: 'Mobile car wash comes to you! Available from UGX 12,000. Shall I book?', action: () => openModal('book') },
  'maid':    { reply: 'Our MaidMatch system finds your perfect home helper. 3-day trial included!', action: () => openModal('maid') },
  'errand':  { reply: 'Errand service from UGX 5,000. Groceries, pharmacy, bank runs — fully tracked.', action: () => openModal('book') },
  'price':   { reply: 'Prices: Laundry from 8K · Cleaning from 25K · Car wash from 12K · Errands from 5K 📱', action: null },
  'help':    { reply: 'I can help you book services, find pricing, or connect you to support. What do you need?', action: null },
  'safe':    { reply: 'All workers are National ID verified ✅. Payments held in escrow. Instant dispute resolution 🛡️', action: null },
  'pay':     { reply: 'We accept MTN MoMo, Airtel Money, and cash. Money is held safely until job is done!', action: null },
  'cancel':  { reply: 'You can cancel up to 1 hour before the job. Late cancellations may have a small fee.', action: null },
  'default': { reply: 'Got it! Let me connect you with our team. Or tap Book Now to get started instantly 🚀', action: null },
};

let chatOpen = false;
function toggleChat() {
  const widget = document.getElementById('aiChatWidget');
  if (!widget) return;
  chatOpen = !chatOpen;
  widget.classList.toggle('open', chatOpen);
  if (chatOpen) addBotMsg("Hi! 👋 What do you need help with today?");
}
function closeChat() {
  const widget = document.getElementById('aiChatWidget');
  if (widget) widget.classList.remove('open');
  chatOpen = false;
}

function addBotMsg(text) {
  const msgs = document.getElementById('aiMsgs');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'ai-msg bot';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}
function addUserMsg(text) {
  const msgs = document.getElementById('aiMsgs');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'ai-msg user';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function sendAIMessage(text) {
  const input = document.getElementById('aiInput');
  const msg = text || (input ? input.value.trim() : '');
  if (!msg) return;
  if (input) input.value = '';
  addUserMsg(msg);

  const lower = msg.toLowerCase();
  let resp = botResponses['default'];
  for (const [key, val] of Object.entries(botResponses)) {
    if (lower.includes(key)) { resp = val; break; }
  }

  setTimeout(() => {
    addBotMsg(resp.reply);
    if (resp.action) setTimeout(resp.action, 800);
  }, 600);
}

function aiQuick(text) { sendAIMessage(text); }

/* ── REGISTRATION FLOW ──────────────────────────────────── */
let regStep = 1;
function regNext(step) {
  const cur = document.getElementById('reg-step-' + step);
  const next = document.getElementById('reg-step-' + (step + 1));
  if (!next) return;
  cur.style.display = 'none';
  next.style.display = 'block';
  regStep = step + 1;
  updateStepper();
  showToast('✅ Step ' + step + ' complete!');
}
function regBack(step) {
  const cur = document.getElementById('reg-step-' + step);
  const prev = document.getElementById('reg-step-' + (step - 1));
  if (!prev) return;
  cur.style.display = 'none';
  prev.style.display = 'block';
  regStep = step - 1;
  updateStepper();
}
function updateStepper() {
  document.querySelectorAll('[id^="vstep-"]').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i + 1 < regStep) el.classList.add('done');
    if (i + 1 === regStep) el.classList.add('active');
  });
}
function fakeUpload(id) {
  const label = id === 'id-front' ? 'Front' : 'Back';
  const el = document.getElementById(id + '-text');
  if (el) el.textContent = '✅ ' + label + ' of ID uploaded successfully';
  showToast('📄 ' + label + ' of ID uploaded!');
}
function takeSelfie() {
  const frame = document.getElementById('selfieFrame');
  if (frame) frame.innerHTML = '<div style="width:200px;height:200px;border-radius:50%;background:var(--gray-bg);border:4px solid var(--green);display:flex;align-items:center;justify-content:center;font-size:3rem;">😊</div>';
  showToast('✅ Selfie captured! Checking face match...');
  setTimeout(() => { showToast('✅ Face match passed!'); regNext(3); }, 1800);
}
function sendOTP() { showToast('📱 OTP sent! Check your phone.'); }
function simulateApproval() {
  const p = document.getElementById('statusPending');
  const a = document.getElementById('statusApproved');
  if (p) p.style.display = 'none';
  if (a) a.style.display = 'block';
  showToast('🎉 Verified! Welcome to QuickServe Pro!');
}

/* ── REPORT SYSTEM ──────────────────────────────────────── */
function selReport(el) {
  document.querySelectorAll('.rep-opt').forEach(r => r.classList.remove('sel'));
  el.classList.add('sel');
}
function submitReport() {
  const rc = document.getElementById('reportConfirm');
  if (rc) rc.style.display = 'block';
  showToast('🚨 Report filed. Payment frozen. Admin alerted.');
  setTimeout(() => { if (rc) rc.style.display = 'none'; }, 5000);
}

/* ── PAYMENT SIMULATION ─────────────────────────────────── */
function simulatePayment() {
  showToast('📱 MoMo prompt sent! Awaiting PIN...');
  const dots = document.querySelectorAll('.pin-dot');
  let i = 0;
  const fill = setInterval(() => {
    if (i < dots.length) { dots[i].classList.add('filled'); i++; }
    else {
      clearInterval(fill);
      setTimeout(() => {
        showToast('✅ Payment confirmed! Funds held in escrow.');
      }, 600);
    }
  }, 220);
}

/* ── LEGAL TABS ─────────────────────────────────────────── */
function switchLegal(btn, id) {
  document.querySelectorAll('.l-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.legal-doc').forEach(d => d.classList.remove('active'));
  btn.classList.add('active');
  const doc = document.getElementById('ldoc-' + id);
  if (doc) doc.classList.add('active');
}

/* ── SERVICE FILTER ─────────────────────────────────────── */
function filterSvc(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#svcGrid .svc-card').forEach(c => {
    c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
  });
}

/* ── REFERRAL CODE COPY ─────────────────────────────────── */
function copyRef() {
  navigator.clipboard.writeText('QSP-SAVE5000').then(() => {
    showToast('📋 Referral code copied! Share with friends.');
  }).catch(() => {
    showToast('Code: QSP-SAVE5000 — Share this with friends!');
  });
}

/* ── GAMIFICATION PROGRESS BARS ─────────────────────────── */
function animateProgressBars() {
  const bars = document.querySelectorAll('.progress-bar-inner');
  bars.forEach(bar => {
    const target = bar.dataset.width || '0';
    setTimeout(() => { bar.style.width = target; }, 300);
  });
}

/* ── STAT COUNTER ANIMATION ─────────────────────────────── */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = (current >= 1000 ? (current / 1000).toFixed(1) + 'K' : Math.floor(current)) + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

/* ── NEIGHBORHOOD SOCIAL PROOF ──────────────────────────── */
const neighborhoods = ['Ntinda','Kira','Bukoto','Naalya','Naguru','Muyenga','Kololo'];
function updateNeighborhoodProof() {
  const el = document.getElementById('neighborhoodProof');
  if (!el) return;
  const area = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
  const num = Math.floor(Math.random() * 25) + 12;
  el.textContent = `${num} homes in ${area} use QuickServe Pro`;
}
setInterval(updateNeighborhoodProof, 5000);

/* ── "10 SECOND CHALLENGE" TIMER ────────────────────────── */
let challengeActive = false;
let challengeTimer = null;
function startChallenge() {
  if (challengeActive) return;
  challengeActive = true;
  let countdown = 10;
  const el = document.getElementById('challengeNum');
  const btn = document.getElementById('challengeBtn');
  if (!el || !btn) return;
  btn.disabled = true;
  btn.textContent = 'Timer running...';
  const tick = setInterval(() => {
    countdown--;
    el.textContent = countdown;
    if (countdown <= 3) el.style.color = 'var(--red)';
    if (countdown <= 0) {
      clearInterval(tick);
      el.textContent = '🎉';
      btn.textContent = 'Challenge Complete!';
      showToast('⚡ Awesome! You beat the 10-second challenge!');
      challengeActive = false;
      setTimeout(() => {
        el.textContent = '10';
        el.style.color = '';
        btn.disabled = false;
        btn.textContent = '⚡ Start Challenge';
      }, 3000);
    }
  }, 1000);
  openModal('book');
}

/* ── TIME SAVED DASHBOARD NUMBERS ───────────────────────── */
function updateTimeSaved() {
  const data = {
    hours: Math.floor(Math.random() * 3) + 5,
    jobs: Math.floor(Math.random() * 2) + 3,
    money: Math.floor(Math.random() * 20000) + 60000
  };
  const h = document.getElementById('savedHours');
  const j = document.getElementById('savedJobs');
  const m = document.getElementById('savedMoney');
  if (h) h.textContent = data.hours;
  if (j) j.textContent = data.jobs;
  if (m) m.textContent = 'UGX ' + data.money.toLocaleString();
}

/* ── INIT ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  animateNearby();
  updateNeighborhoodProof();
  updateTimeSaved();
  initBASlider();

  // Set initial hero text
  const cycleEl = document.getElementById('heroCycleText');
  if (cycleEl) cycleEl.textContent = heroTexts[0];

  // Set initial live activity
  const liveEls = document.querySelectorAll('.live-activity-item');
  liveEls.forEach(el => {
    el.innerHTML = `<span>${activityFeed[0].emoji}</span> ${activityFeed[0].msg}`;
  });

  // Animate progress bars when they come into view
  const progObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) animateProgressBars(); });
  }, { threshold: 0.5 });
  document.querySelectorAll('.gamification-card').forEach(el => progObs.observe(el));

  // Animate counters when stats section visible
  const statObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) animateCounters(); });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stats-bg').forEach(el => statObs.observe(el));

  // AI input enter key
  const aiInput = document.getElementById('aiInput');
  if (aiInput) {
    aiInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') sendAIMessage();
    });
  }

  // Personalized greeting
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEl = document.getElementById('personalGreeting');
  if (greetEl) greetEl.textContent = greet + ', welcome back!';

  // Close mobile menu on outside click
  document.addEventListener('click', e => {
    const menu = document.getElementById('mobileMenu');
    const ham = document.getElementById('ham');
    if (menu && ham && menu.classList.contains('open') && !menu.contains(e.target) && !ham.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
});

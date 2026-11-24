/* =====================================================
   ui-upgrade.js — Particles, Typing, Confetti, Badges,
                   Cursor, XP Pump, LocalStorage
   ===================================================== */
'use strict';

/* ═══════════════════════════════════════════════════
   1. PARTICLES BACKGROUND (Landing Page)
══════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const COUNT = 70;
  const COLORS = ['#3776AB', '#00d4ff', '#FFD43B', '#39ff14', '#8B5CF6'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.reset = function() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.r     = Math.random() * 1.8 + 0.4;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.5 + 0.1;
      this.vx    = (Math.random() - 0.5) * 0.3;
      this.vy    = (Math.random() - 0.5) * 0.3;
      this.life  = Math.random() * 200 + 100;
      this.maxLife = this.life;
    };
    this.reset();
    // scatter initial positions
    this.y = Math.random() * H;
  }

  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life <= 0 || this.x < -10 || this.x > W+10 || this.y < -10 || this.y > H+10)
      this.reset();
    this.alpha = (this.life / this.maxLife) * 0.5;
  };

  Particle.prototype.draw = function() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i], p2 = particles[j];
        const dx = p1.x - p2.x, dy = p1.y - p2.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.save();
          ctx.globalAlpha = (1 - dist/100) * 0.08;
          ctx.strokeStyle = p1.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function loop() {
    // Only animate if landing is visible
    const lp = document.getElementById('landing-page');
    if (!lp || lp.style.display === 'none') {
      cancelAnimationFrame(loop._raf);
      return;
    }
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    loop._raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());
  loop();
})();

/* ═══════════════════════════════════════════════════
   2. TYPING ANIMATION (Landing)
══════════════════════════════════════════════════ */
(function initTyping() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const lines = [
    'كورس تفاعلي متكامل لطلاب الأمن السيبراني',
    'تعلّم البرمجة بأسلوب مرئي وشيّق وعملي',
    'اكتشف كيف تُستخدم Python في حماية الأنظمة',
    'ابدأ رحلتك نحو احتراف Python اليوم! 🚀',
  ];
  let li = 0, ci = 0, deleting = false, waiting = false;

  function type() {
    const line = lines[li];
    if (!deleting) {
      el.textContent = line.substring(0, ci + 1);
      ci++;
      if (ci === line.length) {
        waiting = true;
        setTimeout(() => { waiting = false; deleting = true; requestAnimationFrame(type); }, 2000);
        return;
      }
    } else {
      el.textContent = line.substring(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        li = (li + 1) % lines.length;
        setTimeout(() => requestAnimationFrame(type), 400);
        return;
      }
    }
    setTimeout(() => requestAnimationFrame(type), deleting ? 25 : 55);
  }
  setTimeout(type, 600);
})();

/* ═══════════════════════════════════════════════════
   3. CUSTOM CURSOR
══════════════════════════════════════════════════ */
(function initCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  let mx = -100, my = -100;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });
  document.addEventListener('mousedown', () => cursor.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('cursor-click'));
  document.addEventListener('mouseleave',() => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter',() => { cursor.style.opacity = '1'; });
})();

/* ═══════════════════════════════════════════════════
   4. CONFETTI
══════════════════════════════════════════════════ */
function launchConfetti(count = 60) {
  const colors = ['#3776AB','#FFD43B','#39ff14','#00d4ff','#ff7b72','#d2a8ff','#f8c89b'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left    = Math.random() * 100 + 'vw';
      el.style.top     = '-10px';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.width   = (Math.random() * 8 + 4) + 'px';
      el.style.height  = (Math.random() * 8 + 4) + 'px';
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      el.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
      el.style.animationDelay   = Math.random() * 0.5 + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }, i * 25);
  }
}
window.launchConfetti = launchConfetti;

/* ═══════════════════════════════════════════════════
   5. BADGES SYSTEM
══════════════════════════════════════════════════ */
const BADGES = [
  { id:'first_code',   emoji:'🐍', name:'أول كود',      desc:'أكملت الوحدة الأولى',           module: 0  },
  { id:'coder',        emoji:'💻', name:'مبرمج',         desc:'أكملت 3 وحدات',                 xp: 90    },
  { id:'data_master',  emoji:'📦', name:'سيد البيانات',  desc:'تعلّمت المتغيرات والقوائم',     module: 8  },
  { id:'loop_hero',    emoji:'🔁', name:'بطل الحلقات',   desc:'أتقنت الحلقات',                 module: 7  },
  { id:'fn_wizard',    emoji:'⚡', name:'ساحر الدوال',   desc:'أتقنت Functions',               module: 9  },
  { id:'cyber_guard',  emoji:'🔐', name:'حارس السيبراني',desc:'أكملت أدوات الأمن السيبراني',  module:11  },
  { id:'half_way',     emoji:'🌟', name:'منتصف الطريق',  desc:'أكملت 5 وحدات',                 xp: 150   },
  { id:'perfectionist',emoji:'💯', name:'الكمال',        desc:'100% في الاختبار النهائي',      exam:true  },
  { id:'graduate',     emoji:'🏆', name:'خريج Python',   desc:'أكملت الكورس كاملاً',           module:13  },
];

const earnedBadges = new Set(JSON.parse(localStorage.getItem('py_badges') || '[]'));

function checkBadges(context = {}) {
  BADGES.forEach(badge => {
    if (earnedBadges.has(badge.id)) return;
    let earned = false;
    if (badge.module !== undefined && context.module === badge.module) earned = true;
    if (badge.xp     !== undefined && context.xp >= badge.xp)         earned = true;
    if (badge.exam   && context.exam100)                                earned = true;
    if (earned) awardBadge(badge);
  });
}
window.checkBadges = checkBadges;

function awardBadge(badge) {
  earnedBadges.add(badge.id);
  localStorage.setItem('py_badges', JSON.stringify([...earnedBadges]));
  renderBadges();
  // Toast
  showToast(`${badge.emoji} شارة جديدة: ${badge.name}!`, 'success');
  launchConfetti(40);
}

function renderBadges() {
  const panel = document.getElementById('badges-panel');
  if (!panel) return;
  panel.innerHTML = [...earnedBadges].map(id => {
    const b = BADGES.find(x => x.id === id);
    return b ? `<span class="badge-item" title="${b.name}: ${b.desc}">${b.emoji}</span>` : '';
  }).join('');
}

// Render on load
renderBadges();

/* ═══════════════════════════════════════════════════
   6. XP PUMP ANIMATION
══════════════════════════════════════════════════ */
function pumpXP() {
  const badge = document.getElementById('xp-badge-el');
  if (!badge) return;
  badge.classList.remove('pumping');
  void badge.offsetWidth;
  badge.classList.add('pumping');
  setTimeout(() => badge.classList.remove('pumping'), 700);
}
window.pumpXP = pumpXP;

/* ═══════════════════════════════════════════════════
   7. LOCALSTORAGE — Save & Restore Progress
══════════════════════════════════════════════════ */
const STORAGE_KEY = 'py_course_progress';

function saveProgress() {
  try {
    const data = {
      xp: window.xpPoints || 0,
      completed: window.completedMods ? [...window.completedMods] : [],
      currentModule: window.currentModule || 0,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch(e) {}
}

function restoreProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.xp && typeof window.xpPoints !== 'undefined') {
      window.xpPoints = data.xp;
      const xpEl = document.getElementById('xp-display');
      if (xpEl) xpEl.textContent = data.xp;
    }
    if (data.completed && window.completedMods) {
      data.completed.forEach(m => {
        window.completedMods.add(m);
        const item = document.getElementById('nav-' + m);
        if (item) item.classList.add('completed');
      });
    }
  } catch(e) {}
}

window.saveProgress    = saveProgress;
window.restoreProgress = restoreProgress;

// Autosave every 30 seconds when in course
setInterval(() => {
  if (document.getElementById('landing-page')?.style.display === 'none') saveProgress();
}, 30000);

/* ═══════════════════════════════════════════════════
   8. MODULE TRANSITION — smooth scroll to top
══════════════════════════════════════════════════ */
(function hookGoToModule() {
  const orig = window.goToModule;
  if (!orig) return;
  window.goToModule = function(idx) {
    orig(idx);
    // scroll main content to top
    const mc = document.getElementById('main-content');
    if (mc) mc.scrollTo({ top: 0, behavior: 'smooth' });
    // badge check on module complete
    setTimeout(() => {
      const xp = window.xpPoints || 0;
      checkBadges({ module: idx, xp });
    }, 500);
    // save
    setTimeout(saveProgress, 800);
  };
})();

/* ═══════════════════════════════════════════════════
   9. HOOK addXP for pump animation
══════════════════════════════════════════════════ */
(function hookAddXP() {
  // We'll patch after a tick so app.js is fully loaded
  setTimeout(() => {
    const orig = window.addXP;
    if (!orig) return;
    window.addXP = function(pts, reason) {
      orig(pts, reason);
      pumpXP();
      const xp = window.xpPoints || 0;
      checkBadges({ xp });
    };
  }, 500);
})();

/* ═══════════════════════════════════════════════════
   10. ANIMATE STAT NUMBERS on landing
══════════════════════════════════════════════════ */
(function animateStats() {
  const nums = document.querySelectorAll('.stat-num');
  nums.forEach(el => {
    const target = parseInt(el.textContent.replace('+',''));
    const hasPlus = el.textContent.includes('+');
    if (isNaN(target)) return;
    let current = 0;
    el.textContent = '0';
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + (hasPlus && current === target ? '+' : '');
      if (current >= target) clearInterval(timer);
    }, 40);
  });
})();

/* ═══════════════════════════════════════════════════
   11. RESTORE PROGRESS when startCourse is called
══════════════════════════════════════════════════ */
(function hookStartCourse() {
  // Wait for DOMContentLoaded to ensure app.js is fully parsed
  window.addEventListener('load', () => {
    const orig = window.startCourse;
    if (!orig) return;
    window.startCourse = function() {
      orig();
      setTimeout(restoreProgress, 100);
    };
  });
})();

/* ============================================================
   content-enhance.js — Interactive enhancements for Python Cybersecurity Course
   ============================================================ */

'use strict';

/* ----------------------------------------------------------
   1. Fill-in-the-blank checker
   ----------------------------------------------------------
   Usage:
     checkFill('fill01', ['print', 'str'])
   Each answer corresponds to a .fill-blank input whose id
   is built as:  <challengeId>-<index>  (e.g. fill01-0, fill01-1)
   The result div id is built as:  <challengeId>-result
   ---------------------------------------------------------- */
function checkFill(id, answers) {
  let allCorrect = true;

  // Support both array style: ['ans1','ans2']
  // and object style: {'inputId': 'answer', ...}
  if (Array.isArray(answers)) {
    // Array mode: input IDs are built as id+'-'+index
    answers.forEach(function (expected, idx) {
      const input = document.getElementById(id + '-' + idx);
      if (!input) return;
      const val = input.value.trim();
      const isCorrect = val.toLowerCase() === String(expected).toLowerCase();
      input.classList.remove('correct', 'wrong');
      void input.offsetWidth;
      input.classList.add(isCorrect ? 'correct' : 'wrong');
      if (!isCorrect) allCorrect = false;
    });
  } else {
    // Object mode: keys are input IDs, values are expected answers
    Object.keys(answers).forEach(function (inputId) {
      const input = document.getElementById(inputId);
      if (!input) return;
      const expected = answers[inputId];
      const val = input.value.trim();
      // Support pipe-separated alternatives: "answer1|answer2"
      const alternatives = String(expected).split('|').map(function(s){ return s.trim().toLowerCase(); });
      const isCorrect = alternatives.indexOf(val.toLowerCase()) !== -1;
      input.classList.remove('correct', 'wrong');
      void input.offsetWidth;
      input.classList.add(isCorrect ? 'correct' : 'wrong');
      if (!isCorrect) allCorrect = false;
    });
  }

  const result = document.getElementById(id + '-result') || document.getElementById(id);
  if (result) {
    result.classList.remove('show', 'pass', 'fail');
    setTimeout(function () {
      result.classList.add('show', allCorrect ? 'pass' : 'fail');
      result.textContent = allCorrect
        ? '✅ ممتاز! إجابة صحيحة — +10 XP'
        : '❌ حاول مرة أخرى — راجع الكود';
    }, 50);
  }

  if (allCorrect) {
    _awardXP(id, 10);
  }

  return allCorrect;
}

/* Internal: award XP once per challenge */
const _solvedChallenges = new Set(
  JSON.parse(localStorage.getItem('py_solved_fills') || '[]')
);

function _awardXP(id, points) {
  if (_solvedChallenges.has(id)) return;
  _solvedChallenges.add(id);
  localStorage.setItem('py_solved_fills', JSON.stringify([..._solvedChallenges]));

  let xp = parseInt(localStorage.getItem('py_xp') || '0', 10);
  xp += points;
  localStorage.setItem('py_xp', String(xp));

  // Update XP display if present
  const xpEl = document.getElementById('xp-count');
  if (xpEl) xpEl.textContent = xp;
}

/* ----------------------------------------------------------
   2. Cheat Sheet — toggle & initialise
   ---------------------------------------------------------- */
const CHEAT_ITEMS = [
  { code: 'print("نص")',           desc: 'طباعة نص' },
  { code: 'x = 5',                 desc: 'متغير' },
  { code: 'input("سؤال")',         desc: 'إدخال من المستخدم' },
  { code: 'int() float() str()',   desc: 'تحويل أنواع' },
  { code: 'if x > 0:',            desc: 'شرط' },
  { code: 'elif / else',           desc: 'شرط آخر / افتراضي' },
  { code: 'for i in range(n):',   desc: 'حلقة for' },
  { code: 'while condition:',      desc: 'حلقة while' },
  { code: 'list = []',            desc: 'قائمة فارغة' },
  { code: 'list.append(x)',       desc: 'إضافة لقائمة' },
  { code: 'len(list)',            desc: 'طول القائمة' },
  { code: 'def fn(params):',      desc: 'تعريف دالة' },
  { code: 'return value',         desc: 'إرجاع قيمة' },
  { code: '# تعليق',              desc: 'تعليق' },
  { code: 'f"نص {var}"',          desc: 'f-string' },
  { code: 'x + - * / // % **',   desc: 'عمليات حسابية' },
  { code: '== != > < >= <=',     desc: 'مقارنات' },
  { code: 'and or not',          desc: 'عمليات منطقية' },
];

function initCheatSheet() {
  const panel = document.getElementById('cheat-sheet-panel');
  const btn   = document.getElementById('cheat-sheet-btn');
  if (!panel || !btn) return;

  // Build cheat items inside #cheat-sheet-content if it exists
  // (title is already in HTML so we don't add it again)
  const contentEl = document.getElementById('cheat-sheet-content') || panel;

  // Clear any previous content
  contentEl.innerHTML = '';

  CHEAT_ITEMS.forEach(function (item) {
    const row = document.createElement('div');
    row.className = 'cheat-item';

    const code = document.createElement('span');
    code.className = 'cheat-code';
    code.textContent = item.code;

    const desc = document.createElement('span');
    desc.className = 'cheat-desc';
    desc.textContent = item.desc;

    row.appendChild(code);
    row.appendChild(desc);
    contentEl.appendChild(row);
  });

  // Show the floating button (flex)
  btn.style.display = 'flex';
}

function toggleCheatSheet() {
  const panel = document.getElementById('cheat-sheet-panel');
  if (!panel) return;
  panel.classList.toggle('show');
}

/* ----------------------------------------------------------
   3. Streak system
   ---------------------------------------------------------- */
function initStreakSystem() {
  const today      = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const lastVisit  = localStorage.getItem('py_streak_last') || '';
  let   streak     = parseInt(localStorage.getItem('py_streak_count') || '0', 10);

  if (lastVisit === today) {
    // Same day — no change
  } else if (_isYesterday(lastVisit, today)) {
    // Consecutive day
    streak += 1;
    localStorage.setItem('py_streak_count', String(streak));
    localStorage.setItem('py_streak_last', today);
  } else if (lastVisit === '') {
    // First visit ever
    streak = 1;
    localStorage.setItem('py_streak_count', '1');
    localStorage.setItem('py_streak_last', today);
  } else {
    // Streak broken
    streak = 1;
    localStorage.setItem('py_streak_count', '1');
    localStorage.setItem('py_streak_last', today);
  }

  _renderStreakBadge(streak);

  // Milestone rewards
  const milestones = { 3: ['🔥', 'سلسلة 3 أيام!', 'استمر هكذا — أنت على الطريق الصحيح!'],
                        7: ['🏆', 'أسبوع كامل!',   'أسبوع من التعلم المتواصل — رائع!'],
                       30: ['🌟', 'شهر متواصل!',  'خبرة شهر كامل — أنت محترف حقيقي!'] };
  if (milestones[streak] && lastVisit !== today) {
    const [icon, title, msg] = milestones[streak];
    setTimeout(function () { showMilestone(icon, title, msg); }, 1000);
  }
}

function _isYesterday(dateStr, todayStr) {
  if (!dateStr) return false;
  const yesterday = new Date(todayStr);
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().slice(0, 10);
}

function _renderStreakBadge(count) {
  // Look for existing badge or create one
  let badge = document.getElementById('streak-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'streak-badge';

    // Try to inject into header stats area
    const headerStats = document.querySelector('.header-stats, .hero-stats, .nav-right, header');
    if (headerStats) {
      headerStats.prepend(badge);
    } else {
      document.body.appendChild(badge);
    }
  }

  badge.innerHTML =
    '<span class="streak-fire">🔥</span>' +
    '<span>' + count + ' ' + (count === 1 ? 'يوم' : 'أيام') + ' متواصلة</span>';

  // Also update any in-module XP hints
  document.querySelectorAll('.module-xp-hint').forEach(function (el) {
    if (el.dataset.streakTarget) {
      el.textContent = '🔥 ' + count + ' أيام | ⚡ ' + (localStorage.getItem('py_xp') || '0') + ' XP';
    }
  });
}

/* ----------------------------------------------------------
   4. Milestone notification toast
   ---------------------------------------------------------- */
function showMilestone(icon, title, msg) {
  // Create toast if not present
  let toast = document.getElementById('milestone-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'milestone-toast';
    toast.innerHTML =
      '<span class="mt-icon"></span>' +
      '<div class="mt-title"></div>' +
      '<div class="mt-msg"></div>';
    document.body.appendChild(toast);
  }

  toast.querySelector('.mt-icon').textContent  = icon;
  toast.querySelector('.mt-title').textContent = title;
  toast.querySelector('.mt-msg').textContent   = msg;

  // Show
  requestAnimationFrame(function () {
    toast.classList.add('show');
  });

  // Auto-hide after 4 seconds
  setTimeout(function () {
    toast.classList.remove('show');
  }, 4000);
}

/* ----------------------------------------------------------
   5. Keyboard shortcuts
      Ctrl+→  — next module
      Ctrl+←  — previous module
      Ctrl+/  — toggle cheat sheet
   ---------------------------------------------------------- */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', function (e) {
    // Ignore when typing in an input / textarea
    if (e.target.matches('input, textarea, [contenteditable]')) {
      // Allow Ctrl+/ even inside inputs so they can quickly look up cheat sheet
      if (!(e.ctrlKey && e.key === '/')) return;
    }

    if (e.ctrlKey && e.key === 'ArrowRight') {
      e.preventDefault();
      _navigateModule(1);
    } else if (e.ctrlKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      _navigateModule(-1);
    } else if (e.ctrlKey && e.key === '/') {
      e.preventDefault();
      toggleCheatSheet();
    }
  });
}

function _navigateModule(direction) {
  // Assumes modules are shown/hidden via a class like 'active'
  // and the main nav uses data-module="N" buttons or similar.
  // Try to find the currently active module index.
  const modules = Array.from(document.querySelectorAll('.module-content, .module-section, [data-module-id]'));
  if (!modules.length) return;

  let currentIdx = modules.findIndex(function (m) {
    return m.classList.contains('active') || m.style.display !== 'none';
  });

  if (currentIdx === -1) currentIdx = 0;

  const nextIdx = Math.max(0, Math.min(modules.length - 1, currentIdx + direction));
  if (nextIdx === currentIdx) return;

  // Try clicking corresponding nav button first (preserves any existing navigation logic)
  const navBtns = document.querySelectorAll('.module-btn, [data-module], .nav-module-btn');
  if (navBtns[nextIdx]) {
    navBtns[nextIdx].click();
    return;
  }

  // Fallback: toggle visibility directly
  modules[currentIdx].classList.remove('active');
  modules[currentIdx].style.display = 'none';
  modules[nextIdx].classList.add('active');
  modules[nextIdx].style.display = '';
  modules[nextIdx].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ----------------------------------------------------------
   6. Auto-init on DOM ready
   ---------------------------------------------------------- */
(function () {
  function bootstrap() {
    initCheatSheet();
    initStreakSystem();
    initKeyboardShortcuts();

    // Wire cheat sheet button click
    const btn = document.getElementById('cheat-sheet-btn');
    if (btn) {
      btn.addEventListener('click', toggleCheatSheet);
      btn.title = 'ورقة المراجعة السريعة (Ctrl+/)';
    }

    // Close cheat sheet when clicking outside
    document.addEventListener('click', function (e) {
      const panel = document.getElementById('cheat-sheet-panel');
      const csBtn = document.getElementById('cheat-sheet-btn');
      if (panel && panel.classList.contains('show') &&
          !panel.contains(e.target) &&
          e.target !== csBtn) {
        panel.classList.remove('show');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();

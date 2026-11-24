/* =====================================================
   app.js — Navigation, Quiz, Exam, Editor, Cyber Tools
   ===================================================== */

/* ============ STATE ============ */
let currentModule  = 0;
let xpPoints       = 0;
let completedMods  = new Set();
let quizAnswered   = {};
let examAnswers    = {};
let loopTimer      = null;

/* ============ STARTUP ============ */
function startCourse() {
  document.getElementById('landing-page').style.display   = 'none';
  document.getElementById('app-header').style.display     = 'flex';
  document.getElementById('app-layout').style.display     = 'flex';
  buildNav();
  renderAllQuizzes();
  renderExam();
  goToModule(0);
  // init line numbers for every editor
  document.querySelectorAll('.code-textarea').forEach(ta => {
    updateLines(ta.id, ta.dataset.ln);
  });
  // init animated visualizers (from animations.js)
  if (typeof initAllAnimations === 'function') {
    setTimeout(initAllAnimations, 300);
  }
  // Show cheat sheet button when course starts
  const csBtn = document.getElementById('cheat-sheet-btn');
  if (csBtn) {
    csBtn.style.display = 'flex';
    csBtn.style.alignItems = 'center';
    csBtn.style.justifyContent = 'center';
  }
}

/* ============ NAVIGATION ============ */
function buildNav() {
  const nav = document.getElementById('module-nav');
  nav.innerHTML = MODULES.map((name, i) => `
    <div class="module-nav-item ${i===0?'active':''}" id="nav-${i}" onclick="goToModule(${i})">
      <div class="nav-num">${i < 10 ? String(i+1).padStart(2,'0') : MODULE_ICONS[i]}</div>
      <div class="nav-title">${MODULE_ICONS[i]} ${name}</div>
      <div class="nav-check">✓</div>
    </div>`
  ).join('');
}

function goToModule(idx) {
  document.querySelectorAll('.module-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.module-nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById(`module-${idx}`);
  if (page) { page.classList.add('active'); page.scrollIntoView({ behavior:'smooth', block:'start' }); }

  const nav = document.getElementById(`nav-${idx}`);
  if (nav) nav.classList.add('active');

  currentModule = idx;
  updateProgressBar();
  document.getElementById('sidebar').classList.remove('open');
}

function updateProgressBar() {
  const pct = Math.round(((currentModule + 1) / MODULES.length) * 100);
  document.getElementById('top-progress-fill').style.width = pct + '%';
  if (currentModule > 0) {
    completedMods.add(currentModule - 1);
    const prev = document.getElementById(`nav-${currentModule - 1}`);
    if (prev) prev.classList.add('completed');
    // Badge check on module advance
    if (typeof checkBadges === 'function') {
      checkBadges({ module: currentModule - 1, xp: xpPoints });
    }
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* ============ XP & TOAST ============ */
function addXP(amount) {
  xpPoints += amount;
  const el = document.getElementById('xp-display');
  if (el) el.textContent = xpPoints;
  // Pump animation (ui-upgrade.js)
  if (typeof pumpXP === 'function') pumpXP();
  // Badge check
  if (typeof checkBadges === 'function') checkBadges({ xp: xpPoints });
  // Save
  if (typeof saveProgress === 'function') saveProgress();
}

function showToast(msg, type = 'info', icon = '') {
  const t   = document.getElementById('toast');
  const ico = document.getElementById('toast-icon');
  const m   = document.getElementById('toast-msg');
  if (!t) return;
  if (ico) ico.textContent = icon || (type === 'success' ? '🏆' : type === 'error' ? '❌' : 'ℹ️');
  if (m)  m.textContent   = msg;
  t.className = `show ${type}`;
  setTimeout(() => { t.className = ''; }, 3200);
}

/* ============ EDITOR HELPERS ============ */
function updateLines(edId, lnId) {
  if (!edId || !lnId) return;
  const ed = document.getElementById(edId);
  const ln = document.getElementById(lnId);
  if (!ed || !ln) return;
  const count = ed.value.split('\n').length;
  ln.innerHTML = Array.from({length: count}, (_, i) => i + 1).join('<br>');
}

function handleTab(e) {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const ta  = e.target;
  const sel = ta.selectionStart;
  ta.value  = ta.value.substring(0, sel) + '    ' + ta.value.substring(sel);
  ta.selectionStart = ta.selectionEnd = sel + 4;
  updateLines(ta.id, ta.dataset.ln);
}

function resetEditor(edId, lnId, defaultCode) {
  const ed = document.getElementById(edId);
  if (ed) { ed.value = defaultCode; updateLines(edId, lnId); }
}

/* ============ QUIZ ============ */
const LETTERS = ['أ','ب','ج','د'];

function renderAllQuizzes() {
  QUIZ_DATA.forEach((questions, modIdx) => {
    const c = document.getElementById(`quiz-${modIdx}`);
    if (!c) return;
    c.innerHTML = questions.map((q, qi) => `
      <div class="question-block">
        <div class="question-text"><span class="question-num">س${qi+1}.</span> ${q.q.replace(/\n/g,'<br>')}</div>
        <div class="options-list">
          ${q.opts.map((opt, oi) => `
            <button class="option-btn" id="opt-${modIdx}-${qi}-${oi}"
              onclick="answerQuiz(${modIdx},${qi},${oi})">
              <span class="option-letter">${LETTERS[oi]}</span>${opt}
            </button>`).join('')}
        </div>
        <div class="feedback-box" id="fb-${modIdx}-${qi}"></div>
      </div>`
    ).join('');
  });
}

function answerQuiz(modIdx, qi, chosen) {
  const key = `${modIdx}-${qi}`;
  if (quizAnswered[key]) return;
  quizAnswered[key] = true;
  const q = QUIZ_DATA[modIdx][qi];

  q.opts.forEach((_, oi) => {
    const btn = document.getElementById(`opt-${modIdx}-${qi}-${oi}`);
    btn.disabled = true;
    if (oi === q.correct) btn.classList.add('correct');
    else if (oi === chosen) btn.classList.add('wrong');
  });

  const fb = document.getElementById(`fb-${modIdx}-${qi}`);
  if (chosen === q.correct) {
    fb.className = 'feedback-box show correct-fb';
    fb.innerHTML = `✅ <strong>أحسنت!</strong> ${q.fb}`;
    addXP(10);
    showToast('🏆 إجابة صحيحة! +10 XP', 'success');
  } else {
    fb.className = 'feedback-box show wrong-fb';
    fb.innerHTML = `❌ <strong>الإجابة الصحيحة:</strong> ${q.opts[q.correct]}<br>${q.fb}`;
  }
}

/* ============ EXAM ============ */
function renderExam() {
  const c = document.getElementById('exam-container');
  if (!c) return;
  c.innerHTML = EXAM_QUESTIONS.map((q, qi) => `
    <div class="exam-question">
      <span class="q-type">${q.type}</span>
      <div class="question-text">${qi+1}. ${q.q.replace(/\n/g,'<br>')}</div>
      ${q.opts ? `<div class="options-list">
        ${q.opts.map((opt, oi) => `
          <button class="option-btn" id="exam-opt-${qi}-${oi}"
            onclick="examAnswer(${qi},${oi})">
            <span class="option-letter">${LETTERS[oi]||oi}</span>${opt}
          </button>`).join('')}
      </div>` : ''}
    </div>`
  ).join('') + `<button class="submit-exam-btn" onclick="submitExam()">📝 تسليم الاختبار</button>`;
}

function examAnswer(qi, oi) {
  examAnswers[qi] = oi;
  const q = EXAM_QUESTIONS[qi];
  (q.opts||[]).forEach((_,o) => {
    const b = document.getElementById(`exam-opt-${qi}-${o}`);
    if (b) { b.style.borderColor=''; b.style.background=''; }
  });
  const sel = document.getElementById(`exam-opt-${qi}-${oi}`);
  if (sel) { sel.style.borderColor='var(--python-blue)'; sel.style.background='rgba(55,118,171,0.2)'; }
}

function submitExam() {
  let correct = 0;
  const topicMap = {};

  EXAM_QUESTIONS.forEach((q, qi) => {
    const ok = examAnswers[qi] === q.correct;
    if (ok) correct++;

    // show correct/wrong on buttons
    (q.opts||[]).forEach((_,oi) => {
      const b = document.getElementById(`exam-opt-${qi}-${oi}`);
      if (!b) return;
      b.disabled = true;
      if (oi === q.correct)   b.classList.add('correct');
      else if (oi === examAnswers[qi]) b.classList.add('wrong');
    });

    if (!topicMap[q.topic]) topicMap[q.topic] = { pass:0, total:0 };
    topicMap[q.topic].total++;
    if (ok) topicMap[q.topic].pass++;
  });

  const total  = EXAM_QUESTIONS.length;
  const scoreEl   = document.getElementById('exam-score-display');
  const verdictEl = document.getElementById('exam-verdict');
  const analysisEl= document.getElementById('exam-analysis');

  scoreEl.textContent = `${correct}/${total}`;
  scoreEl.className   = 'exam-score ' + (correct >= 12 ? 'excellent' : correct >= 8 ? 'good' : 'poor');
  verdictEl.textContent = correct >= 12 ? '🏆 ممتاز! أنت Python Developer!'
                        : correct >= 8  ? '👍 جيد! راجع النقاط الضعيفة'
                        :                 '📚 راجع المحتوى وحاول مجدداً';

  analysisEl.innerHTML = '<div style="margin-top:16px;text-align:right">' +
    Object.entries(topicMap).map(([topic, d]) => `
      <div class="analysis-item ${d.pass===d.total?'pass':'fail'}">
        ${d.pass===d.total?'✅':'❌'} ${topic}: ${d.pass}/${d.total}
      </div>`).join('') + '</div>';

  document.getElementById('exam-result').classList.add('show');
  if (correct >= 12) {
    addXP(100);
    showToast('🎓 أكملت الكورس! +100 XP', 'success', '🎓');
    if (typeof launchConfetti === 'function') launchConfetti(80);
    if (typeof checkBadges === 'function') {
      checkBadges({ module: 13, xp: xpPoints });
      if (correct === total) checkBadges({ exam100: true });
    }
    // Show certificate button
    setTimeout(showCertificateBtn, 800);
  }

  const submitBtn = document.querySelector('.submit-exam-btn');
  if (submitBtn) submitBtn.style.display = 'none';
}

function showCertificateBtn() {
  const res = document.getElementById('exam-result');
  if (!res) return;
  if (document.getElementById('cert-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'cert-btn';
  btn.className = 'submit-exam-btn';
  btn.style.cssText = 'margin-top:12px;background:linear-gradient(135deg,#FFD43B,#ffa500);color:#0a0a0f;';
  btn.textContent = '📜 احصل على شهادتك';
  btn.onclick = showCertificate;
  res.appendChild(btn);
}

function showCertificate() {
  const name  = prompt('أدخل اسمك لإنشاء الشهادة:', '') || 'المتدرب';
  const score = document.getElementById('exam-score-display')?.textContent || '';
  const date  = new Date().toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' });

  const win = window.open('', '_blank', 'width=900,height=650');
  win.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl">
<head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&family=Fira+Code:wght@400;600&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0a0a0f;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Tajawal',sans-serif;}
  .cert{
    width:820px;padding:60px;text-align:center;position:relative;
    background:linear-gradient(135deg,#0d1117,#161b22,#0a1628);
    border:2px solid #3776AB;border-radius:24px;
    box-shadow:0 0 60px rgba(55,118,171,0.4),0 0 120px rgba(55,118,171,0.1),inset 0 0 60px rgba(55,118,171,0.03);
  }
  .cert::before{
    content:'';position:absolute;inset:12px;border:1px solid rgba(55,118,171,0.2);border-radius:16px;pointer-events:none;
  }
  .logo{font-family:'Fira Code',monospace;font-size:48px;font-weight:900;color:#FFD43B;margin-bottom:16px;}
  .title{font-size:14px;color:#3776AB;letter-spacing:4px;text-transform:uppercase;margin-bottom:32px;}
  .certify{font-size:18px;color:#8b949e;margin-bottom:12px;}
  .student{font-size:42px;font-weight:900;color:#fff;margin-bottom:8px;
    background:linear-gradient(135deg,#fff,#FFD43B);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .course{font-size:16px;color:#8b949e;margin-bottom:28px;line-height:2;}
  .course strong{color:#00d4ff;}
  .score-box{
    display:inline-block;padding:16px 48px;border-radius:50px;margin-bottom:28px;
    background:linear-gradient(135deg,rgba(55,118,171,0.2),rgba(55,118,171,0.05));
    border:1px solid rgba(55,118,171,0.4);
  }
  .score-label{font-size:12px;color:#8b949e;margin-bottom:4px;}
  .score-val{font-family:'Fira Code',monospace;font-size:36px;font-weight:900;color:#3fb950;}
  .badges{font-size:28px;margin-bottom:28px;letter-spacing:6px;}
  .meta{display:flex;justify-content:space-between;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05);font-size:12px;color:#484f58;}
  .seal{font-size:48px;line-height:1;}
  .print-btn{
    display:block;margin:24px auto 0;padding:12px 32px;border-radius:12px;border:none;cursor:pointer;
    background:linear-gradient(135deg,#3776AB,#2ea8cc);color:#fff;font-size:15px;font-family:'Tajawal',sans-serif;font-weight:700;
  }
  @media print{.print-btn{display:none}.cert{box-shadow:none;border-color:#ccc;}body{background:#fff;}}
</style></head><body>
<div>
  <div class="cert">
    <div class="logo">Py</div>
    <div class="title">شهادة إتمام كورس</div>
    <div class="certify">يُشهد بأن المتدرب/ة</div>
    <div class="student">${name}</div>
    <div class="course">
      قد أتمّ/ت بنجاح كورس<br>
      <strong>Python للأمن السيبراني — من الصفر للاحتراف</strong><br>
      بما يشمل 10 وحدات تعليمية، تصورات متحركة، أدوات الأمن السيبراني، ومشروع تطبيقي
    </div>
    <div class="score-box">
      <div class="score-label">درجة الاختبار النهائي</div>
      <div class="score-val">${score}</div>
    </div>
    <div class="badges">🐍 ⚡ 🔐 🏆</div>
    <div class="meta">
      <div><div class="seal">🎓</div><div style="margin-top:4px">مُصدَرة بتاريخ ${date}</div></div>
      <div style="text-align:center">
        <div style="font-size:13px;color:#FFD43B;font-weight:800;letter-spacing:0.5px">Mahmoud Omar</div>
        <div style="font-size:11px;color:#3776AB;font-weight:700">Course Creator & Cybersecurity Lead</div>
        <div style="color:#484f58;margin-top:4px;font-size:10px">Python for Cybersecurity — 2026</div>
      </div>
      <div style="text-align:left"><div class="seal">✅</div><div style="margin-top:4px">تم التحقق من الإنجاز</div></div>
    </div>
  </div>
  <button class="print-btn" onclick="window.print()">🖨️ طباعة الشهادة</button>
</div>
</body></html>`);
  win.document.close();
}

function restartExam() {
  examAnswers = {};
  document.getElementById('exam-result').classList.remove('show');
  renderExam();
}

/* ============ LAB ============ */
function loadLabExample(idx) {
  const ed = document.getElementById('lab-ed');
  if (ed) { ed.value = LAB_EXAMPLES[idx]; updateLines('lab-ed','lab-ln'); }
}
function clearLabOutput() {
  document.getElementById('lab-out').innerHTML = '<span class="console-info">تم مسح النتيجة</span>';
}

/* ============ LOOP ANIMATION ============ */
function startLoopAnim() {
  resetLoopAnim();
  let step = 0;
  loopTimer = setInterval(() => {
    if (step > 0) {
      const prev = document.getElementById(`li${step-1}`);
      if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
    }
    if (step >= 5) {
      document.getElementById('loop-counter').textContent = '✅ انتهت الحلقة بعد 5 دورات!';
      clearInterval(loopTimer); return;
    }
    const cur = document.getElementById(`li${step}`);
    if (cur) cur.classList.add('active');
    document.getElementById('loop-counter').textContent = `🔄 الدورة رقم ${step} — i = ${step}`;
    step++;
  }, 700);
}
function resetLoopAnim() {
  if (loopTimer) clearInterval(loopTimer);
  for (let i = 0; i < 5; i++) {
    const el = document.getElementById(`li${i}`);
    if (el) el.classList.remove('active','done');
  }
  document.getElementById('loop-counter').textContent = 'for i in range(5): — اضغط تشغيل';
}

/* ============ CALCULATOR ============ */
function calcOp(op) {
  const a = parseFloat(document.getElementById('calc-a').value);
  const b = parseFloat(document.getElementById('calc-b').value);
  let result;
  const ops = {
    '+': a+b, '-': a-b, '*': a*b,
    '/': b!==0 ? a/b : 'خطأ: القسمة على صفر',
    '//': Math.floor(a/b), '%': a%b, '**': Math.pow(a,b)
  };
  result = ops[op];
  document.getElementById('calc-result').textContent = `${a} ${op} ${b} = ${result}`;
}

/* ============ CYBER TOOLS ============ */
function checkPassword() {
  const pwd = document.getElementById('pwd-input').value;
  let score = 0; const tips = [];
  if (pwd.length >= 8) score++; else tips.push('أقصر من 8 أحرف');
  if (/[A-Z]/.test(pwd)) score++; else tips.push('لا يوجد حروف كبيرة');
  if (/[0-9]/.test(pwd)) score++; else tips.push('لا يوجد أرقام');
  if (/[!@#$%^&*]/.test(pwd)) score++; else tips.push('لا يوجد رموز خاصة');

  const levels = [
    {c:'#f85149',l:'🔴 ضعيفة جداً', p:15},
    {c:'#d29922',l:'🟠 ضعيفة',      p:35},
    {c:'#ffa500',l:'🟡 متوسطة',     p:60},
    {c:'#3fb950',l:'🟢 جيدة',       p:80},
    {c:'#00d4ff',l:'💪 قوية جداً',  p:100}
  ];
  const lv = levels[Math.min(score, 4)];
  const bar = document.getElementById('strength-bar');
  bar.style.width = lv.p + '%';
  bar.style.background = lv.c;
  document.getElementById('pwd-result').innerHTML =
    `<span style="color:${lv.c}">${lv.l}</span>` +
    (tips.length ? `<br><small style="color:var(--text-secondary)">${tips.join(' | ')}</small>` : '');
}

function togglePwd() {
  const inp = document.getElementById('pwd-input');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function validateIP() {
  const ip    = document.getElementById('ip-input').value.trim();
  const parts = ip.split('.');
  const r     = document.getElementById('ip-result');
  if (parts.length !== 4) { r.innerHTML='<span style="color:var(--error)">❌ IP يجب أن يحتوي على 4 أجزاء</span>'; return; }
  for (const p of parts) {
    if (!/^\d+$/.test(p) || parseInt(p)<0 || parseInt(p)>255) {
      r.innerHTML=`<span style="color:var(--error)">❌ "${p}" ليس رقماً صحيحاً بين 0 و255</span>`; return;
    }
  }
  const type = parts[0]==='192' && parts[1]==='168' ? 'خاص (Private)'
             : parts[0]==='10'                      ? 'خاص (Private)'
             : parts[0]==='127'                     ? 'Loopback (جهاز محلي)'
             :                                        'عام (Public)';
  r.innerHTML=`<span style="color:var(--success)">✅ IP صحيح — النوع: ${type}</span>`;
}

function doCipher(decrypt=false) {
  const text  = document.getElementById('cipher-text').value.toUpperCase();
  const shift = parseInt(document.getElementById('cipher-shift').value) * (decrypt ? -1 : 1);
  let result  = '';
  for (const c of text) {
    if (/[A-Z]/.test(c)) result += String.fromCharCode((c.charCodeAt(0)-65+shift+26)%26+65);
    else result += c;
  }
  const icon = decrypt ? '🔓 مفكوك' : '🔒 مشفّر';
  const col  = decrypt ? 'var(--python-yellow)' : 'var(--neon-green)';
  document.getElementById('cipher-result').innerHTML = `<span style="color:${col}">${icon}: ${result}</span>`;
}

/* ============ PROJECT STEPS ============ */
function toggleStep(id) {
  const num    = id.replace('s','');
  const body   = document.getElementById(id);
  const toggle = document.getElementById(`st${num}`);
  body.classList.toggle('open');
  toggle.classList.toggle('open');
}
function toggleHint(id)     { document.getElementById(id).classList.toggle('show'); }
function toggleSolution(id) { document.getElementById(id).classList.toggle('show'); }

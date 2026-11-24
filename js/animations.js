/* =====================================================
   animations.js — Animated Video-Like Visualizers
   Python for Cybersecurity Course
   ===================================================== */

'use strict';

/* ─────────────────────────────────────────────────────
   GLOBAL REGISTRY & SPEED TABLE
───────────────────────────────────────────────────── */
const AnimRegistry = {};   // id → AnimPlayer instance
const SPEED_MS = { 1: 2000, 2: 1200, 3: 700, 4: 350 };

/* ─────────────────────────────────────────────────────
   PUBLIC API  (called from HTML onclick)
───────────────────────────────────────────────────── */
function animPlay(id)    { AnimRegistry[id]?.play(); }
function animStep(id)    { AnimRegistry[id]?.step(); }
function animRestart(id) { AnimRegistry[id]?.restart(); }
function animSpeed(id, v){ AnimRegistry[id]?.setSpeed(+v); }
function animGoto(id, i) { AnimRegistry[id]?.goto(+i); }

/* ─────────────────────────────────────────────────────
   AnimPlayer CLASS
───────────────────────────────────────────────────── */
class AnimPlayer {
  constructor(id, steps) {
    this.id      = id;
    this.steps   = steps;   // [{html, explain, draw?}]
    this.cur     = -1;
    this.playing = false;
    this.speed   = 2;
    this._timer  = null;

    this.stageEl   = document.getElementById('stage-'  + id);
    this.explainEl = document.getElementById('explain-' + id);
    this.progEl    = document.getElementById('prog-'   + id);
    this.dotsEl    = document.getElementById('dots-'   + id);
    this.playBtn   = document.getElementById('playbtn-' + id);

    this._buildDots();
    this.goto(0);
  }

  _buildDots() {
    if (!this.dotsEl) return;
    this.dotsEl.innerHTML = this.steps.map((_, i) =>
      `<span class="step-dot" onclick="animGoto('${this.id}',${i})" title="خطوة ${i+1}"></span>`
    ).join('');
  }

  _updateDots() {
    if (!this.dotsEl) return;
    [...this.dotsEl.children].forEach((d, i) => {
      d.classList.toggle('active', i === this.cur);
      d.classList.toggle('done',   i < this.cur);
    });
  }

  _updateProgress() {
    if (!this.progEl) return;
    const pct = this.steps.length <= 1 ? 100
      : (this.cur / (this.steps.length - 1)) * 100;
    this.progEl.style.width = pct + '%';
  }

  _render() {
    const s = this.steps[this.cur];
    if (!s) return;

    // Stage HTML or draw fn
    if (this.stageEl) {
      if (s.html !== undefined) {
        this.stageEl.innerHTML = s.html;
        // trigger CSS transitions after paint
        requestAnimationFrame(() => {
          if (s.activate) s.activate(this.stageEl);
        });
      }
      if (typeof s.draw === 'function') s.draw(this.stageEl);
    }

    // Explanation
    if (this.explainEl && s.explain) {
      const badge = `<span class="step-badge">${this.cur + 1}/${this.steps.length}</span>`;
      this.explainEl.innerHTML = badge + ' ' + s.explain;
    }

    this._updateDots();
    this._updateProgress();
  }

  goto(i) {
    this.cur = Math.max(0, Math.min(i, this.steps.length - 1));
    this._render();
  }

  step() {
    this.pause();
    if (this.cur < this.steps.length - 1) {
      this.cur++;
      this._render();
    }
  }

  play() {
    if (this.playing) { this.pause(); return; }
    if (this.cur >= this.steps.length - 1) this.cur = -1;
    this.playing = true;
    if (this.playBtn) {
      this.playBtn.textContent = '⏸ إيقاف';
      this.playBtn.classList.add('active');
    }
    const advance = () => {
      if (this.cur < this.steps.length - 1) {
        this.cur++;
        this._render();
        this._timer = setTimeout(advance, SPEED_MS[this.speed] || 1200);
      } else {
        this.pause();
      }
    };
    this._timer = setTimeout(advance, 400);
  }

  pause() {
    this.playing = false;
    clearTimeout(this._timer);
    if (this.playBtn) {
      this.playBtn.textContent = '▶ تشغيل';
      this.playBtn.classList.remove('active');
    }
  }

  restart() {
    this.pause();
    this.cur = -1;
    this.goto(0);
  }

  setSpeed(v) { this.speed = v; }
}

/* ─────────────────────────────────────────────────────
   HELPER: build player HTML into a container div
───────────────────────────────────────────────────── */
function buildPlayer(id, title, steps) {
  const el = document.getElementById('anim-' + id);
  if (!el) return;

  const dotsHtml = steps.map((_, i) =>
    `<span class="step-dot" onclick="animGoto('${id}',${i})" title="خطوة ${i+1}"></span>`
  ).join('');

  el.innerHTML = `
    <div class="anim-player-header">
      <span class="anim-player-title"><span class="dot"></span>${title}</span>
      <div class="step-dots" id="dots-${id}">${dotsHtml}</div>
    </div>
    <div class="anim-progress"><div class="anim-progress-fill" id="prog-${id}"></div></div>
    <div class="anim-stage" id="stage-${id}">
      <div class="anim-explain" id="explain-${id}">اضغط ▶ تشغيل لبدء التصور المتحرك</div>
    </div>
    <div class="anim-controls">
      <button class="ctrl-btn primary" id="playbtn-${id}" onclick="animPlay('${id}')">▶ تشغيل</button>
      <button class="ctrl-btn" onclick="animStep('${id}')">⏭ خطوة</button>
      <button class="ctrl-btn" onclick="animRestart('${id}')">↺ إعادة</button>
      <div class="speed-control">السرعة
        <input type="range" min="1" max="4" value="2" oninput="animSpeed('${id}',this.value)">
      </div>
    </div>
  `;

  AnimRegistry[id] = new AnimPlayer(id, steps);
}

/* ═══════════════════════════════════════════════════
   ANIMATION DEFINITIONS
══════════════════════════════════════════════════════ */

/* ───────── MODULE 01 — ما هي البرمجة؟
   Flow: Human → Idea → Python → Computer → Output
─────────────────────────────────────────────────── */
function initAnim01() {
  const nodes = [
    { icon:'🧑', label:'الإنسان', sub:'Human', color:'var(--python-blue)' },
    { icon:'💡', label:'فكرة / أمر', sub:'Instruction', color:'#8B5CF6' },
    { icon:'🐍', label:'Python', sub:'لغة البرمجة', color:'var(--python-yellow)' },
    { icon:'💻', label:'الكمبيوتر', sub:'CPU + Memory', color:'var(--neon-blue)' },
    { icon:'✅', label:'النتيجة', sub:'Output', color:'var(--neon-green)' },
  ];

  function flowHtml(activeIdx) {
    return `
      <div style="display:flex;align-items:center;justify-content:center;gap:0;flex-wrap:wrap;padding:24px 12px;width:100%">
        ${nodes.map((n, i) => `
          <div style="display:flex;align-items:center;">
            <div style="
              display:flex;flex-direction:column;align-items:center;gap:6px;
              padding:14px 16px;border-radius:14px;min-width:80px;text-align:center;
              border:2px solid ${i <= activeIdx ? n.color : '#1e2a3a'};
              background:${i === activeIdx ? `rgba(0,0,0,0.5)` : i < activeIdx ? 'rgba(0,0,0,0.3)' : '#060a0f'};
              transition:all 0.4s;
              box-shadow:${i === activeIdx ? `0 0 20px ${n.color}55` : 'none'};
              transform:${i === activeIdx ? 'scale(1.1)' : 'scale(1)'};
            ">
              <span style="font-size:28px">${n.icon}</span>
              <span style="font-size:12px;font-weight:700;color:${i <= activeIdx ? n.color : '#3a4a5a'}">${n.label}</span>
              <span style="font-size:10px;color:#3a4a5a">${n.sub}</span>
            </div>
            ${i < nodes.length - 1 ? `
              <div style="
                font-size:20px;padding:0 4px;
                color:${i < activeIdx ? '#58a6ff' : '#1e2a3a'};
                transition:color 0.4s;
              ">→</div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  const explains = [
    'الإنسان هو من يمتلك الفكرة أو المشكلة التي يريد حلها بالبرمجة.',
    'يحوّل المبرمج الفكرة إلى أوامر وتعليمات منطقية مرتبة.',
    'Python هي اللغة التي تترجم أفكارنا إلى شكل يفهمه الكمبيوتر — بناء جملة بسيط وقوي.',
    'الكمبيوتر (CPU + الذاكرة) ينفّذ التعليمات بسرعة فائقة — ملايين العمليات في الثانية!',
    'تظهر النتيجة على الشاشة أو ترسل عبر الشبكة أو تُحفظ في ملف — البرنامج أدّى مهمته! 🎉',
  ];

  buildPlayer('anim01', '🎬 تصور متحرك — كيف تعمل البرمجة؟', [
    { html: flowHtml(-1), explain: 'قبل البداية — سنتتبع رحلة الفكرة من الإنسان وصولاً للنتيجة.' },
    ...explains.map((e, i) => ({ html: flowHtml(i), explain: e }))
  ]);
}

/* ───────── MODULE 02 — المترجم (Interpreter)
   Code lines executing one by one
─────────────────────────────────────────────────── */
function initAnim02() {
  const lines = [
    { code: `name = "أحمد"`,        color: 'var(--neon-blue)',   out: null },
    { code: `age  = 20`,            color: 'var(--python-yellow)', out: null },
    { code: `print(name)`,          color: 'var(--neon-green)',   out: '→ أحمد' },
    { code: `print(age + 5)`,       color: 'var(--neon-green)',   out: '→ 25' },
    { code: `print("Done!")`,       color: 'var(--neon-green)',   out: '→ Done!' },
  ];

  function traceHtml(activeIdx, outputs) {
    return `
      <div style="display:flex;gap:16px;padding:16px;width:100%;box-sizing:border-box">
        <div style="flex:1">
          <div style="font-size:10px;color:#3a4a5a;margin-bottom:8px;font-family:'Fira Code',monospace">▍ script.py</div>
          <div class="code-trace">
            ${lines.map((l, i) => `
              <div class="trace-line ${i === activeIdx ? 'current' : i < activeIdx ? 'executed' : ''}">
                <span class="trace-ln">${i+1}</span>
                ${i === activeIdx ? '<span class="trace-arrow">►</span>' : '<span class="trace-arrow" style="opacity:0">►</span>'}
                <span style="color:${i <= activeIdx ? l.color : '#3a4a5a'};font-family:\'Fira Code\',monospace;font-size:12px">${l.code}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="width:140px">
          <div style="font-size:10px;color:#3a4a5a;margin-bottom:8px;font-family:'Fira Code',monospace">▍ output</div>
          <div style="background:#060a0f;border:1px solid #1e2a3a;border-radius:8px;padding:12px;min-height:120px;font-family:'Fira Code',monospace;font-size:12px">
            ${outputs.map(o => `<div style="color:var(--neon-green)">${o}</div>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  const steps = [{ html: traceHtml(-1, []), explain: 'الكود جاهز — الـ Interpreter سيقرأ كل سطر بالترتيب ↓' }];
  const outs = [];
  lines.forEach((l, i) => {
    if (l.out) outs.push(l.out);
    steps.push({ html: traceHtml(i, [...outs]), explain: `السطر ${i+1}: <code style="color:var(--python-yellow)">${l.code}</code> — يُنفَّذ الآن!${l.out ? ' النتيجة: <strong style="color:var(--neon-green)">' + l.out + '</strong>' : ' قيمة محفوظة في الذاكرة.'}` });
  });
  steps.push({ html: traceHtml(lines.length, outs), explain: 'اكتمل تنفيذ الكود! الـ Interpreter أنهى كل الأسطر بالترتيب ✅' });

  buildPlayer('anim02', '🎬 تصور متحرك — كيف يعمل الـ Interpreter؟', steps);
}

/* ───────── MODULE 03 — print() anatomy
─────────────────────────────────────────────────── */
function initAnim03() {
  const parts = [
    { label:'print',  color:'var(--python-blue)',   desc:'الدالة المدمجة — تأمر Python بالطباعة' },
    { label:'(',      color:'#8B5CF6',               desc:'قوس الفتح — بداية المعاملات (Arguments)' },
    { label:'"Hello, World!"', color:'var(--neon-green)', desc:'النص (String) — أي نص بين علامتي تنصيص' },
    { label:')',      color:'#8B5CF6',               desc:'قوس الإغلاق — نهاية المعاملات' },
  ];

  function anatomyHtml(activeIdx) {
    const colors = parts.map((p, i) => i === activeIdx ? p.color : i < activeIdx ? p.color + '99' : '#3a4a5a');
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:24px;width:100%;box-sizing:border-box">
        <div style="display:flex;align-items:center;justify-content:center;font-family:'Fira Code',monospace;font-size:22px;gap:0;flex-wrap:wrap">
          ${parts.map((p, i) => `
            <span style="
              color:${colors[i]};
              background:${i === activeIdx ? `${p.color}22` : 'transparent'};
              border-radius:6px;padding:4px 6px;
              text-shadow:${i === activeIdx ? `0 0 12px ${p.color}` : 'none'};
              transition:all 0.4s;font-weight:${i === activeIdx ? '700':'400'};
              border-bottom:${i === activeIdx ? `2px solid ${p.color}` : '2px solid transparent'};
            ">${p.label}</span>
          `).join('')}
        </div>
        ${activeIdx >= 0 ? `
          <div style="
            background:rgba(0,0,0,0.5);border:1px solid ${parts[activeIdx].color}44;
            border-radius:12px;padding:14px 20px;text-align:center;max-width:380px;
            animation:fadeIn 0.3s ease;
          ">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">الجزء الحالي:</div>
            <div style="font-family:'Fira Code',monospace;font-size:16px;color:${parts[activeIdx].color};font-weight:700;margin-bottom:8px">${parts[activeIdx].label}</div>
            <div style="font-size:13px;color:var(--text-secondary)">${parts[activeIdx].desc}</div>
          </div>
        ` : ''}
        ${activeIdx === parts.length - 1 ? `
          <div style="
            background:rgba(57,255,20,0.08);border:1px solid rgba(57,255,20,0.3);
            border-radius:10px;padding:12px 24px;font-family:'Fira Code',monospace;
            color:var(--neon-green);font-size:14px;
          ">▶ Hello, World!</div>
        ` : ''}
      </div>
    `;
  }

  buildPlayer('anim03', '🎬 تصور متحرك — تشريح دالة print()', [
    { html: anatomyHtml(-1), explain: 'سنشرّح دالة <code>print("Hello, World!")</code> جزءاً جزءاً.' },
    ...parts.map((p, i) => ({ html: anatomyHtml(i), explain: `<strong style="color:${p.color}">${p.label}</strong> — ${p.desc}` })),
    { html: anatomyHtml(parts.length), explain: 'المعادلة كاملة → تنفيذ <code>print()</code> يطبع النص على الشاشة 🖥️' },
  ]);
}

/* ───────── MODULE 04 — Variables & Memory (RAM)
─────────────────────────────────────────────────── */
function initAnim04() {
  const vars = [
    { name:'name',  val:'"أحمد"',  type:'str',  addr:'0x1A4', color:'var(--neon-blue)' },
    { name:'age',   val:'20',      type:'int',  addr:'0x1A8', color:'var(--python-yellow)' },
    { name:'score', val:'98.5',    type:'float',addr:'0x1AC', color:'var(--neon-green)' },
    { name:'active',val:'True',    type:'bool', addr:'0x1B0', color:'#8B5CF6' },
  ];

  function ramHtml(activeIdx) {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px;width:100%;box-sizing:border-box">
        <div style="font-size:11px;color:var(--text-muted);font-weight:700;letter-spacing:1px">🗄️ RAM — الذاكرة العشوائية</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
          ${vars.map((v, i) => `
            <div style="
              background:${i === activeIdx ? `${v.color}11` : '#0a0c14'};
              border:${i === activeIdx ? `2px solid ${v.color}` : i < activeIdx ? `2px solid ${v.color}55` : '1px solid #1e2a3a'};
              border-radius:10px;padding:12px 14px;min-width:90px;text-align:center;
              transition:all 0.4s;
              box-shadow:${i === activeIdx ? `0 0 18px ${v.color}44` : 'none'};
              transform:${i === activeIdx ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)'};
              opacity:${i <= activeIdx ? '1' : '0.2'};
            ">
              <div style="font-size:9px;color:#3a4a5a;font-family:'Fira Code',monospace;margin-bottom:4px">${v.addr}</div>
              <div style="font-size:11px;color:${v.color};font-family:'Fira Code',monospace;font-weight:700">${v.name}</div>
              <div style="font-size:15px;color:var(--python-yellow);font-family:'Fira Code',monospace;font-weight:700;margin:4px 0;
                opacity:${i <= activeIdx ? '1':'0'};transition:opacity 0.4s">${i <= activeIdx ? v.val : '...'}</div>
              <div style="font-size:9px;color:#3a4a5a;font-style:italic">${v.type}</div>
            </div>
          `).join('')}
        </div>
        ${activeIdx >= 0 && activeIdx < vars.length ? `
          <div style="font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);background:#060a0f;padding:8px 16px;border-radius:8px;border:1px solid #1e2a3a">
            <span style="color:var(--neon-blue)">${vars[activeIdx].name}</span>
            <span style="color:var(--text-muted)"> = </span>
            <span style="color:var(--python-yellow)">${vars[activeIdx].val}</span>
            <span style="color:#3a4a5a">  # type: ${vars[activeIdx].type}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  const explains = [
    'المتغير <strong style="color:var(--neon-blue)">name</strong> يحفظ نصاً (str) في الذاكرة. Python تخصص له مكاناً وتضع فيه القيمة.',
    'المتغير <strong style="color:var(--python-yellow)">age</strong> يحفظ عدداً صحيحاً (int). الذاكرة الآن تحتوي متغيرين.',
    'المتغير <strong style="color:var(--neon-green)">score</strong> يحفظ عدداً عشرياً (float). Python تعرف نوع كل متغير تلقائياً.',
    'المتغير <strong style="color:#8B5CF6">active</strong> يحفظ قيمة منطقية (bool) — إما True أو False فقط.',
  ];

  buildPlayer('anim04', '🎬 تصور متحرك — المتغيرات في الذاكرة (RAM)', [
    { html: ramHtml(-1), explain: 'الذاكرة فارغة — كل متغير يحجز مكاناً محدداً في الـ RAM عند تعريفه.' },
    ...explains.map((e, i) => ({ html: ramHtml(i), explain: e })),
    { html: ramHtml(vars.length), explain: 'الذاكرة الآن تحتوي 4 متغيرات بأنواع مختلفة — يمكنك الوصول إليها في أي وقت باسمها! ✅' },
  ]);
}

/* ───────── MODULE 05 — Input / Output Flow
─────────────────────────────────────────────────── */
function initAnim05() {
  const steps5 = [
    {
      active: 'none', kbVal: '', progVal: '', screenVal: '',
      explain: 'برنامج Input/Output — المستخدم يُدخل بيانات، البرنامج يعالجها، الشاشة تعرض النتيجة.'
    },
    {
      active: 'kb', kbVal: 'أحمد', progVal: '', screenVal: '',
      explain: '<strong style="color:var(--python-blue)">input("اكتب اسمك: ")</strong> — Python تتوقف وتنتظر المستخدم أن يكتب.'
    },
    {
      active: 'prog', kbVal: 'أحمد', progVal: 'name = "أحمد"', screenVal: '',
      explain: 'البيانات المُدخلة تُحفظ في متغير <code>name</code> داخل البرنامج لمعالجتها.'
    },
    {
      active: 'screen', kbVal: 'أحمد', progVal: 'print(f"مرحباً {name}")', screenVal: 'مرحباً أحمد 👋',
      explain: '<strong style="color:var(--neon-green)">print()</strong> تأخذ النتيجة وتعرضها على الشاشة للمستخدم.'
    },
  ];

  function ioHtml(s) {
    const isActive = (node) => s.active === node;
    const nodeStyle = (node, bg, border) => `
      display:flex;flex-direction:column;align-items:center;gap:8px;
      padding:16px 20px;border-radius:14px;min-width:110px;text-align:center;
      background:${isActive(node) ? bg : '#060a0f'};
      border:2px solid ${isActive(node) ? border : '#1e2a3a'};
      box-shadow:${isActive(node) ? `0 0 20px ${border}55` : 'none'};
      transition:all 0.4s;
      transform:${isActive(node) ? 'scale(1.05)' : 'scale(1)'};
    `;
    const arStyle = (from, to) => {
      const lit = s.active === to || (from === 'kb' && s.active === 'prog') || (from === 'prog' && s.active === 'screen');
      return `font-size:28px;color:${lit ? 'var(--neon-blue)' : '#1e2a3a'};transition:color 0.4s;`;
    };
    return `
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:20px;flex-wrap:wrap;width:100%;box-sizing:border-box">
        <div style="${nodeStyle('kb','rgba(55,118,171,0.15)','var(--python-blue)')}">
          <span style="font-size:32px">⌨️</span>
          <span style="font-size:11px;font-weight:700;color:${isActive('kb')?'var(--python-blue)':'#3a4a5a'}">لوحة المفاتيح</span>
          <span style="font-family:'Fira Code',monospace;font-size:12px;color:var(--python-yellow);min-height:18px">${s.kbVal}</span>
        </div>
        <div style="${arStyle('kb','prog')}">→</div>
        <div style="${nodeStyle('prog','rgba(255,212,59,0.08)','var(--python-yellow)')}">
          <span style="font-size:32px">🐍</span>
          <span style="font-size:11px;font-weight:700;color:${isActive('prog')?'var(--python-yellow)':'#3a4a5a'}">البرنامج</span>
          <span style="font-family:'Fira Code',monospace;font-size:10px;color:var(--text-muted);min-height:18px;max-width:100px;word-break:break-all">${s.progVal}</span>
        </div>
        <div style="${arStyle('prog','screen')}">→</div>
        <div style="${nodeStyle('screen','rgba(57,255,20,0.08)','var(--neon-green)')}">
          <span style="font-size:32px">🖥️</span>
          <span style="font-size:11px;font-weight:700;color:${isActive('screen')?'var(--neon-green)':'#3a4a5a'}">الشاشة</span>
          <span style="font-family:'Fira Code',monospace;font-size:12px;color:var(--neon-green);min-height:18px">${s.screenVal}</span>
        </div>
      </div>
    `;
  }

  buildPlayer('anim05', '🎬 تصور متحرك — Input & Output (المدخلات والمخرجات)', steps5.map(s => ({ html: ioHtml(s), explain: s.explain })));
}

/* ───────── MODULE 06 — Operators (العمليات الحسابية)
─────────────────────────────────────────────────── */
function initAnim06() {
  const ops = [
    { a:15, op:'+',  b:7,  res:22,  name:'الجمع (Addition)',       color:'var(--neon-green)' },
    { a:15, op:'-',  b:7,  res:8,   name:'الطرح (Subtraction)',    color:'var(--python-yellow)' },
    { a:15, op:'*',  b:7,  res:105, name:'الضرب (Multiplication)', color:'var(--neon-blue)' },
    { a:15, op:'/',  b:4,  res:3.75,name:'القسمة (Division)',      color:'#8B5CF6' },
    { a:15, op:'%',  b:4,  res:3,   name:'الباقي (Modulo)',        color:'#F97316' },
    { a:15, op:'**', b:2,  res:225, name:'القوة (Power)',           color:'var(--python-blue)' },
    { a:15, op:'//', b:4,  res:3,   name:'القسمة الصحيحة (Floor Division)', color:'#EC4899' },
  ];

  let opIdx = 0;

  function opHtml(show, idx) {
    const op = ops[idx];
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px;width:100%;box-sizing:border-box">
        <div style="font-size:11px;color:var(--text-muted);font-weight:700">${op.name}</div>
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:center">
          <div class="op-num ${show ? 'highlight' : ''}" style="color:var(--python-yellow)">${op.a}</div>
          <div class="op-sign">${op.op}</div>
          <div class="op-num ${show ? 'highlight' : ''}" style="color:var(--python-yellow)">${op.b}</div>
          <div class="op-equals">=</div>
          <div class="op-result ${show ? 'show' : ''}" style="color:${op.color}">${op.res}</div>
        </div>
        <div style="font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);background:#060a0f;padding:8px 16px;border-radius:8px;border:1px solid #1e2a3a">
          result = ${op.a} ${op.op} ${op.b}  <span style="color:#3a4a5a"># → ${op.res}</span>
        </div>
        <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;justify-content:center">
          ${ops.map((o, i) => `
            <span onclick="animGotoOp(${i})" style="
              cursor:pointer;padding:4px 10px;border-radius:6px;font-size:11px;
              font-family:'Fira Code',monospace;font-weight:700;
              background:${i === idx ? `${o.color}22` : '#0a0c14'};
              border:1px solid ${i === idx ? o.color : '#1e2a3a'};
              color:${i === idx ? o.color : '#3a4a5a'};
              transition:all 0.3s;
            ">${o.op}</span>
          `).join('')}
        </div>
      </div>
    `;
  }

  window.animGotoOp = function(i) {
    opIdx = i;
    const player = AnimRegistry['anim06'];
    if (player) {
      player.steps = [
        { html: opHtml(false, i), explain: `العملية: <strong>${ops[i].name}</strong> — ${ops[i].a} ${ops[i].op} ${ops[i].b}` },
        { html: opHtml(true,  i), explain: `النتيجة: <strong style="color:${ops[i].color}">${ops[i].res}</strong> — جرّب بقية العمليات بالضغط على الرموز!` },
      ];
      player.cur = 0;
      player._render();
    }
  };

  const allSteps = [];
  ops.forEach((op, i) => {
    allSteps.push({ html: opHtml(false, i), explain: `العملية: <strong>${op.name}</strong> — ${op.a} ${op.op} ${op.b}` });
    allSteps.push({ html: opHtml(true,  i), explain: `النتيجة: <strong style="color:${op.color}">${op.res}</strong>` });
  });

  buildPlayer('anim06', '🎬 تصور متحرك — العمليات الحسابية', allSteps);
}

/* ───────── MODULE 07 — Decisions (if/elif/else) Flowchart
─────────────────────────────────────────────────── */
function initAnim07() {
  function decisionHtml(step) {
    // step: 0=start 1=check 2=yes-path 3=no-path 4=end
    const isActive = (node) => step === node;
    const taken    = (cond)  => step >= cond;

    const nodeBase = (s, extra='') => `
      padding:10px 20px;border-radius:8px;font-size:12px;font-weight:600;
      text-align:center;min-width:140px;transition:all 0.4s;font-family:'Fira Code',monospace;
      ${extra}
    `;

    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;padding:16px;width:100%;box-sizing:border-box;overflow-x:auto">

        <!-- START -->
        <div style="${nodeBase(0,'background:var(--python-blue);color:#fff;border-radius:20px;')}
          box-shadow:${isActive(0) ? '0 0 20px var(--python-blue)88' : 'none'};
          transform:${isActive(0) ? 'scale(1.08)' : 'scale(1)'}">
          🚀 بداية البرنامج
        </div>

        <div style="font-size:18px;color:${taken(1) ? '#58a6ff' : '#1e2a3a'};margin:4px 0;transition:color 0.4s">↓</div>

        <!-- DECISION -->
        <div style="${nodeBase(1,'background:rgba(255,212,59,0.1);color:var(--python-yellow);')}
          border:2px solid ${isActive(1) ? 'var(--python-yellow)' : taken(1) ? 'rgba(255,212,59,0.4)' : '#1e2a3a'};
          border-radius:8px;
          box-shadow:${isActive(1) ? '0 0 20px rgba(255,212,59,0.5)' : 'none'};
          transform:${isActive(1) ? 'scale(1.08)' : 'scale(1)'}">
          🤔 score >= 90?
        </div>

        <!-- BRANCHES -->
        <div style="display:flex;gap:40px;margin-top:4px;align-items:flex-start">

          <!-- YES branch -->
          <div style="display:flex;flex-direction:column;align-items:center">
            <div style="font-size:10px;color:${step===2?'var(--success)':'#3a4a5a'};margin:2px 0">نعم ✓</div>
            <div style="font-size:14px;color:${step===2?'var(--success)':'#1e2a3a'};transition:color 0.4s">↓</div>
            <div style="${nodeBase(2,'background:rgba(63,185,80,0.1);color:var(--success);')}
              border:1px solid ${step===2?'var(--success)':'#1e2a3a'};
              border-radius:8px;
              box-shadow:${step===2?'0 0 16px rgba(63,185,80,0.5)':'none'};
              transform:${step===2?'scale(1.08)':'scale(1)'}">
              print("ممتاز! 🏆")
            </div>
          </div>

          <!-- NO branch -->
          <div style="display:flex;flex-direction:column;align-items:center">
            <div style="font-size:10px;color:${step===3?'var(--error)':'#3a4a5a'};margin:2px 0">لا ✗</div>
            <div style="font-size:14px;color:${step===3?'var(--error)':'#1e2a3a'};transition:color 0.4s">↓</div>
            <div style="${nodeBase(3,'background:rgba(248,81,73,0.1);color:var(--error);')}
              border:1px solid ${step===3?'var(--error)':'#1e2a3a'};
              border-radius:8px;
              box-shadow:${step===3?'0 0 16px rgba(248,81,73,0.4)':'none'};
              transform:${step===3?'scale(1.08)':'scale(1)'}">
              print("جيد! 👍")
            </div>
          </div>
        </div>

        <div style="font-size:14px;color:${step===4?'var(--success)':'#1e2a3a'};margin:4px 0;transition:color 0.4s">↓</div>

        <!-- END -->
        <div style="${nodeBase(4,'background:var(--success);color:#fff;border-radius:20px;')}
          box-shadow:${step===4?'0 0 20px rgba(63,185,80,0.5)':'none'};
          transform:${step===4?'scale(1.08)':'scale(1)'}">
          ✅ نهاية البرنامج
        </div>
      </div>
    `;
  }

  buildPlayer('anim07', '🎬 تصور متحرك — مخطط القرار (if/elif/else)', [
    { html: decisionHtml(0), explain: 'البرنامج يبدأ — سيتخذ قراراً بناءً على شرط.' },
    { html: decisionHtml(1), explain: '<code style="color:var(--python-yellow)">if score >= 90</code> — Python تتحقق من الشرط: هل الدرجة ≥ 90؟' },
    { html: decisionHtml(2), explain: 'الشرط <strong style="color:var(--success)">صحيح ✓</strong> — نسلك مسار "نعم" ونطبع "ممتاز! 🏆"' },
    { html: decisionHtml(3), explain: 'الشرط <strong style="color:var(--error)">خاطئ ✗</strong> — نسلك مسار "لا" ونطبع "جيد! 👍"' },
    { html: decisionHtml(4), explain: 'البرنامج ينتهي بعد تنفيذ المسار المناسب — if/else تضمن أن مساراً واحداً فقط يُنفَّذ.' },
  ]);
}

/* ───────── MODULE 08 — Loops (حلقات التكرار)
─────────────────────────────────────────────────── */
function initAnim08() {
  const items = [0, 1, 2, 3, 4];

  function loopHtml(curIdx, outputs) {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px;width:100%;box-sizing:border-box">
        <div style="font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);background:#060a0f;padding:8px 16px;border-radius:8px;border:1px solid #1e2a3a;text-align:right">
          <span style="color:var(--python-blue)">for</span>
          <span style="color:var(--neon-green)"> i </span>
          <span style="color:var(--python-blue)">in</span>
          <span style="color:var(--python-yellow)"> range(5)</span>
          <span style="color:#8B5CF6">:</span>
          <br>
          &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:var(--neon-blue)">print</span>(<span style="color:var(--neon-green)">i</span>)
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
          ${items.map(i => `
            <div style="
              width:52px;height:52px;border-radius:10px;
              border:2px solid ${i === curIdx ? 'var(--neon-blue)' : i < curIdx ? 'var(--success)' : '#1e2a3a'};
              display:flex;flex-direction:column;align-items:center;justify-content:center;
              font-family:'Fira Code',monospace;font-weight:700;
              background:${i === curIdx ? 'rgba(0,212,255,0.1)' : i < curIdx ? 'rgba(63,185,80,0.1)' : '#0a0c14'};
              box-shadow:${i === curIdx ? '0 0 16px rgba(0,212,255,0.3)' : 'none'};
              transform:${i === curIdx ? 'scale(1.15)' : 'scale(1)'};
              transition:all 0.35s;
            ">
              <span style="font-size:9px;color:#3a4a5a">i=</span>
              <span style="font-size:16px;color:${i === curIdx ? 'var(--neon-blue)' : i < curIdx ? 'var(--success)' : '#3a4a5a'}">${i}</span>
              ${i < curIdx ? '<span style="font-size:10px">✓</span>' : ''}
            </div>
          `).join('')}
        </div>

        <div style="
          background:#060a0f;border:1px solid #1e2a3a;border-radius:8px;
          padding:10px 16px;font-family:'Fira Code',monospace;font-size:12px;
          color:var(--neon-green);min-width:200px;min-height:36px;
        ">
          <span style="color:#3a4a5a"># output: </span>${outputs.join('  ')}
        </div>

        ${curIdx >= 0 && curIdx < items.length ? `
          <div style="font-size:12px;color:var(--text-muted)">
            التكرار رقم <strong style="color:var(--neon-blue)">${curIdx + 1}</strong> من
            <strong style="color:var(--python-yellow)">${items.length}</strong>
          </div>
        ` : ''}
      </div>
    `;
  }

  const steps = [{ html: loopHtml(-1, []), explain: 'حلقة <code>for</code> ستكرر الكود 5 مرات — مرة لكل رقم من 0 إلى 4.' }];
  const outs = [];
  items.forEach(i => {
    outs.push(String(i));
    steps.push({ html: loopHtml(i, [...outs]), explain: `التكرار #${i+1}: <code style="color:var(--neon-blue)">i = ${i}</code> → تنفيذ <code>print(${i})</code> → طباعة <strong style="color:var(--neon-green)">${i}</strong>` });
  });
  steps.push({ html: loopHtml(items.length, outs), explain: 'انتهت الحلقة! تم تنفيذ الكود 5 مرات بشكل تلقائي — قوة الحلقات! ✅' });

  buildPlayer('anim08', '🎬 تصور متحرك — حلقة for والتكرار', steps);
}

/* ───────── MODULE 09 — Lists (القوائم)
─────────────────────────────────────────────────── */
function initAnim09() {
  const listData = ['Nmap', 'Wireshark', 'Metasploit', 'Burp Suite', 'Nessus'];

  function listHtml(revealCount, activeIdx, operation) {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px;width:100%;box-sizing:border-box">
        <div style="font-size:11px;color:var(--text-muted);font-weight:700">📋 tools = [...]</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;position:relative">
          ${listData.map((item, i) => `
            <div style="
              display:flex;flex-direction:column;align-items:center;
              opacity:${i < revealCount ? '1' : '0.1'};
              transition:all 0.4s;
            ">
              <div style="font-size:9px;color:${i === activeIdx ? 'var(--neon-blue)' : '#3a4a5a'};font-family:'Fira Code',monospace;margin-bottom:3px">
                [${i}]
                ${i === activeIdx ? '▼' : ''}
              </div>
              <div style="
                background:${i === activeIdx ? 'rgba(0,212,255,0.1)' : '#0a0c14'};
                border:${i === activeIdx ? '2px solid var(--neon-blue)' : '1px solid #1e2a3a'};
                border-radius:8px;padding:8px 10px;
                font-family:'Fira Code',monospace;font-size:11px;
                color:${i === activeIdx ? 'var(--neon-blue)' : i < revealCount ? 'var(--python-yellow)' : '#3a4a5a'};
                font-weight:700;text-align:center;
                box-shadow:${i === activeIdx ? '0 0 14px rgba(0,212,255,0.3)' : 'none'};
                transform:${i === activeIdx ? 'translateY(-4px)' : 'translateY(0)'};
                transition:all 0.4s;
                white-space:nowrap;
              ">"${item}"</div>
            </div>
          `).join('')}
        </div>
        ${operation ? `
          <div style="font-family:'Fira Code',monospace;font-size:12px;background:#060a0f;padding:10px 16px;border-radius:8px;border:1px solid #1e2a3a;color:var(--text-muted)">
            ${operation}
          </div>
        ` : ''}
      </div>
    `;
  }

  buildPlayer('anim09', '🎬 تصور متحرك — القوائم (Lists) وعناوين الفهرس', [
    { html: listHtml(0, -1, ''), explain: 'سننشئ قائمة بأدوات الأمن السيبراني — القائمة مجموعة عناصر مرتبة.' },
    { html: listHtml(1, -1, 'tools = ["Nmap"]'), explain: 'إضافة العنصر الأول — الفهرس (index) يبدأ دائماً من 0.' },
    { html: listHtml(2, -1, 'tools = ["Nmap", "Wireshark"]'), explain: 'القائمة تنمو — كل عنصر له فهرس فريد.' },
    { html: listHtml(5, -1, 'tools = ["Nmap", "Wireshark", "Metasploit", "Burp Suite", "Nessus"]'), explain: 'القائمة مكتملة — 5 عناصر بفهارس 0 إلى 4.' },
    { html: listHtml(5, 0, '<span style="color:var(--neon-blue)">tools[0]</span> → <span style="color:var(--neon-green)">"Nmap"</span>'), explain: '<code>tools[0]</code> — الوصول للعنصر الأول بالفهرس 0.' },
    { html: listHtml(5, 2, '<span style="color:var(--neon-blue)">tools[2]</span> → <span style="color:var(--neon-green)">"Metasploit"</span>'), explain: '<code>tools[2]</code> — الوصول للعنصر الثالث بالفهرس 2.' },
    { html: listHtml(5, 4, '<span style="color:var(--neon-blue)">tools[-1]</span> → <span style="color:var(--neon-green)">"Nessus"</span>'), explain: '<code>tools[-1]</code> — الفهرس السالب يبدأ من النهاية! مفيد جداً! ✅' },
  ]);
}

/* ───────── MODULE 10 — Functions (الدوال)
─────────────────────────────────────────────────── */
function initAnim10() {
  function fnHtml(step) {
    // step: 0=show def, 1=call, 2=enter fn, 3=execute, 4=return
    const defHighlight = step >= 1 ? 'rgba(55,118,171,0.15)' : 'transparent';
    const callHighlight = step === 1 ? 'rgba(0,212,255,0.15)' : 'transparent';
    const bodyHighlight = step >= 2 ? 'rgba(255,212,59,0.08)' : 'transparent';
    const returnHighlight = step >= 4 ? 'rgba(63,185,80,0.15)' : 'transparent';

    const arrow = (show, dir='down') => `
      <div style="text-align:center;font-size:20px;color:${show ? 'var(--neon-blue)' : '#1e2a3a'};
        margin:4px 0;transition:all 0.4s;animation:${show?'ioArrow 1s infinite':'none'}">
        ${dir === 'down' ? '↓' : '↑'}
      </div>
    `;

    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;padding:16px;width:100%;box-sizing:border-box;max-width:500px;margin:0 auto">

        <!-- def block -->
        <div style="
          background:${defHighlight};border:1px solid ${step >= 0 ? 'rgba(55,118,171,0.4)' : '#1e2a3a'};
          border-radius:10px;padding:12px 16px;font-family:'Fira Code',monospace;font-size:12px;
          line-height:1.8;width:100%;box-sizing:border-box;transition:all 0.4s;
          box-shadow:${step === 0 ? '0 0 16px rgba(55,118,171,0.2)' : 'none'};
        ">
          <span style="color:#3a4a5a">① تعريف الدالة:</span><br>
          <span style="color:var(--python-blue)">def </span>
          <span style="color:var(--neon-blue)">greet</span>
          <span style="color:#8B5CF6">(</span>
          <span style="color:var(--python-yellow)">name</span>
          <span style="color:#8B5CF6">)</span>
          <span style="color:#8B5CF6">:</span>
          <div style="margin-right:20px;background:${bodyHighlight};border-radius:6px;padding:4px 8px;transition:all 0.4s;
            border-right:3px solid ${step >= 2 ? 'var(--python-yellow)' : 'transparent'}">
            <span style="color:var(--python-blue)">  print</span>
            <span style="color:#8B5CF6">(</span>
            <span style="color:var(--neon-green)">f"مرحباً {name}!"</span>
            <span style="color:#8B5CF6">)</span><br>
            <span style="color:var(--python-blue)">  return </span>
            <span style="color:var(--neon-green)">"done"</span>
          </div>
        </div>

        ${arrow(step >= 1)}

        <!-- call block -->
        <div style="
          background:${callHighlight};
          border:1px solid ${step === 1 ? 'var(--neon-blue)' : '#1e2a3a'};
          border-radius:10px;padding:12px 16px;font-family:'Fira Code',monospace;font-size:12px;
          line-height:1.8;width:100%;box-sizing:border-box;transition:all 0.4s;
          box-shadow:${step === 1 ? '0 0 16px rgba(0,212,255,0.2)' : 'none'};
        ">
          <span style="color:#3a4a5a">② استدعاء الدالة:</span><br>
          <span style="color:var(--neon-green)">result</span>
          <span style="color:var(--text-muted)"> = </span>
          <span style="color:var(--neon-blue)">greet</span>
          <span style="color:#8B5CF6">(</span>
          <span style="color:var(--python-yellow)">"أحمد"</span>
          <span style="color:#8B5CF6">)</span>
        </div>

        ${step >= 3 ? `
          <div style="text-align:center;margin:8px 0;color:var(--neon-green);font-family:'Fira Code',monospace;font-size:12px;
            animation:slideIn 0.4s ease">
            ▶ Output: <strong>"مرحباً أحمد!"</strong>
          </div>
        ` : ''}

        ${step >= 4 ? `
          ${arrow(true, 'up')}
          <div style="
            background:${returnHighlight};border:1px solid var(--success);
            border-radius:10px;padding:10px 16px;font-family:'Fira Code',monospace;font-size:12px;
            width:100%;box-sizing:border-box;animation:slideIn 0.4s ease;
          ">
            <span style="color:#3a4a5a">③ القيمة المُعادة:</span><br>
            <span style="color:var(--neon-green)">result</span>
            <span style="color:var(--text-muted)"> = </span>
            <span style="color:var(--success)">"done"</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  buildPlayer('anim10', '🎬 تصور متحرك — الدوال (Functions) والـ Call Stack', [
    { html: fnHtml(0), explain: 'تعريف الدالة <code>greet(name)</code> — نكتبها مرة واحدة، نستخدمها كم مرة شئنا.' },
    { html: fnHtml(1), explain: 'استدعاء الدالة <code>greet("أحمد")</code> — Python تقفز لداخل الدالة.' },
    { html: fnHtml(2), explain: 'داخل الدالة — المعامل <code>name</code> أصبح قيمته "أحمد".' },
    { html: fnHtml(3), explain: 'تنفيذ <code>print()</code> داخل الدالة — يظهر النص على الشاشة.' },
    { html: fnHtml(4), explain: '<code>return "done"</code> — الدالة تعيد قيمة، Python تعود لمكان الاستدعاء وتضعها في <code>result</code> ✅' },
  ]);
}

/* ═══════════════════════════════════════════════════
   INIT ALL — called from startCourse()
══════════════════════════════════════════════════════ */
function initAllAnimations() {
  try { initAnim01(); } catch(e) { console.warn('anim01 skip', e); }
  try { initAnim02(); } catch(e) { console.warn('anim02 skip', e); }
  try { initAnim03(); } catch(e) { console.warn('anim03 skip', e); }
  try { initAnim04(); } catch(e) { console.warn('anim04 skip', e); }
  try { initAnim05(); } catch(e) { console.warn('anim05 skip', e); }
  try { initAnim06(); } catch(e) { console.warn('anim06 skip', e); }
  try { initAnim07(); } catch(e) { console.warn('anim07 skip', e); }
  try { initAnim08(); } catch(e) { console.warn('anim08 skip', e); }
  try { initAnim09(); } catch(e) { console.warn('anim09 skip', e); }
  try { initAnim10(); } catch(e) { console.warn('anim10 skip', e); }
}

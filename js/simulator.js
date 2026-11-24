/* =====================================================
   simulator.js — Python Code Simulator (محاكاة Python)
   ===================================================== */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function formatVal(val) {
  if (val === null || val === undefined) return 'None';
  if (val === true)  return 'True';
  if (val === false) return 'False';
  if (Array.isArray(val))
    return '[' + val.map(v => typeof v === 'string' ? `'${v}'` : formatVal(v)).join(', ') + ']';
  return String(val);
}

function splitArgs(str) {
  const args = []; let depth = 0; let cur = '';
  for (const ch of str) {
    if (ch === ',' && depth === 0) { args.push(cur.trim()); cur = ''; }
    else {
      if ('([{'.includes(ch)) depth++;
      if (')]}'.includes(ch)) depth--;
      cur += ch;
    }
  }
  if (cur.trim()) args.push(cur.trim());
  return args;
}

function simulatePython(code) {
  const output  = [];
  const vars     = {};
  const functions = {};
  let   error    = null;

  /* ---- expression evaluator ---- */
  function evalExpr(expr, lv = {}) {
    const all = { ...vars, ...lv };
    expr = expr.trim();
    if (!expr) return undefined;

    // f-string
    const fMatch = expr.match(/^f("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"]*"|'[^']*')$/);
    if (fMatch) {
      let content = fMatch[1].slice(1, -1);
      if (fMatch[1].startsWith('"""') || fMatch[1].startsWith("'''"))
        content = fMatch[1].slice(3, -3);
      return content.replace(/\{([^}]+)\}/g, (_, e) => {
        try { return formatVal(evalExpr(e, lv)); } catch { return '{' + e + '}'; }
      });
    }

    // plain string
    if (/^("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"]*"|'[^']*')$/.test(expr)) {
      if (expr.startsWith('"""') || expr.startsWith("'''")) return expr.slice(3, -3);
      return expr.slice(1, -1);
    }

    if (expr === 'True')  return true;
    if (expr === 'False') return false;
    if (expr === 'None')  return null;
    if (/^-?\d+\.\d+$/.test(expr)) return parseFloat(expr);
    if (/^-?\d+$/.test(expr))      return parseInt(expr, 10);

    // list literal
    if (expr.startsWith('[') && expr.endsWith(']')) {
      const inner = expr.slice(1, -1).trim();
      return inner ? splitArgs(inner).map(e => evalExpr(e, lv)) : [];
    }

    // built-in functions
    let m;
    if ((m = expr.match(/^len\((.+)\)$/)))      { const v = evalExpr(m[1], lv); return Array.isArray(v) ? v.length : String(v).length; }
    if ((m = expr.match(/^int\((.+)\)$/)))       { return parseInt(evalExpr(m[1], lv), 10); }
    if ((m = expr.match(/^float\((.+)\)$/)))     { return parseFloat(evalExpr(m[1], lv)); }
    if ((m = expr.match(/^str\((.+)\)$/)))       { return String(evalExpr(m[1], lv)); }
    if ((m = expr.match(/^bool\((.+)\)$/)))      { return !!evalExpr(m[1], lv); }
    if ((m = expr.match(/^abs\((.+)\)$/)))       { return Math.abs(evalExpr(m[1], lv)); }
    if ((m = expr.match(/^round\((.+)\)$/)))     { const args = splitArgs(m[1]); return Math.round(evalExpr(args[0], lv) * Math.pow(10, args[1] ? evalExpr(args[1], lv) : 0)) / Math.pow(10, args[1] ? evalExpr(args[1], lv) : 0); }
    if ((m = expr.match(/^max\((.+)\)$/)))       { return Math.max(...splitArgs(m[1]).map(a => evalExpr(a, lv))); }
    if ((m = expr.match(/^min\((.+)\)$/)))       { return Math.min(...splitArgs(m[1]).map(a => evalExpr(a, lv))); }
    if ((m = expr.match(/^sum\((.+)\)$/)))       { const v = evalExpr(m[1], lv); return Array.isArray(v) ? v.reduce((a,b)=>a+b, 0) : 0; }
    if ((m = expr.match(/^sorted\((.+)\)$/)))    { const v = evalExpr(m[1], lv); return Array.isArray(v) ? [...v].sort((a,b)=>a-b) : []; }
    if ((m = expr.match(/^list\((.+)\)$/)))      { const v = evalExpr(m[1], lv); return Array.isArray(v) ? v : [...String(v)]; }
    if ((m = expr.match(/^type\((.+)\)$/)))      { const v = evalExpr(m[1], lv); return Array.isArray(v)?'<class \'list\'>':typeof v==='boolean'?'<class \'bool\'>':typeof v==='number'?(Number.isInteger(v)?'<class \'int\'>':'<class \'float\'>'):typeof v==='string'?'<class \'str\'>':'<class \'NoneType\'>'; }

    // range / enumerate
    if ((m = expr.match(/^range\((.+)\)$/))) {
      const a = splitArgs(m[1]).map(x => parseInt(evalExpr(x, lv), 10));
      const res = [];
      if (a.length === 1)      { for (let i=0;i<a[0];i++) res.push(i); }
      else if (a.length === 2) { for (let i=a[0];i<a[1];i++) res.push(i); }
      else                     { for (let i=a[0];i<a[1];i+=a[2]) res.push(i); }
      return res;
    }
    if ((m = expr.match(/^enumerate\((.+)\)$/))) {
      const v = evalExpr(m[1], lv);
      return Array.isArray(v) ? v.map((x,i)=>[i,x]) : [];
    }

    // string methods
    if ((m = expr.match(/^(.+)\.upper\(\)$/)))   { return String(evalExpr(m[1], lv)).toUpperCase(); }
    if ((m = expr.match(/^(.+)\.lower\(\)$/)))   { return String(evalExpr(m[1], lv)).toLowerCase(); }
    if ((m = expr.match(/^(.+)\.strip\(\)$/)))   { return String(evalExpr(m[1], lv)).trim(); }
    if ((m = expr.match(/^(.+)\.replace\((.+),(.+)\)$/))) { return String(evalExpr(m[1],lv)).split(evalExpr(m[2],lv)).join(evalExpr(m[3],lv)); }
    if ((m = expr.match(/^(.+)\.split\((.+)\)$/))) { return String(evalExpr(m[1],lv)).split(evalExpr(m[2],lv)); }
    if ((m = expr.match(/^(.+)\.join\((.+)\)$/))) { const sep=evalExpr(m[1],lv); const lst=evalExpr(m[2],lv); return Array.isArray(lst)?lst.join(String(sep)):String(sep); }
    if ((m = expr.match(/^(.+)\.isupper\(\)$/))) { const s=String(evalExpr(m[1],lv)); return /[A-Z]/.test(s); }
    if ((m = expr.match(/^(.+)\.islower\(\)$/))) { const s=String(evalExpr(m[1],lv)); return /[a-z]/.test(s); }
    if ((m = expr.match(/^(.+)\.isdigit\(\)$/))) { return /^\d+$/.test(String(evalExpr(m[1],lv))); }
    if ((m = expr.match(/^(.+)\.isalpha\(\)$/))) { return /^[a-zA-Z]+$/.test(String(evalExpr(m[1],lv))); }
    if ((m = expr.match(/^(.+)\.isalnum\(\)$/))) { return /^[a-zA-Z0-9]+$/.test(String(evalExpr(m[1],lv))); }
    if ((m = expr.match(/^(.+)\.startswith\((.+)\)$/))) { return String(evalExpr(m[1],lv)).startsWith(String(evalExpr(m[2],lv))); }
    if ((m = expr.match(/^(.+)\.endswith\((.+)\)$/)))   { return String(evalExpr(m[1],lv)).endsWith(String(evalExpr(m[2],lv))); }
    if ((m = expr.match(/^(.+)\.count\((.+)\)$/)))      { const s=String(evalExpr(m[1],lv)); const sub=String(evalExpr(m[2],lv)); return (s.match(new RegExp(sub.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length; }
    if ((m = expr.match(/^(.+)\.find\((.+)\)$/)))       { return String(evalExpr(m[1],lv)).indexOf(String(evalExpr(m[2],lv))); }
    if ((m = expr.match(/^(.+)\.index\((.+)\)$/)))      { return String(evalExpr(m[1],lv)).indexOf(String(evalExpr(m[2],lv))); }

    // chr / ord
    if ((m = expr.match(/^chr\((.+)\)$/)))  { return String.fromCharCode(parseInt(evalExpr(m[1],lv))); }
    if ((m = expr.match(/^ord\((.+)\)$/)))  { return String(evalExpr(m[1],lv)).charCodeAt(0); }

    // any / all
    if ((m = expr.match(/^any\((.+)\)$/)))  { const v=evalExpr(m[1],lv); return Array.isArray(v)?v.some(Boolean):false; }
    if ((m = expr.match(/^all\((.+)\)$/)))  { const v=evalExpr(m[1],lv); return Array.isArray(v)?v.every(Boolean):false; }

    // list index  e.g. lst[0], lst[-1]
    if ((m = expr.match(/^(.+)\[(-?\d+)\]$/))) {
      const arr = evalExpr(m[1], lv);
      if (Array.isArray(arr) || typeof arr === 'string') {
        let idx = parseInt(m[2], 10);
        const len = Array.isArray(arr) ? arr.length : arr.length;
        if (idx < 0) idx = len + idx;
        if (idx < 0 || idx >= len) throw new Error(`IndexError: index ${m[2]} is out of range`);
        return arr[idx];
      }
    }

    // variable lookup
    if (/^\w+$/.test(expr) && expr in all) return all[expr];

    // user-defined function call  fname(args)
    if ((m = expr.match(/^(\w+)\((.*)?\)$/))) {
      const fname = m[1];
      if (functions[fname]) {
        const callArgs = (m[2]||'').trim() ? splitArgs(m[2]).map(a => evalExpr(a.trim(), lv)) : [];
        return callFunction(fname, callArgs, lv);
      }
    }

    // arithmetic (safe — only after var substitution)
    try {
      let s = expr;
      // longest-first substitution
      Object.keys(all).sort((a,b)=>b.length-a.length).forEach(k => {
        const v = all[k];
        const rep = typeof v==='string' ? JSON.stringify(v)
                  : Array.isArray(v)   ? JSON.stringify(v)
                  : v===null           ? 'null'
                  : String(v);
        s = s.replace(new RegExp(`\\b${k}\\b`,'g'), rep);
      });
      s = s.replace(/\*\*/g, '^^^')
           .replace(/\/\//g, '___FLOORDIV___')
           .replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\s+/g,'!')
           .replace(/\^{3}/g, '**')
           .replace(/___FLOORDIV___/g, '/');  // handled below

      // floor division post-processing: replace x/y computed result with Math.floor
      // simpler: just eval with ** as Math.pow and // handled
      s = s.replace(/(\d+(?:\.\d+)?)\s*\*\*\s*(\d+(?:\.\d+)?)/g, (_, a, b) => Math.pow(parseFloat(a), parseFloat(b)));

      // floor div: a // b
      const floorDiv = /(-?\d+(?:\.\d+)?)\s*\/\/\s*(-?\d+(?:\.\d+)?)/g;
      s = s.replace(floorDiv, (_, a, b) => Math.floor(parseFloat(a)/parseFloat(b)));

      if (/[a-zA-Z_]/.test(s.replace(/null|true|false|Math\b/g,''))) return undefined;
      // eslint-disable-next-line no-new-func
      return Function('"use strict"; return (' + s + ')')();
    } catch { return undefined; }
  }

  /* ---- collect indented block ---- */
  function collectBlock(allLines, startIdx, baseIndent) {
    const block = [];
    let j = startIdx;
    while (j < allLines.length) {
      const ln = allLines[j];
      if (ln.trim() === '' || ln.trim().startsWith('#')) { block.push(ln); j++; continue; }
      if (getIndent(ln) <= baseIndent) break;
      block.push(ln); j++;
    }
    return { lines: block, next: j };
  }

  function getIndent(line) { return line.match(/^(\s*)/)[1].length; }

  /* ---- execute a block of lines ---- */
  function execLines(codeLines, lv = {}) {
    let i = 0;
    while (i < codeLines.length) {
      const raw     = codeLines[i];
      const stripped = raw.trim();

      if (!stripped || stripped.startsWith('#')) { i++; continue; }

      let m;

      /* def */
      if ((m = stripped.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/))) {
        const fname  = m[1];
        const params = m[2].split(',').map(p => {
          const parts = p.trim().split('=');
          return { name: parts[0].trim(), dflt: parts[1] !== undefined ? evalExpr(parts[1].trim(), lv) : undefined };
        }).filter(p => p.name);
        const blk = collectBlock(codeLines, i+1, getIndent(raw));
        functions[fname] = { params, lines: blk.lines };
        // also expose as a callable in lv so nested calls work
        lv[fname] = (...a) => callFunction(fname, a, lv);
        i = blk.next; continue;
      }

      /* while */
      if ((m = stripped.match(/^while\s+(.+)\s*:/))) {
        const blk = collectBlock(codeLines, i+1, getIndent(raw));
        let iter = 0;
        while (iter++ < 500) {
          if (!evalExpr(m[1], lv)) break;
          const r = execLines(blk.lines, lv);
          if (r && r.brk)  break;
          if (r && r.cont) continue;
          if (r && r.ret !== undefined) return r;
        }
        i = blk.next; continue;
      }

      /* for */
      if ((m = stripped.match(/^for\s+(.+?)\s+in\s+(.+)\s*:/))) {
        const varPart = m[1].trim();
        const blk     = collectBlock(codeLines, i+1, getIndent(raw));
        const iterable = evalExpr(m[2].trim(), lv);
        const items    = Array.isArray(iterable) ? iterable
                       : typeof iterable === 'string' ? [...iterable]
                       : [];
        outer: for (const item of items) {
          if (varPart.includes(',')) {
            const names = varPart.split(',').map(v=>v.trim());
            if (Array.isArray(item)) names.forEach((n,ni)=>{ lv[n] = item[ni]; });
            else names.forEach((n,ni)=>{ lv[n] = ni===0?item:undefined; });
          } else { lv[varPart] = item; }
          const r = execLines(blk.lines, lv);
          if (r && r.brk)  break outer;
          if (r && r.ret !== undefined) return r;
        }
        i = blk.next; continue;
      }

      /* if / elif / else chain */
      if ((m = stripped.match(/^if\s+(.+)\s*:/))) {
        const baseInd = getIndent(raw);
        const ifBlk   = collectBlock(codeLines, i+1, baseInd);
        i = ifBlk.next;

        const chain = [{ cond: m[1], lines: ifBlk.lines }];
        while (i < codeLines.length) {
          const nx = codeLines[i].trim();
          if (nx.match(/^elif\s+(.+)\s*:/)) {
            const em = nx.match(/^elif\s+(.+)\s*:/);
            const eb = collectBlock(codeLines, i+1, getIndent(codeLines[i]));
            chain.push({ cond: em[1], lines: eb.lines });
            i = eb.next;
          } else if (nx.match(/^else\s*:/)) {
            const eb = collectBlock(codeLines, i+1, getIndent(codeLines[i]));
            chain.push({ cond: null, lines: eb.lines });
            i = eb.next; break;
          } else break;
        }

        for (const branch of chain) {
          if (branch.cond === null || evalExpr(branch.cond, lv)) {
            const r = execLines(branch.lines, lv);
            if (r && (r.brk || r.ret !== undefined)) return r;
            break;
          }
        }
        continue;
      }

      /* return */
      if ((m = stripped.match(/^return\s*(.*)/)))  return { ret: evalExpr(m[1], lv) };
      if (stripped === 'break')   return { brk: true };
      if (stripped === 'continue') return { cont: true };
      if (stripped === 'pass')     { i++; continue; }

      /* print */
      if ((m = stripped.match(/^print\(([\s\S]*)\)$/))) {
        const inner = m[1].trim();
        if (!inner) { output.push(''); i++; continue; }
        const vals = splitArgs(inner).map(a => {
          const v = evalExpr(a.trim(), lv);
          return formatVal(v);
        });
        output.push(vals.join(' '));
        i++; continue;
      }

      /* input assignment: x = input("…") | x = int(input("…")) */
      if ((m = stripped.match(/^(\w+)\s*=\s*(int|float|str)?\(?input\((.*)\)\)?$/))) {
        const [, vn, cast, promptExpr] = m;
        const promptStr = evalExpr(promptExpr || '""', lv);
        const raw2 = window.prompt(String(promptStr) || '') ?? '';
        if (cast === 'int')   lv[vn] = parseInt(raw2, 10)  || 0;
        else if (cast === 'float') lv[vn] = parseFloat(raw2) || 0;
        else                  lv[vn] = raw2;
        i++; continue;
      }

      /* list methods on existing var */
      if ((m = stripped.match(/^(\w+)\.append\((.+)\)$/))) {
        const arr = lv[m[1]] ?? vars[m[1]];
        if (Array.isArray(arr)) arr.push(evalExpr(m[2], lv));
        i++; continue;
      }
      if ((m = stripped.match(/^(\w+)\.remove\((.+)\)$/))) {
        const arr = lv[m[1]] ?? vars[m[1]];
        if (Array.isArray(arr)) { const idx = arr.indexOf(evalExpr(m[2],lv)); if(idx!==-1) arr.splice(idx,1); }
        i++; continue;
      }
      if ((m = stripped.match(/^(\w+)\.sort\(\)$/))) {
        const arr = lv[m[1]] ?? vars[m[1]];
        if (Array.isArray(arr)) arr.sort((a,b)=>a-b);
        i++; continue;
      }
      if ((m = stripped.match(/^(\w+)\.reverse\(\)$/))) {
        const arr = lv[m[1]] ?? vars[m[1]];
        if (Array.isArray(arr)) arr.reverse();
        i++; continue;
      }

      /* augmented assignment: x += … */
      if ((m = stripped.match(/^(\w+)\s*(\+|-|\*|\/|\/\/|%|\*\*)=\s*(.+)$/))) {
        const [, vn, op, ex] = m;
        const cur = lv[vn] !== undefined ? lv[vn] : (vars[vn] || 0);
        const val = evalExpr(ex, lv);
        if      (op==='+')  lv[vn] = cur + val;
        else if (op==='-')  lv[vn] = cur - val;
        else if (op==='*')  lv[vn] = cur * val;
        else if (op==='/')  lv[vn] = cur / val;
        else if (op==='//') lv[vn] = Math.floor(cur / val);
        else if (op==='%')  lv[vn] = cur % val;
        else if (op==='**') lv[vn] = Math.pow(cur, val);
        i++; continue;
      }

      /* simple assignment */
      if ((m = stripped.match(/^(\w+)\s*=\s*(.+)$/))) {
        lv[m[1]] = evalExpr(m[2], lv);
        i++; continue;
      }

      /* list-index assignment: lst[0] = val */
      if ((m = stripped.match(/^(\w+)\[(\d+)\]\s*=\s*(.+)$/))) {
        const arr = lv[m[1]] ?? vars[m[1]];
        if (Array.isArray(arr)) arr[parseInt(m[2])] = evalExpr(m[3], lv);
        i++; continue;
      }

      /* standalone function call */
      if ((m = stripped.match(/^(\w+)\((.*)\)$/))) {
        if (functions[m[1]]) {
          const a = (m[2]||'').trim() ? splitArgs(m[2]).map(x=>evalExpr(x.trim(),lv)) : [];
          callFunction(m[1], a, lv);
        }
        i++; continue;
      }

      i++;
    }

    Object.assign(vars, lv);
    return {};
  }

  /* ---- call a user-defined function ---- */
  function callFunction(fname, callArgs, callerVars) {
    if (!functions[fname]) return undefined;
    const { params, lines } = functions[fname];
    const lv = { ...vars, ...callerVars };
    params.forEach((p, pi) => {
      lv[p.name] = pi < callArgs.length ? callArgs[pi]
                 : p.dflt !== undefined  ? p.dflt
                 : undefined;
    });
    const r = execLines(lines, lv);
    return r && r.ret !== undefined ? r.ret : null;
  }

  /* ---- run ---- */
  try {
    execLines(code.split('\n'), {});
  } catch (e) {
    error = e.message;
  }

  return { output: output.join('\n'), error };
}

/* ---- public run helper ---- */
function runCode(editorId, outputId) {
  const code   = document.getElementById(editorId).value;
  const outEl  = document.getElementById(outputId);
  outEl.innerHTML = '';

  const { output, error } = simulatePython(code);

  if (output) outEl.innerHTML += `<span class="console-output">${escapeHtml(output)}</span>`;
  if (error)  outEl.innerHTML += `<span class="console-error">\n⚠️ ${escapeHtml(error)}</span>`;
  if (!output && !error) outEl.innerHTML = `<span class="console-info">تم التنفيذ — لا يوجد output</span>`;
}

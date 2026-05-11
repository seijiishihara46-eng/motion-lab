/* Inspector — right panel */
export class Inspector {
  constructor(el) {
    this._el = el;
    this.element = null;
    this.onChange = null;
  }

  show(stageEl) {
    this.element = stageEl;
    if (!stageEl) {
      this._el.innerHTML = '<p class="inspector-hint">エレメントを選択してください</p>';
      return;
    }
    this._render(stageEl);
  }

  _render(stageEl) {
    const groups = stageEl.getProperties();
    const badge = `<div style="display:inline-block;margin-bottom:8px;padding:2px 8px;
      border-radius:2px;font-size:9px;color:#000;background:${typeColor(stageEl.type)}">
      ${stageEl.type.toUpperCase()} · ${stageEl.id}</div>`;

    let html = badge;
    for (const g of groups) {
      html += `<div class="prop-group"><div class="prop-group-label">${g.group}</div>`;
      for (const p of g.props) {
        html += `<div class="prop-row">
          <label class="prop-label" title="${p.key}">${p.label}</label>
          ${renderInput(p)}
        </div>`;
      }
      html += `</div>`;
    }
    this._el.innerHTML = html;

    this._el.querySelectorAll('[data-key]').forEach(inp => {
      const key  = inp.dataset.key;
      const type = inp.dataset.type;
      const ev   = (type === 'checkbox') ? 'change' : 'input';
      inp.addEventListener(ev, () => {
        let val;
        if (type === 'checkbox') val = inp.checked;
        else if (type === 'number' || type === 'range') val = parseFloat(inp.value);
        else val = inp.value;

        if (this.element) this.element.setProperty(key, val);
        if (this.onChange) this.onChange(key, val);

        if (type === 'range') {
          const disp = this._el.querySelector(`[data-rdis="${key}"]`);
          if (disp) disp.textContent = parseFloat(inp.value).toFixed(1);
        }
      });
    });
  }

  refresh() { if (this.element) this._render(this.element); }
}

function renderInput(p) {
  switch (p.type) {
    case 'text':
      return `<input class="prop-input" type="text" data-key="${p.key}" data-type="text" value="${esc(p.value)}">`;
    case 'number':
      return `<input class="prop-input" type="number" data-key="${p.key}" data-type="number"
        value="${p.value}" step="${p.step ?? 1}" style="width:70px">`;
    case 'checkbox':
      return `<input class="prop-checkbox" type="checkbox" data-key="${p.key}" data-type="checkbox" ${p.value ? 'checked' : ''}>`;
    case 'color':
      return `<input class="prop-input" type="color" data-key="${p.key}" data-type="color" value="${p.value ?? '#ffffff'}">`;
    case 'range':
      return `<input class="prop-input" type="range" data-key="${p.key}" data-type="range"
        value="${p.value}" min="${p.min ?? 0}" max="${p.max ?? 100}" step="${p.step ?? 1}" style="flex:1">
        <span class="range-val" data-rdis="${p.key}">${parseFloat(p.value).toFixed(1)}</span>`;
    case 'select': {
      const opts = (p.options ?? []).map(o =>
        `<option value="${o}" ${o === p.value ? 'selected' : ''}>${o}</option>`).join('');
      return `<select class="action-select prop-input" data-key="${p.key}" data-type="select" style="flex:1">${opts}</select>`;
    }
    default:
      return `<span style="color:var(--text-dim)">${p.value}</span>`;
  }
}

/* Element list — left panel */
export class ElementListUI {
  constructor(el) {
    this._el = el;
    this.onSelect = null;
    this.onToggleVis = null;
  }

  refresh(elements, selected) {
    if (!elements.length) {
      this._el.innerHTML = '<p style="color:var(--text-dim);padding:8px;font-size:10px">エレメントなし</p>';
      return;
    }
    this._el.innerHTML = elements.map(e => `
      <div class="el-item ${e === selected ? 'selected' : ''}" data-id="${e.id}">
        <span class="el-dot ${e.type}"></span>
        <span class="el-name">${esc(e.name)}</span>
        <span class="el-vis-btn" data-vid="${e.id}">${e.visible ? '●' : '○'}</span>
      </div>`).join('');

    this._el.querySelectorAll('.el-item').forEach(item => {
      item.addEventListener('click', ev => {
        if (ev.target.dataset.vid) return;
        if (this.onSelect) this.onSelect(item.dataset.id);
      });
    });
    this._el.querySelectorAll('.el-vis-btn').forEach(btn => {
      btn.addEventListener('click', () => { if (this.onToggleVis) this.onToggleVis(btn.dataset.vid); });
    });
  }
}

/* Cue list + editor — bottom panel */
export class CueListUI {
  constructor(listEl, metaEl, actionListEl, engine) {
    this._list   = listEl;
    this._meta   = metaEl;
    this._acts   = actionListEl;
    this.engine  = engine;
    this.selected = null;
    this.onSelect = null;
  }

  refreshList() {
    const { cues, pointer } = this.engine;
    if (!cues.length) {
      this._list.innerHTML = '<p style="color:var(--text-dim);padding:8px;font-size:10px">キューなし</p>';
      return;
    }
    this._list.innerHTML = cues.map((c, i) => `
      <div class="cue-item ${c === this.selected ? 'selected' : ''} ${i === pointer ? 'fired' : ''}" data-id="${c.id}">
        <span class="cue-num">${c.number}</span>
        <span class="cue-name">${esc(c.name)}</span>
        <span class="cue-wait">${c.preWait > 0 ? c.preWait + 's' : ''}</span>
      </div>`).join('');

    this._list.querySelectorAll('.cue-item').forEach(item => {
      item.addEventListener('click', () => {
        const c = this.engine.cues.find(c => c.id === item.dataset.id);
        if (!c) return;
        this.selected = c;
        if (this.onSelect) this.onSelect(c);
        this.refreshList();
        this.refreshEditor();
      });
      item.addEventListener('dblclick', () => {
        const c = this.engine.cues.find(c => c.id === item.dataset.id);
        if (c) {
          const idx = this.engine.cues.indexOf(c);
          this.engine.pointer = idx - 1;
          this.engine.go();
        }
      });
    });
  }

  refreshEditor() {
    const cue = this.selected;
    const els = this.engine.stageScene.elements;

    if (!cue) {
      this._meta.innerHTML = '';
      this._acts.innerHTML = '<p style="color:var(--text-dim);font-size:10px;padding:4px">キューを選択してください</p>';
      return;
    }

    this._meta.innerHTML = `
      <div class="prop-row" style="margin-bottom:4px">
        <label class="prop-label">名前</label>
        <input class="prop-input" id="q-name" value="${esc(cue.name)}" style="flex:1">
      </div>
      <div class="prop-row" style="margin-bottom:4px">
        <label class="prop-label">前待機(s)</label>
        <input class="prop-input" id="q-wait" type="number" value="${cue.preWait}" step="0.1" style="width:60px">
        <button class="icon-btn danger" id="q-del" style="margin-left:auto;color:var(--stop-c)">🗑 CUE削除</button>
      </div>`;

    document.getElementById('q-name')?.addEventListener('input', e => {
      cue.name = e.target.value; this.refreshList();
    });
    document.getElementById('q-wait')?.addEventListener('input', e => {
      cue.preWait = parseFloat(e.target.value) || 0;
    });
    document.getElementById('q-del')?.addEventListener('click', () => {
      this.engine.removeCue(cue);
      this.selected = null;
      this.refreshList();
      this.refreshEditor();
    });

    if (!els.length) {
      this._acts.innerHTML = '<p style="color:var(--text-dim);font-size:10px;padding:4px">エレメントを追加してください</p>';
      return;
    }

    const elOpts = els.map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join('');

    this._acts.innerHTML = cue.actions.map((a, i) => {
      const el = els.find(e => e.id === a.elementId) ?? els[0];
      const props = getAllProps(el);
      const propOpts = props.map(k =>
        `<option value="${k}" ${k === a.property ? 'selected' : ''}>${k}</option>`).join('');
      const elOptsSel = els.map(e =>
        `<option value="${e.id}" ${e.id === a.elementId ? 'selected' : ''}>${esc(e.name)}</option>`).join('');

      return `<div class="action-row" data-i="${i}">
        <select class="action-select" data-ae="${i}" style="flex:1.4">${elOptsSel}</select>
        <select class="action-select" data-ap="${i}" style="flex:1.2">${propOpts}</select>
        <input  class="action-val"   data-av="${i}" value="${esc(String(a.value ?? ''))}" placeholder="値">
        <input  class="action-fade"  data-af="${i}" type="number" value="${a.fade ?? 0}" step="0.1" title="フェード秒">
        <button class="action-del"   data-ad="${i}">✕</button>
      </div>`;
    }).join('') || '<p style="color:var(--text-dim);font-size:10px;padding:4px">アクションなし</p>';

    // bind action editors
    this._acts.querySelectorAll('[data-ae]').forEach(sel => {
      const i = +sel.dataset.ae;
      sel.addEventListener('change', () => { cue.actions[i].elementId = sel.value; this.refreshEditor(); });
    });
    this._acts.querySelectorAll('[data-ap]').forEach(sel => {
      const i = +sel.dataset.ap;
      sel.addEventListener('change', () => { cue.actions[i].property = sel.value; });
    });
    this._acts.querySelectorAll('[data-av]').forEach(inp => {
      const i = +inp.dataset.av;
      inp.addEventListener('input', () => {
        const v = inp.value;
        cue.actions[i].value = isNaN(parseFloat(v)) ? v : parseFloat(v);
      });
    });
    this._acts.querySelectorAll('[data-af]').forEach(inp => {
      const i = +inp.dataset.af;
      inp.addEventListener('input', () => { cue.actions[i].fade = parseFloat(inp.value) || 0; });
    });
    this._acts.querySelectorAll('[data-ad]').forEach(btn => {
      const i = +btn.dataset.ad;
      btn.addEventListener('click', () => { cue.actions.splice(i, 1); this.refreshEditor(); });
    });
  }

  addAction(defaultElementId) {
    const cue = this.selected;
    if (!cue) return;
    const els = this.engine.stageScene.elements;
    const el = els.find(e => e.id === defaultElementId) ?? els[0];
    if (!el) return;
    const firstProp = getAllProps(el)[0] ?? 'visible';
    cue.actions.push({ elementId: el.id, property: firstProp, value: '', fade: 0 });
    this.refreshEditor();
  }
}

/* helpers */
function getAllProps(el) {
  const props = [];
  for (const g of el.getProperties()) for (const p of g.props) props.push(p.key);
  return props;
}

function typeColor(type) {
  return { person: '#4caf50', light: '#ffeb3b', screen: '#2196f3', laser: '#e91e63', sfx: '#ff5722' }[type] ?? '#888';
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

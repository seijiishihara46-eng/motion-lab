let _cueN = 0;

export class Cue {
  constructor(num) {
    _cueN++;
    this.id = `q${_cueN}`;
    this.number = num ?? String(_cueN);
    this.name = `Cue ${this.number}`;
    this.preWait = 0;
    this.actions = []; // [{elementId, property, value, fade}]
  }
}

export class CueEngine {
  constructor(stageScene) {
    this.stageScene = stageScene;
    this.cues = [];
    this.pointer = -1;
    this._timers = [];
    this.onCueChange = null;
    this.onStatus = null;
  }

  get current() { return this.cues[this.pointer] ?? null; }
  get next()    { return this.cues[this.pointer + 1] ?? null; }

  addCue() {
    const c = new Cue(String(this.cues.length + 1));
    this.cues.push(c);
    return c;
  }

  removeCue(cue) {
    const i = this.cues.indexOf(cue);
    if (i < 0) return;
    this.cues.splice(i, 1);
    if (this.pointer >= this.cues.length) this.pointer = this.cues.length - 1;
  }

  go() {
    if (!this.cues.length) return;
    this.pointer = Math.min(this.pointer + 1, this.cues.length - 1);
    const cue = this.cues[this.pointer];
    if (!cue) return;

    const fire = () => { this._exec(cue); if (this.onCueChange) this.onCueChange(this.pointer); };
    if (cue.preWait > 0) {
      this._status(`待機中 ${cue.preWait}s…`);
      this._timers.push(setTimeout(fire, cue.preWait * 1000));
    } else {
      fire();
    }
  }

  stop() {
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this._status('STOPPED');
  }

  reset() {
    this.stop();
    this.pointer = -1;
    if (this.onCueChange) this.onCueChange(-1);
    this._status('Ready');
  }

  _exec(cue) {
    this._status(`▶ ${cue.number}  ${cue.name}`);
    for (const a of cue.actions) {
      const el = this.stageScene.elements.find(e => e.id === a.elementId);
      if (!el) continue;
      const fade = parseFloat(a.fade) || 0;
      if (fade <= 0) {
        el.setProperty(a.property, a.value);
      } else {
        this._fade(el, a.property, a.value, fade);
      }
    }
  }

  _fade(el, prop, targetVal, duration) {
    const startRaw = el.getPropertyValue(prop);
    const start = parseFloat(startRaw);
    const end   = parseFloat(targetVal);
    if (isNaN(start) || isNaN(end)) { el.setProperty(prop, targetVal); return; }

    const t0 = performance.now();
    const ms = duration * 1000;
    const tick = () => {
      const t = Math.min((performance.now() - t0) / ms, 1);
      const ease = t < 1 ? t * (2 - t) : 1;
      el.setProperty(prop, start + (end - start) * ease);
      if (t < 1) this._timers.push(setTimeout(tick, 40));
    };
    tick();
  }

  _status(msg) { if (this.onStatus) this.onStatus(msg); }
}

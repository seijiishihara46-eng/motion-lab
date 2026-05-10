// Observation field — main orchestrator.
// Active state is determined by composite observation pressure, not pointer x-position.
// No single factor governs state; the mapping is intentionally non-learnable.

import { Ontology } from './ontology.js';
import { GlyphSystem } from './glyphs.js';
import { OrbitResidue } from './orbit.js';
import { HushCondition } from './hush.js';

// Motion language constants
const COHERENCE_RECOVERY = 0.96;
const VELOCITY_IMPACT    = 0.011;
const VELOCITY_DECAY     = 0.86;

// Observation pressure weights — weights do not need to be equal,
// but no one factor should be large enough to determine state alone.
const W = {
  position:      0.18, // soft spatial bias (sigmoid, not threshold)
  stillness:     0.22, // duration since last significant movement
  velocity:      0.20, // inverted: high speed suppresses pressure
  dwell:         0.22, // recency-weighted history of where pointer has been
  residue:       0.10, // orbit residue density near current pointer
  manifestation: 0.08, // accumulated prior exposure to manifestation state
};

// Hysteresis bands prevent rapid state flickering at the boundaries
const HYSTERESIS = {
  toConvergence:     0.36,
  fromConvergence:   0.26,
  toManifestation:   0.66,
  fromManifestation: 0.56,
};

function sigmoid(x, center = 0.5, k = 6) {
  return 1 / (1 + Math.exp(-k * (x - center)));
}

// Tracks where the pointer has dwelled over a rolling time window.
// Produces a recency-weighted pressure signal independent of current position.
class DwellHistory {
  constructor(windowMs = 7000) {
    this._window     = windowMs;
    this._samples    = [];
    this._lastRecord = 0;
  }

  record(x, y) {
    const now = Date.now();
    if (now - this._lastRecord < 80) return; // ~12 samples/sec
    this._lastRecord = now;
    this._samples.push({ x, y, t: now });
    const cutoff = now - this._window;
    while (this._samples.length && this._samples[0].t < cutoff) {
      this._samples.shift();
    }
  }

  // Weighted average of the sigmoid-pressure of each past position,
  // with more recent samples weighted higher.
  pressureSignal() {
    if (this._samples.length < 2) return 0.5; // neutral until history builds
    const now = Date.now();
    let wSum = 0, pSum = 0;
    for (const s of this._samples) {
      const recency = 1 - (now - s.t) / this._window;
      const contrib = sigmoid(s.x);
      pSum += contrib * recency;
      wSum += recency;
    }
    return wSum > 0 ? pSum / wSum : 0.5;
  }
}

// Work residue: surfaces as field fragments at varying pressure thresholds
const WORK_RESIDUE_DATA = [
  { text: 'field study iii — incomplete',       x: 0.11, y: 0.36, emergeAt: 0.42 },
  { text: 'pressure mapping — drift residue',   x: 0.66, y: 0.21, emergeAt: 0.55 },
  { text: 'convergence notes (partial)',         x: 0.40, y: 0.68, emergeAt: 0.38 },
  { text: 'threshold condition — withheld',      x: 0.76, y: 0.57, emergeAt: 0.70 },
  { text: 'skill architecture / residue',        x: 0.23, y: 0.79, emergeAt: 0.60 },
];

class ObservationField {
  constructor() {
    this._fieldEl    = document.querySelector('.field');
    this._canvas     = document.getElementById('field-canvas');
    this._ctx        = this._canvas.getContext('2d');
    this._glyphLayer = document.getElementById('glyph-layer');
    this._orbitLayer = document.getElementById('orbit-layer');
    this._manifLayer = document.getElementById('manifestation-layer');
    this._statusEl   = document.getElementById('convergence-status');
    this._readoutEl  = document.getElementById('coherence-readout');

    // Field state
    this.coherence           = 1.0;
    this.convergencePressure = 0.0;
    this.zone                = 'pre-meaning';

    // Observation pressure (smoothed composite)
    this._smoothedPressure = 0.15;

    // Pointer tracking
    this._pointer    = { x: 0.5, y: 0.5 };
    this._velocity   = { x: 0, y: 0 };
    this._lastPtrTime = null;

    // Subsystems
    this._ontology = new Ontology();
    this._glyphs   = new GlyphSystem(this._glyphLayer);
    this._orbit    = new OrbitResidue(this._orbitLayer);
    this._hush     = new HushCondition(this._fieldEl);
    this._dwell    = new DwellHistory();

    this._works = this._buildWorks();
    this._lastFrame = performance.now();

    this._resize();
    this._bind();
    this._loop();
  }

  // ---- Works ----

  _buildWorks() {
    return WORK_RESIDUE_DATA.map(({ text, x, y, emergeAt }) => {
      const el = document.createElement('div');
      el.className = 'work-residue';
      el.textContent = text;
      el.style.left = `${x * 100}%`;
      el.style.top  = `${y * 100}%`;
      this._manifLayer.appendChild(el);
      return { el, emergeAt };
    });
  }

  // ---- Events ----

  _resize() {
    this._canvas.width  = window.innerWidth;
    this._canvas.height = window.innerHeight;
  }

  _bind() {
    window.addEventListener('resize', () => this._resize());

    window.addEventListener('pointermove', e => {
      const now = performance.now();
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      if (this._lastPtrTime !== null) {
        const dt = now - this._lastPtrTime;
        if (dt > 0) {
          this._velocity.x = (nx - this._pointer.x) / dt * 1000;
          this._velocity.y = (ny - this._pointer.y) / dt * 1000;
        }
      }
      this._pointer    = { x: nx, y: ny };
      this._lastPtrTime = now;
    });

    window.addEventListener('click', e => {
      if (this.zone !== 'pre-meaning') {
        this._orbit.deposit(e.clientX, e.clientY);
      }
    });

    // Nav buttons still allow direct state entry, but state persists
    // via pressure — moving away will eventually shift it back
    document.querySelectorAll('.zone').forEach(el => {
      el.addEventListener('click', () => this._setZone(el.dataset.zone));
    });
  }

  // ---- State ----

  _setZone(zone) {
    if (zone === this.zone) return;
    this.zone = zone;
    this._fieldEl.classList.remove(
      'field--pre-meaning', 'field--convergence', 'field--manifestation',
    );
    this._fieldEl.classList.add(`field--${zone}`);
  }

  // ---- Observation pressure ----

  _computeObservationPressure() {
    // 1. Position: sigmoid over x — contributes weakly, not deterministically
    const posSignal = sigmoid(this._pointer.x);

    // 2. Stillness: 0→1 as stillness duration grows toward 4.5 s
    const stillnessSignal = Math.min(1, this._hush.stillnessDuration / 4500);

    // 3. Velocity: inverted — movement suppresses pressure
    const speed = Math.hypot(this._velocity.x, this._velocity.y);
    const velocitySignal = Math.max(0, 1 - Math.min(1, speed / 1.8));

    // 4. Dwell: recency-weighted signal from movement history
    const dwellSignal = this._dwell.pressureSignal();

    // 5. Residue density near pointer — deposits influence local pressure
    const near = this._orbit.densityNear(this._pointer.x, this._pointer.y, 0.22);
    const residueSignal = Math.min(1, near / 3);

    // 6. Prior manifestation exposure — accumulated across this session
    const manifSignal = Math.min(1, this._ontology.manifestationCount() / 5);

    return (
      posSignal       * W.position +
      stillnessSignal * W.stillness +
      velocitySignal  * W.velocity +
      dwellSignal     * W.dwell +
      residueSignal   * W.residue +
      manifSignal     * W.manifestation
    );
  }

  _updateStateByPressure() {
    this._dwell.record(this._pointer.x, this._pointer.y);

    const raw = this._computeObservationPressure();
    // Pressure rises slower than it falls — asymmetric smoothing
    const alpha = raw > this._smoothedPressure ? 0.04 : 0.06;
    this._smoothedPressure = this._smoothedPressure * (1 - alpha) + raw * alpha;

    const p   = this._smoothedPressure;
    const cur = this.zone;
    let next  = cur;

    if (cur === 'pre-meaning' && p > HYSTERESIS.toConvergence) {
      next = 'convergence';
    } else if (cur === 'convergence') {
      if      (p < HYSTERESIS.fromConvergence)   next = 'pre-meaning';
      else if (p > HYSTERESIS.toManifestation)   next = 'manifestation';
    } else if (cur === 'manifestation' && p < HYSTERESIS.fromManifestation) {
      next = 'convergence';
    }

    if (next !== cur) this._setZone(next);
  }

  // ---- Per-frame updates ----

  _updateCoherence(dt) {
    const speed  = Math.hypot(this._velocity.x, this._velocity.y);
    const impact = Math.min(1, speed * VELOCITY_IMPACT) * (dt / 16);

    this.coherence = Math.max(0, Math.min(1,
      this.coherence * COHERENCE_RECOVERY - impact,
    ));

    // Convergence pressure tracks observation pressure, gated by ontology resolvability
    const threshold = this._ontology.convergenceThreshold;
    const target    = threshold === Infinity ? 0 : this._smoothedPressure;
    const delta     = target - this.convergencePressure;
    this.convergencePressure = Math.max(0, Math.min(1,
      this.convergencePressure + delta * (dt / 4000),
    ));
  }

  _drawField() {
    const ctx = this._ctx;
    const W   = this._canvas.width;
    const H   = this._canvas.height;
    ctx.clearRect(0, 0, W, H);

    const px = this._pointer.x * W;
    const py = this._pointer.y * H;

    // Coherence rings around pointer
    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 4;
      const r = 30 + t * 160 * this.convergencePressure;
      const a = this.coherence * 0.055 * (1 - t * 0.7);
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(138, 118, 88, ${a})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // Field lines rise with convergence pressure
    if (this.convergencePressure > 0.25) {
      const alpha  = (this.convergencePressure - 0.25) * 0.045;
      const count  = 6;
      const offset = (Date.now() * 0.006) % (H / count);
      ctx.strokeStyle = `rgba(100, 112, 100, ${alpha})`;
      ctx.lineWidth   = 0.3;
      for (let i = 0; i < count; i++) {
        const y = (i / count) * H + offset;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    }
  }

  _updateWorks() {
    const show = !this._hush.active;
    for (const w of this._works) {
      const emerged = show && this.convergencePressure > w.emergeAt;
      w.el.classList.toggle('work-residue--emerged', emerged);
    }
  }

  _updateStatus() {
    const threshold = this._ontology.convergenceThreshold;
    let text = '';

    if (threshold === Infinity) {
      text = 'convergence threshold unresolvable — manifestation required';
    } else if (this.convergencePressure > 0.55) {
      text = `threshold ${threshold.toFixed(3)} — pressure ${this.convergencePressure.toFixed(3)}`;
    }

    if (text) {
      this._statusEl.textContent = text;
      this._statusEl.classList.add('convergence-status--visible');
    } else {
      this._statusEl.classList.remove('convergence-status--visible');
    }

    this._readoutEl.textContent = `ƒ ${this.coherence.toFixed(3)}`;
  }

  // ---- Loop ----

  _loop() {
    const now = performance.now();
    const dt  = Math.min(now - this._lastFrame, 100);
    this._lastFrame = now;

    // Decay velocity first so all readers see current value
    this._velocity.x *= VELOCITY_DECAY;
    this._velocity.y *= VELOCITY_DECAY;

    // HUSH before pressure — stillnessDuration must be current
    this._hush.reportMovement(this._velocity);

    // Pressure drives state (replaces direct x→zone mapping)
    this._updateStateByPressure();

    // Coherence and convergence pressure derived from smoothed pressure
    this._updateCoherence(dt);

    // Ontology observation
    this._ontology.observe({
      zone: this.zone,
      coherence: this.coherence,
      convergencePressure: this.convergencePressure,
    });

    this._glyphs.update(this.coherence, this.convergencePressure);
    this._orbit.tick();
    this._drawField();
    this._updateWorks();
    this._updateStatus();

    requestAnimationFrame(() => this._loop());
  }
}

document.addEventListener('DOMContentLoaded', () => new ObservationField());

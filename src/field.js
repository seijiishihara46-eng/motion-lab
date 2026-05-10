// Observation field — main orchestrator.
// Issue #1: field behaviour redesigned around observation conditions.
// Motion results from shifting observation states, not decoration.
// Pointer movement disrupts field coherence; stillness builds convergence pressure.

import { Ontology } from './ontology.js';
import { GlyphSystem } from './glyphs.js';
import { OrbitResidue } from './orbit.js';
import { HushCondition } from './hush.js';

// Motion language constants
const COHERENCE_RECOVERY = 0.96; // per-frame bleed toward full coherence
const VELOCITY_IMPACT = 0.011;    // how strongly pointer speed disrupts coherence
const VELOCITY_DECAY = 0.86;      // per-frame velocity decay

// Work residue: emerges as manifestation residue, not a portfolio grid
const WORK_RESIDUE_DATA = [
  { text: 'field study iii — incomplete',       x: 0.11, y: 0.36, emergeAt: 0.42 },
  { text: 'pressure mapping — drift residue',   x: 0.66, y: 0.21, emergeAt: 0.55 },
  { text: 'convergence notes (partial)',         x: 0.40, y: 0.68, emergeAt: 0.38 },
  { text: 'threshold condition — withheld',      x: 0.76, y: 0.57, emergeAt: 0.70 },
  { text: 'skill architecture / residue',        x: 0.23, y: 0.79, emergeAt: 0.60 },
];

class ObservationField {
  constructor() {
    this._fieldEl     = document.querySelector('.field');
    this._canvas      = document.getElementById('field-canvas');
    this._ctx         = this._canvas.getContext('2d');
    this._glyphLayer  = document.getElementById('glyph-layer');
    this._orbitLayer  = document.getElementById('orbit-layer');
    this._manifLayer  = document.getElementById('manifestation-layer');
    this._statusEl    = document.getElementById('convergence-status');
    this._readoutEl   = document.getElementById('coherence-readout');

    // Field state
    this.coherence           = 1.0;
    this.convergencePressure = 0.0;
    this.zone                = 'pre-meaning';

    // Pointer tracking
    this._pointer     = { x: 0.5, y: 0.5 };
    this._velocity    = { x: 0, y: 0 };
    this._lastPointer = null;
    this._lastPtrTime = null;

    // Subsystems
    this._ontology = new Ontology();
    this._glyphs   = new GlyphSystem(this._glyphLayer);
    this._orbit    = new OrbitResidue(this._orbitLayer);
    this._hush     = new HushCondition(this._fieldEl);

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
      this._pointer   = { x: nx, y: ny };
      this._lastPtrTime = now;
    });

    // Deposit orbit residue on click within convergence or manifestation zones
    window.addEventListener('click', e => {
      if (this.zone !== 'pre-meaning') {
        this._orbit.deposit(e.clientX, e.clientY);
      }
    });

    // Zone navigation buttons
    document.querySelectorAll('.zone').forEach(el => {
      el.addEventListener('click', () => this._setZone(el.dataset.zone));
    });
  }

  // ---- Zone ----

  _setZone(zone) {
    if (zone === this.zone) return;
    this.zone = zone;
    this._fieldEl.classList.remove(
      'field--pre-meaning', 'field--convergence', 'field--manifestation',
    );
    this._fieldEl.classList.add(`field--${zone}`);
  }

  // ---- Per-frame updates ----

  _updateCoherence(dt) {
    const speed = Math.hypot(this._velocity.x, this._velocity.y);
    const impact = Math.min(1, speed * VELOCITY_IMPACT) * (dt / 16);

    // Coherence recovers toward 1 each frame but is knocked down by pointer speed
    this.coherence = Math.max(0, Math.min(1,
      this.coherence * COHERENCE_RECOVERY - impact,
    ));

    // Convergence pressure: rises when coherence is high and threshold is resolvable
    const threshold = this._ontology.convergenceThreshold;
    if (this.coherence > 0.65 && threshold !== Infinity) {
      this.convergencePressure = Math.min(1, this.convergencePressure + dt / 9000);
    } else {
      this.convergencePressure = Math.max(0, this.convergencePressure - dt / 4500);
    }
  }

  _updateZoneByPointer() {
    const x = this._pointer.x;
    const zone = x < 0.33 ? 'pre-meaning' : x < 0.67 ? 'convergence' : 'manifestation';
    if (zone !== this.zone) this._setZone(zone);
  }

  _drawField() {
    const ctx = this._ctx;
    const W = this._canvas.width;
    const H = this._canvas.height;
    ctx.clearRect(0, 0, W, H);

    const px = this._pointer.x * W;
    const py = this._pointer.y * H;

    // Coherence rings around pointer — motion-language rendering
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

    // Convergence pressure: slow horizontal field lines
    if (this.convergencePressure > 0.25) {
      const alpha = (this.convergencePressure - 0.25) * 0.045;
      const count = 6;
      const offset = (Date.now() * 0.006) % (H / count);
      ctx.strokeStyle = `rgba(100, 112, 100, ${alpha})`;
      ctx.lineWidth = 0.3;
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

    this._updateCoherence(dt);
    this._updateZoneByPointer();

    // Feed field state into ontology apparatus (Issue #3)
    this._ontology.observe({
      zone: this.zone,
      coherence: this.coherence,
      convergencePressure: this.convergencePressure,
    });

    // HUSH condition: stillness quiets the field
    this._hush.reportMovement(this._velocity);

    // Decay pointer velocity
    this._velocity.x *= VELOCITY_DECAY;
    this._velocity.y *= VELOCITY_DECAY;

    this._glyphs.update(this.coherence, this.convergencePressure);
    this._orbit.tick();
    this._drawField();
    this._updateWorks();
    this._updateStatus();

    requestAnimationFrame(() => this._loop());
  }
}

document.addEventListener('DOMContentLoaded', () => new ObservationField());

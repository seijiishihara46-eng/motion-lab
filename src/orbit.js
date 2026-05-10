// Orbit residue system — drifts independently across sessions as field memory.
// Residue positions are stored in localStorage and resume drifting on next visit.

const STORAGE_KEY = 'zyrko:orbit-residue';
const MAX_RESIDUE = 7;
const BASE_DRIFT = 0.000065; // normalised units / ms

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(residues) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(residues.map(r => ({
        x: r.x, y: r.y, dx: r.dx, dy: r.dy, born: r.born,
      }))),
    );
  } catch {
    // localStorage unavailable — field memory is impermanent here
  }
}

export class OrbitResidue {
  constructor(container) {
    this.container = container;
    this.residues = [];
    this._lastTick = Date.now();
    this._restore();
  }

  _restore() {
    for (const s of loadSaved()) {
      this._attach(s.x, s.y, s.dx, s.dy, s.born);
    }
  }

  _attach(x, y, dx, dy, born) {
    const el = document.createElement('div');
    el.className = 'orbit-residue';
    el.style.left = `${x * 100}%`;
    el.style.top = `${y * 100}%`;
    this.container.appendChild(el);
    const r = { el, x, y, dx, dy, born: born ?? Date.now() };
    this.residues.push(r);
    return r;
  }

  // Deposit a new residue at a viewport-pixel position
  deposit(px, py) {
    if (this.residues.length >= MAX_RESIDUE) {
      const evicted = this.residues.shift();
      evicted.el.remove();
    }
    const x = px / window.innerWidth;
    const y = py / window.innerHeight;
    const angle = Math.random() * Math.PI * 2;
    const speed = BASE_DRIFT * (0.6 + Math.random() * 0.8);
    this._attach(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed);
    persist(this.residues);
  }

  tick() {
    const now = Date.now();
    const dt = Math.min(now - this._lastTick, 200); // clamp to avoid jump on tab-return
    this._lastTick = now;

    for (const r of this.residues) {
      r.x = ((r.x + r.dx * dt) % 1 + 1) % 1;
      r.y = ((r.y + r.dy * dt) % 1 + 1) % 1;
      r.el.style.left = `${r.x * 100}%`;
      r.el.style.top = `${r.y * 100}%`;

      if (now - r.born > 120_000) {
        r.el.classList.add('orbit-residue--fading');
      }
    }

    persist(this.residues);
  }
}

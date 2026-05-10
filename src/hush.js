// HUSH condition — subtle quieting when the observer becomes still.
// No label or indicator is shown; the quieting is felt, not named.

const ONSET_MS = 3200;   // stillness duration before HUSH begins
const RELEASE_SPEED = 1.2; // pointer speed threshold to release HUSH

export class HushCondition {
  constructor(fieldEl) {
    this.fieldEl = fieldEl;
    this.active = false;
    this._stillSince = null;
    this._releaseAccum = 0;
    this._lastTime = Date.now();
  }

  // Call every frame with current pointer speed (normalised units/s)
  reportMovement(velocity) {
    const now = Date.now();
    const dt = now - this._lastTime;
    this._lastTime = now;

    const speed = Math.hypot(velocity.x, velocity.y);

    if (speed > RELEASE_SPEED) {
      this._stillSince = null;
      if (this.active) {
        this._releaseAccum += dt;
        if (this._releaseAccum > 280) {
          this._release();
        }
      }
    } else {
      this._releaseAccum = 0;
      if (!this._stillSince) {
        this._stillSince = now;
      }
      if (!this.active && now - this._stillSince > ONSET_MS) {
        this._onset();
      }
    }
  }

  get stillnessDuration() {
    return this._stillSince ? Date.now() - this._stillSince : 0;
  }

  _onset() {
    this.active = true;
    this.fieldEl.classList.add('field--hush');
  }

  _release() {
    this.active = false;
    this._releaseAccum = 0;
    this.fieldEl.classList.remove('field--hush');
  }
}

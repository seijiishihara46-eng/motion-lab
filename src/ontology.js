// Issue #3: convergence threshold requires manifestation observation.
// Certain field conditions become unobservable without manifestation —
// the ontology cannot stabilize its threshold through abstraction alone.

export class ObservationApparatus {
  constructor() {
    this._observations = [];
    this._maxObservations = 16;
  }

  record(fieldState) {
    this._observations.push({
      zone: fieldState.zone,
      coherence: fieldState.coherence,
      convergencePressure: fieldState.convergencePressure,
      ts: Date.now(),
    });
    if (this._observations.length > this._maxObservations) {
      this._observations.shift();
    }
  }

  hasObservedManifestation() {
    return this._observations.some(o => o.zone === 'manifestation');
  }

  // Stability grows with repeated manifestation observations, caps at 1
  stabilityFactor() {
    if (!this.hasObservedManifestation()) return 0;
    const count = this._observations.filter(o => o.zone === 'manifestation').length;
    return Math.min(1, count / 4);
  }
}

export class Ontology {
  constructor() {
    this.apparatus = new ObservationApparatus();
    this._baseThreshold = 0.68;
    this._manifestationCount = 0;
  }

  observe(fieldState) {
    this.apparatus.record(fieldState);
    if (fieldState.zone === 'manifestation') {
      this._manifestationCount++;
    }
  }

  // Convergence threshold: infinite until the apparatus has observed manifestation.
  // This is the core fix for Issue #3 — threshold cannot be derived abstractly.
  get convergenceThreshold() {
    const stability = this.apparatus.stabilityFactor();
    if (stability === 0) return Infinity;
    return this._baseThreshold - stability * 0.14;
  }

  isResolvable() {
    return this.apparatus.hasObservedManifestation();
  }

  manifestationCount() {
    return this._manifestationCount;
  }
}

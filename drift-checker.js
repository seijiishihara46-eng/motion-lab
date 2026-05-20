// Post-implementation drift checker.
// Documents intentional weaknesses, removed elements, and drift risks.
// Run with: node drift-checker.js

const INTENTIONAL_WEAKNESSES = [
  {
    id: 'convergence-threshold-infinity',
    zone: 'ontology',
    description:
      'Convergence threshold is Infinity until manifestation has been observed. ' +
      'Threshold stabilisation requires the observation apparatus — it cannot be ' +
      'derived through abstract ontology work alone (Issue #3).',
  },
  {
    id: 'glyph-withholding',
    zone: 'glyphs',
    description:
      'A randomised subset of glyphs is withheld at low coherence. ' +
      'The field resists complete learnability; partial information is by design.',
  },
  {
    id: 'work-residue-partial',
    zone: 'manifestation',
    description:
      'Works emerge as residue fragments at varying pressure thresholds. ' +
      'Some works have high emergeAt values and may never surface in a given session.',
  },
  {
    id: 'orbit-nondeterminism',
    zone: 'orbit',
    description:
      'Orbit residue drift angle and speed are randomly seeded per deposit; ' +
      'positions are non-reproducible. Field memory, not data.',
  },
  {
    id: 'hush-unlabelled',
    zone: 'hush',
    description:
      'HUSH condition carries no visible label or readout. ' +
      'Quieting should be felt, not identified.',
  },
  {
    id: 'pressure-composition-unmappable',
    zone: 'field',
    description:
      'Active state is determined by six factors weighted as: position (0.18), ' +
      'stillness (0.22), velocity-inverse (0.20), dwell history (0.22), residue ' +
      'density (0.10), manifestation exposure (0.08). No factor alone reaches any ' +
      'hysteresis threshold. Spatial position contributes less than stillness or ' +
      'dwell history. The observer cannot discover a reliable spatial shortcut to ' +
      'any condition.',
  },
  {
    id: 'dwell-history-temporal-opacity',
    zone: 'field',
    description:
      'The dwell window is 7 seconds, recency-weighted. The same pointer position ' +
      'yields different pressure depending on the path taken to reach it and how ' +
      'long the observer has been moving. State is path-dependent, not location-dependent.',
  },
  {
    id: 'residue-pressure-feedback',
    zone: 'orbit',
    description:
      'Orbit residue deposits increase local pressure via densityNear(). ' +
      'Areas where the observer has clicked accumulate pressure influence. ' +
      'The field gradually reshapes itself around past interaction — invisibly.',
  },
  {
    id: 'manifestation-exposure-accumulates',
    zone: 'ontology',
    description:
      'Each manifestation visit increments a session counter that lowers the ' +
      'convergence threshold and adds weight to the manifestation pressure factor. ' +
      'Return observers reach deeper states more easily, with no indication of why.',
  },
  {
    id: 'pressure-smoothing-asymmetric',
    zone: 'field',
    description:
      'Observation pressure rises at α=0.04 and falls at α=0.06. ' +
      'Pressure decays faster than it builds — state is sticky on entry, ' +
      'but recovery from disruption is quicker than settlement.',
  },
  {
    id: 'mark-bias-direction-hidden',
    zone: 'marks',
    description:
      'Each field mark has a hidden bias (range −0.05 to +0.09). ' +
      'The observer cannot determine whether interaction increases or decreases pressure. ' +
      'Visual type (glyph, residue, pressure, disturbance) is aesthetic only — ' +
      'type does not correlate with bias direction or magnitude.',
  },
  {
    id: 'mark-bias-insufficient-alone',
    zone: 'marks',
    description:
      'No single mark interaction can cross a hysteresis threshold unaided. ' +
      'Maximum click bias (0.09) is smaller than the narrowest band (0.10). ' +
      'Marks influence state only in combination with movement, stillness, and dwell.',
  },
  {
    id: 'mark-hover-click-asymmetry',
    zone: 'marks',
    description:
      'Hover applies 28% of click bias. The asymmetry is undiscoverable. ' +
      'Repeated hovering accumulates bias silently; the field responds without attribution.',
  },
  {
    id: 'mark-bias-decay-hidden',
    zone: 'marks',
    description:
      'Mark interaction bias decays with an 8-second half-life. ' +
      'Effects are transient and leave no visible trace.',
  },
  {
    id: 'mark-placement-non-systematic',
    zone: 'marks',
    description:
      'Marks are not spatially aligned to any state zone. ' +
      'Negative-bias marks appear at the right edge; positive-bias marks at the left. ' +
      'Spatial inference from mark position fails.',
  },
];

// Content structure module — documents the video segment mapping.
const CONTENT_STRUCTURE_NOTES = [
  {
    id: 'se-density-as-coherence-disruption',
    zone: 'content-structure',
    description:
      'SE density (many / moderate / few / minimal) is mapped to a coherence-disruption ' +
      'magnitude (0.06–0.72). High SE activity corresponds to low coherence — the field ' +
      'resists sustained observation when sound is fragmentary.',
  },
  {
    id: 'bgm-continuity-as-pressure-stability',
    zone: 'content-structure',
    description:
      'BGM continuity (switching / theme-fixed / continuous / theme-return) is mapped to a ' +
      'pressure-stability index (0–1). Continuous BGM (ranking segment) yields the highest ' +
      'stability (0.92), enabling the manifestation zone; frequent switching (opening) keeps ' +
      'stability at 0.18, holding the field in pre-meaning.',
  },
  {
    id: 'passive-listening-mode',
    zone: 'content-structure',
    description:
      'Segments marked passiveListening=true (background, ranking) correspond to hush-like ' +
      'field conditions — the observer is present but not actively directing attention. ' +
      'The HUSH condition activates naturally during these segments.',
  },
  {
    id: 'zone-mapping-descriptive-not-prescriptive',
    zone: 'content-structure',
    description:
      'likelyZone in fieldHints describes expected observation conditions, not a forced state. ' +
      'The field still responds to composite pressure from the live observer — segment timing ' +
      'is a structural tendency, not a clock-driven override.',
  },
];

const REMOVED_ELEMENTS = [
  'Direct x-position → zone mapping (was: x < 0.33 = pre-meaning, etc.) — replaced by composite pressure',
  'Named navigation buttons with state labels (pre-meaning / convergence / manifestation) — removed entirely',
  'Direct state-setting via user interaction — replaced by pressure bias from unlabeled marks',
  'Portfolio grid / card layout — replaced by work residue at variable thresholds',
  'Decorative / idle animations — all motion is observation-driven',
  'Loading states and spinners — field state is intentionally ambiguous on arrival',
  'Error messages — unresolvable threshold conditions are field conditions, not errors',
  'Hover tooltips and descriptive labels — withheld to resist full learnability',
];

const DRIFT_RISKS = [
  {
    id: 'orbit-storage-loss',
    description:
      'Orbit residue is lost if localStorage is cleared. ' +
      'Acceptable — field memory is impermanent. Residue pressure influence resets.',
  },
  {
    id: 'dwell-neutral-on-load',
    description:
      'DwellHistory returns 0.5 (neutral) until at least 2 samples accumulate (~160 ms). ' +
      'On first load the dwell factor is neutral, which is correct.',
  },
  {
    id: 'threshold-infinity-on-first-visit',
    description:
      'First-time visitors see "convergence threshold unresolvable" until they ' +
      'enter the manifestation state. This is correct and intended.',
  },
  {
    id: 'dom-state-class-readable',
    description:
      'Body carries a class (field--pre-meaning / field--convergence / field--manifestation) ' +
      'that a developer can read via DOM inspection. Not visible to a typical observer; ' +
      'acceptable as an implementation detail.',
  },
];

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('drift-checker.js')) {
  const hr = '─'.repeat(56);

  console.log(`\n${hr}`);
  console.log('  ZYRKO DRIFT CHECKER');
  console.log(`${hr}\n`);

  console.log('INTENTIONAL WEAKNESSES\n');
  INTENTIONAL_WEAKNESSES.forEach((w, i) => {
    console.log(`  [${i + 1}] ${w.id}  (${w.zone})`);
    console.log(`      ${w.description}\n`);
  });

  console.log('CONTENT STRUCTURE\n');
  CONTENT_STRUCTURE_NOTES.forEach((n, i) => {
    console.log(`  [${i + 1}] ${n.id}  (${n.zone})`);
    console.log(`      ${n.description}\n`);
  });

  console.log('REMOVED ELEMENTS\n');
  REMOVED_ELEMENTS.forEach((el, i) => console.log(`  [${i + 1}] ${el}`));

  console.log('\nDRIFT RISKS\n');
  DRIFT_RISKS.forEach((r, i) => {
    console.log(`  [${i + 1}] ${r.id}`);
    console.log(`      ${r.description}\n`);
  });

  console.log(hr + '\n');
}

export { INTENTIONAL_WEAKNESSES, REMOVED_ELEMENTS, DRIFT_RISKS, CONTENT_STRUCTURE_NOTES };

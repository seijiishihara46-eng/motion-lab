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
];

const REMOVED_ELEMENTS = [
  'Direct x-position → zone mapping (was: x < 0.33 = pre-meaning, etc.) — replaced by composite pressure',
  'Portfolio grid / card layout — replaced by work residue at variable thresholds',
  'Named navigation sections — replaced by three observation-pressure states',
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
    id: 'nav-button-pressure-override',
    description:
      'Zone nav buttons can still directly set state, bypassing pressure. ' +
      'Moving away will shift pressure and eventually transition state back. ' +
      'This is a mild learnability leak: buttons reveal state names.',
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

  console.log('REMOVED ELEMENTS\n');
  REMOVED_ELEMENTS.forEach((el, i) => console.log(`  [${i + 1}] ${el}`));

  console.log('\nDRIFT RISKS\n');
  DRIFT_RISKS.forEach((r, i) => {
    console.log(`  [${i + 1}] ${r.id}`);
    console.log(`      ${r.description}\n`);
  });

  console.log(hr + '\n');
}

export { INTENTIONAL_WEAKNESSES, REMOVED_ELEMENTS, DRIFT_RISKS };

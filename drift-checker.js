// Post-implementation drift checker (Issue #1 requirement).
// Documents intentional weaknesses and removed elements.
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
      'Works emerge as residue fragments, not complete portfolio items. ' +
      'Some works have high emergeAt thresholds and may never surface in a session.',
  },
  {
    id: 'orbit-nondeterminism',
    zone: 'orbit',
    description:
      'Orbit residue drift is seeded randomly per deposit; positions are ' +
      'non-reproducible. Field memory, not data.',
  },
  {
    id: 'hush-unlabelled',
    zone: 'hush',
    description:
      'HUSH condition carries no visible label or readout. ' +
      'Quieting should be felt, not identified.',
  },
  {
    id: 'zone-ambiguity',
    zone: 'navigation',
    description:
      'Zone labels (pre-meaning / convergence / manifestation) are intentionally ' +
      'without further explanation. Meaning is not provided by the field.',
  },
];

const REMOVED_ELEMENTS = [
  'Portfolio grid / card layout — replaced by work residue',
  'Named navigation sections — replaced by three-zone field (pre-meaning, convergence, manifestation)',
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
      'Acceptable — field memory is impermanent.',
  },
  {
    id: 'coherence-startup-spike',
    description:
      'On load, coherence starts at 1.0. First pointer movement disrupts it correctly. ' +
      'No initialisation suppression needed.',
  },
  {
    id: 'threshold-infinity-on-first-visit',
    description:
      'First-time visitors see "convergence threshold unresolvable" until they ' +
      'navigate to the manifestation zone. This is correct and intended.',
  },
];

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('drift-checker.js')) {
  const hr = '─'.repeat(52);

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

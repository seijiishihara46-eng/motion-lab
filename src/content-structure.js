// Video content structure — segments mapped to observation field parameters.
//
// SE density disrupts coherence; BGM continuity maps to hush/stillness pressure.
// Each segment's field parameters describe the expected observation conditions,
// not a prescriptive state — the field responds to the observer, not the clock.

// SE density labels → relative coherence-disruption magnitude
const SE_IMPACT = {
  many:     0.72,  // frequent cuts, high disruption
  moderate: 0.44,
  few:      0.20,
  minimal:  0.06,
};

// BGM continuity labels → pressure-stability index (0 = volatile, 1 = continuous)
const BGM_STABILITY = {
  switching:    0.18,
  'theme-fixed':  0.62,
  continuous:   0.92,
  'theme-return': 0.50,
};

export const SEGMENTS = [
  {
    id: 'opening',
    label: 'オープニング',
    durationMin: 1,
    se: 'many',
    bgm: 'switching',
    purpose: '視聴者の注意喚起',
    fieldHints: {
      coherenceDisruption: SE_IMPACT.many,
      pressureStability:   BGM_STABILITY.switching,
      likelyZone:          'pre-meaning',
    },
  },
  {
    id: 'introduction',
    label: '導入：ポンコツ質問',
    durationMin: 1,
    se: 'moderate',
    bgm: 'theme-fixed',
    purpose: '視聴者の共感・引き込み',
    fieldHints: {
      coherenceDisruption: SE_IMPACT.moderate,
      pressureStability:   BGM_STABILITY['theme-fixed'],
      likelyZone:          'convergence',
    },
  },
  {
    id: 'background',
    label: '時事ネタ背景説明',
    durationMin: 1,
    se: 'few',
    bgm: 'theme-fixed',
    purpose: 'データ・数字の挿入開始',
    passiveListening: true,   // 聞き流し開始
    fieldHints: {
      coherenceDisruption: SE_IMPACT.few,
      pressureStability:   BGM_STABILITY['theme-fixed'],
      likelyZone:          'convergence',
    },
  },
  {
    id: 'ranking',
    label: 'ランキング本編',
    durationMin: 15,
    se: 'minimal',            // 項目切り替わり時だけ
    bgm: 'continuous',        // 20分持つもの
    purpose: 'データ・引用・統計',
    passiveListening: true,   // 聞き流しモード
    tempoFocus: true,         // 音のテンポ重視（言葉のリズム感）
    fieldHints: {
      coherenceDisruption: SE_IMPACT.minimal,
      pressureStability:   BGM_STABILITY.continuous,
      likelyZone:          'manifestation',
    },
  },
  {
    id: 'closing',
    label: '締め：微笑ましいオチ',
    durationMin: 1,
    se: 'moderate',           // 笑える音
    bgm: 'theme-return',      // テーマに戻す
    fieldHints: {
      coherenceDisruption: SE_IMPACT.moderate,
      pressureStability:   BGM_STABILITY['theme-return'],
      likelyZone:          'convergence',
    },
  },
  {
    id: 'epilogue',
    label: 'エピローグ',
    durationMin: 1,
    se: 'minimal',
    bgm: 'theme-fixed',
    purpose: '登録・いいね催促',
    fieldHints: {
      coherenceDisruption: SE_IMPACT.minimal,
      pressureStability:   BGM_STABILITY['theme-fixed'],
      likelyZone:          'convergence',
    },
  },
];

export const TOTAL_DURATION_MIN = SEGMENTS.reduce((sum, s) => sum + s.durationMin, 0);

// Returns the segment active at offsetMin minutes from the start.
// Returns null if offsetMin exceeds total duration.
export function segmentAt(offsetMin) {
  let elapsed = 0;
  for (const seg of SEGMENTS) {
    elapsed += seg.durationMin;
    if (offsetMin < elapsed) return seg;
  }
  return null;
}

// Returns a normalised position (0–1) within the full video at the given offset.
export function progressAt(offsetMin) {
  return Math.min(1, Math.max(0, offsetMin / TOTAL_DURATION_MIN));
}

/* 照明テンプレート・アクター動きテンプレート定義 */

export const LIGHTING_TEMPLATES = {
  calm: {
    name: '穏やか',
    lights: [
      { intensity: 2, color: '#e8d4b8', angle: 45 },
      { intensity: 1.5, color: '#b0d0ff', angle: 60 },
    ],
    screen: { color: '#f5f5f0', active: true },
    ambientGlow: 0.4,
  },
  intense: {
    name: '迫力',
    lights: [
      { intensity: 8, color: '#ff6b35', angle: 30 },
      { intensity: 5, color: '#ff3d00', angle: 25 },
      { intensity: 3, color: '#ffff00', angle: 70 },
    ],
    screen: { color: '#ff3300', active: true },
    laserActive: true,
    ambientGlow: 0.15,
  },
  battle: {
    name: '戦闘',
    lights: [
      { intensity: 10, color: '#ff0000', angle: 35 },
      { intensity: 7, color: '#ffff00', angle: 40 },
      { intensity: 4, color: '#0099ff', angle: 50 },
    ],
    screen: { color: '#ff3d00', active: true },
    laserActive: true,
    laserFanAngle: 80,
    sfxActive: 'sparkle',
    ambientGlow: 0.2,
  },
  farewell: {
    name: '別れ',
    lights: [
      { intensity: 3, color: '#ff9999', angle: 50 },
      { intensity: 2, color: '#ffcccc', angle: 55 },
      { intensity: 1, color: '#6699ff', angle: 70 },
    ],
    screen: { color: '#ffeeee', active: true },
    ambientGlow: 0.35,
  },
  dance: {
    name: 'ダンス',
    lights: [
      { intensity: 6, color: '#ff00ff', angle: 40 },
      { intensity: 5, color: '#00ffff', angle: 45 },
      { intensity: 4, color: '#ffff00', angle: 50 },
      { intensity: 3, color: '#00ff00', angle: 55 },
    ],
    screen: { color: '#ff00ff', active: true },
    laserActive: true,
    laserFanAngle: 120,
    sfxActive: 'confetti',
    ambientGlow: 0.25,
  },
  special_attack: {
    name: '必殺技',
    lights: [
      { intensity: 12, color: '#ffff00', angle: 20 },
      { intensity: 10, color: '#ff6600', angle: 25 },
      { intensity: 8, color: '#ffffff', angle: 35 },
      { intensity: 6, color: '#00ff00', angle: 60 },
    ],
    screen: { color: '#ffff00', active: true },
    laserActive: true,
    laserFanAngle: 100,
    laserBeamCount: 20,
    sfxActive: 'pyro',
    ambientGlow: 0.1,
  },
  darkness: {
    name: '暗転',
    lights: [],
    screen: { color: '#000000', active: false },
    laserActive: false,
    sfxActive: null,
    ambientGlow: 0.05,
  },
  spotlight: {
    name: 'スポット',
    lights: [
      { intensity: 15, color: '#ffffff', angle: 15 },
    ],
    screen: { color: '#ffffff', active: true },
    ambientGlow: 0.1,
  },
};

export const ACTOR_TEMPLATES = {
  center: {
    name: 'センター',
    positions: [{ x: 0, z: 2 }],
    formation: 'solo',
  },
  wide: {
    name: 'ワイド',
    positions: [
      { x: -3, z: 0 },
      { x: 0, z: 1 },
      { x: 3, z: 0 },
    ],
    formation: 'wide',
  },
  left_focus: {
    name: '左フォーカス',
    positions: [{ x: -4, z: 1 }],
    formation: 'solo',
  },
  right_focus: {
    name: '右フォーカス',
    positions: [{ x: 4, z: 1 }],
    formation: 'solo',
  },
  group: {
    name: 'グループ',
    positions: [
      { x: -2, z: 0 },
      { x: 0, z: 1.5 },
      { x: 2, z: 0 },
    ],
    formation: 'group',
  },
  diagonal: {
    name: '対角線',
    positions: [
      { x: -4, z: -1 },
      { x: 0, z: 1 },
      { x: 4, z: 3 },
    ],
    formation: 'diagonal',
  },
  v_shape: {
    name: 'V字',
    positions: [
      { x: -3, z: -1 },
      { x: 0, z: 2 },
      { x: 3, z: -1 },
    ],
    formation: 'v_shape',
  },
  cross: {
    name: '十字',
    positions: [
      { x: 0, z: 0 },
      { x: -2.5, z: 1 },
      { x: 2.5, z: 1 },
      { x: 0, z: 3 },
    ],
    formation: 'cross',
  },
  surround: {
    name: 'サラウンド',
    positions: [
      { x: -3, z: -1 },
      { x: 3, z: -1 },
      { x: -2, z: 3 },
      { x: 2, z: 3 },
    ],
    formation: 'surround',
  },
  entrance_left: {
    name: '左エントランス',
    positions: [{ x: -5, z: 0, entering: true }],
    formation: 'solo',
    movement: 'enter_from_left',
  },
  entrance_right: {
    name: '右エントランス',
    positions: [{ x: 5, z: 0, entering: true }],
    formation: 'solo',
    movement: 'enter_from_right',
  },
  exit_left: {
    name: '左エグジット',
    positions: [{ x: -5, z: 1, exiting: true }],
    formation: 'solo',
    movement: 'exit_to_left',
  },
  exit_right: {
    name: '右エグジット',
    positions: [{ x: 5, z: 1, exiting: true }],
    formation: 'solo',
    movement: 'exit_to_right',
  },
};

export const SCENE_TYPES = {
  opening: { label: 'オープニング', defaultLighting: 'calm', defaultActor: 'center' },
  entrance: { label: 'エントランス', defaultLighting: 'intense', defaultActor: 'entrance_left' },
  dialogue: { label: 'セリフ', defaultLighting: 'calm', defaultActor: 'center' },
  battle: { label: '戦闘', defaultLighting: 'battle', defaultActor: 'wide' },
  dance: { label: 'ダンス', defaultLighting: 'dance', defaultActor: 'group' },
  special_attack: { label: '必殺技', defaultLighting: 'special_attack', defaultActor: 'center' },
  emotional: { label: '感情シーン', defaultLighting: 'farewell', defaultActor: 'spotlight' },
  exit: { label: 'エグジット', defaultLighting: 'calm', defaultActor: 'exit_left' },
  transition: { label: 'トランジション', defaultLighting: 'darkness', defaultActor: 'center' },
};

export function getLightingTemplate(name) {
  return LIGHTING_TEMPLATES[name] || LIGHTING_TEMPLATES.calm;
}

export function getActorTemplate(name) {
  return ACTOR_TEMPLATES[name] || ACTOR_TEMPLATES.center;
}

export function getSceneType(name) {
  return SCENE_TYPES[name] || SCENE_TYPES.dialogue;
}

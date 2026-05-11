/* スクリプトパーサー — タイムコードと舞台指示を検出 */

const CUE_KEYWORDS = {
  emotional: ['悲しい', '切ない', '別れ', '涙', 'emotional', '感動', '苦しい', '悔しい', '望郷'],
  battle: ['戦闘', 'battle', '攻撃', '斬る', '飛び込む', '剣', '武器', 'fight', 'clash', '激突'],
  dance: ['踊る', 'dance', 'ダンス', 'dancing', '音楽', 'music', 'リズム'],
  special_attack: ['必殺', '最後の力', '最終奥義', 'ultimate', 'special move', 'finishing blow', '終わりの一撃'],
  intense: ['激しい', 'intense', 'powerful', 'great', '壮大', '迫力', '圧倒的'],
  entrance: ['登場', 'entrance', 'appears', '現れる', 'enter', 'やってくる'],
  exit: ['去る', 'exit', 'exits', '去っていく', 'leave'],
  light: ['光', 'light', 'bright', '輝く', 'glow', 'shine'],
  darkness: ['暗', 'dark', 'darkness', '真っ暗', 'shadow'],
  screen: ['スクリーン', 'screen', 'display', '映像', 'video', 'image'],
  laser: ['レーザー', 'laser', 'beam', 'ビーム'],
  effect: ['煙', 'smoke', 'fog', '火花', 'spark', '爆発', 'explosion', 'confetti', '紙吹雪'],
  group: ['一緒', 'together', 'group', 'グループ', 'formation'],
};

const TIME_PATTERN = /(\d{1,2}):(\d{2}):(\d{2})|(\d{1,2}):(\d{2})|t([\d.]+)s?/i;

export class ScriptParser {
  parse(scriptText) {
    const lines = scriptText.split('\n').filter(l => l.trim());
    const cuePoints = [];
    let currentTime = 0;
    let currentSceneType = 'dialogue';
    let lastTimestamp = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // タイムコード検出
      const timeMatch = line.match(TIME_PATTERN);
      if (timeMatch) {
        const [, h, m, s, m2, s2, t] = timeMatch;
        if (h && m && s) {
          currentTime = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
        } else if (m2 && s2) {
          currentTime = parseInt(m2) * 60 + parseInt(s2);
        } else if (t) {
          currentTime = parseFloat(t);
        }
        lastTimestamp = currentTime;
        continue;
      }

      // シーン種別検出
      const sceneMatch = detectSceneType(line);
      if (sceneMatch) {
        currentSceneType = sceneMatch;
      }

      // キーワード検出
      const keywords = extractKeywords(line);
      if (keywords.length > 0 || line.length > 20) {
        const cue = {
          time: currentTime,
          label: extractLabel(line),
          sceneType: currentSceneType,
          emotions: keywords.emotional || [],
          actions: keywords.actions || [],
          lightingKeywords: keywords.light || [],
          screenKeywords: keywords.screen || [],
          laserKeywords: keywords.laser || [],
          effectKeywords: keywords.effect || [],
          originalLine: line,
        };
        cuePoints.push(cue);
        currentTime += 2; // デフォルト2秒進める
      }
    }

    return {
      rawCues: cuePoints,
      duration: Math.max(...cuePoints.map(c => c.time), 60),
      sceneCount: cuePoints.length,
    };
  }
}

function detectSceneType(text) {
  const t = text.toLowerCase();
  if (t.includes('opening') || t.includes('オープニング')) return 'opening';
  if (t.includes('entrance') || t.includes('登場')) return 'entrance';
  if (t.includes('battle') || t.includes('戦闘')) return 'battle';
  if (t.includes('dance') || t.includes('踊')) return 'dance';
  if (t.includes('special') || t.includes('必殺')) return 'special_attack';
  if (t.includes('emotional') || t.includes('感情')) return 'emotional';
  if (t.includes('exit') || t.includes('去')) return 'exit';
  if (t.includes('transition') || t.includes('トランジション')) return 'transition';
  return null;
}

function extractKeywords(text) {
  const result = {};
  const lower = text.toLowerCase();

  for (const [category, words] of Object.entries(CUE_KEYWORDS)) {
    const found = words.filter(w => text.includes(w) || lower.includes(w.toLowerCase()));
    if (found.length > 0) result[category] = found;
  }

  return result;
}

function extractLabel(text) {
  // セリフ行から話者を抽出、またはアクション説明から短いラベルを作成
  const shortText = text.replace(/[「『].*[」』]/g, '').slice(0, 30);
  return shortText || 'Scene';
}

export function generateCuesFromDetection(detectedCues, engine, stageScene) {
  const cues = [];

  for (const detected of detectedCues.rawCues) {
    const cue = engine.addCue();
    cue.number = String(cues.length + 1);
    cue.name = detected.label;
    cue.preWait = 0;

    // シーン種別から照明テンプレートを選択
    const lightingName = mapSceneTypeToLighting(detected.sceneType, detected);
    const actorName = mapSceneTypeToActor(detected.sceneType, detected);

    // キーワードから具体的な設定を推測
    const lightIntensity = detectLightIntensity(detected);
    const screenColor = detectScreenColor(detected);
    const laserActive = detected.laserKeywords.length > 0;
    const sfxType = detectSFXType(detected);

    // 各アクターに位置とアクションを割り当てる
    for (const actor of stageScene.elements) {
      if (actor.type !== 'person') continue;

      // アクター配置のアクションを追加
      const xPos = Math.random() * 4 - 2;
      const zPos = Math.random() * 2;
      cue.actions.push(
        { elementId: actor.id, property: 'x', value: xPos, fade: 1 },
        { elementId: actor.id, property: 'z', value: zPos, fade: 1 }
      );
    }

    // 照明アクションを追加
    const lights = stageScene.elements.filter(e => e.type === 'light').slice(0, 2);
    for (const light of lights) {
      cue.actions.push(
        { elementId: light.id, property: 'intensity', value: lightIntensity, fade: 2 },
        { elementId: light.id, property: 'color', value: screenColor, fade: 2 },
        { elementId: light.id, property: 'active', value: true, fade: 0 }
      );
    }

    // スクリーンアクション
    const screen = stageScene.elements.find(e => e.type === 'screen');
    if (screen) {
      cue.actions.push(
        { elementId: screen.id, property: 'color', value: screenColor, fade: 2 },
        { elementId: screen.id, property: 'active', value: screenColor !== '#000000', fade: 0 }
      );
    }

    // レーザーアクション
    const laser = stageScene.elements.find(e => e.type === 'laser');
    if (laser && laserActive) {
      cue.actions.push(
        { elementId: laser.id, property: 'active', value: true, fade: 0 },
        { elementId: laser.id, property: 'fanAngle', value: 60, fade: 1 }
      );
    }

    // 特効アクション
    const sfx = stageScene.elements.find(e => e.type === 'sfx');
    if (sfx && sfxType) {
      cue.actions.push(
        { elementId: sfx.id, property: 'fxType', value: sfxType, fade: 0 },
        { elementId: sfx.id, property: 'active', value: true, fade: 0 }
      );
    }

    cues.push(cue);
  }

  return cues;
}

function mapSceneTypeToLighting(sceneType, detected) {
  if (detected.emotions?.includes('別れ') || sceneType === 'emotional') return 'farewell';
  if (detected.actions?.some(a => a.includes('戦') || a.includes('attack'))) return 'battle';
  if (sceneType === 'battle') return 'battle';
  if (sceneType === 'dance') return 'dance';
  if (sceneType === 'special_attack') return 'special_attack';
  if (detected.lightingKeywords?.includes('暗') || sceneType === 'transition') return 'darkness';
  if (detected.lightingKeywords?.some(l => l.includes('intense'))) return 'intense';
  return 'calm';
}

function mapSceneTypeToActor(sceneType, detected) {
  if (sceneType === 'entrance') return 'entrance_left';
  if (sceneType === 'exit') return 'exit_left';
  if (sceneType === 'battle') return 'wide';
  if (sceneType === 'dance') return 'group';
  if (sceneType === 'special_attack') return 'center';
  if (detected.actions?.includes('group')) return 'group';
  return 'center';
}

function detectLightIntensity(detected) {
  if (detected.lightingKeywords?.includes('暗')) return 0.5;
  if (detected.sceneType === 'battle') return 8;
  if (detected.sceneType === 'special_attack') return 12;
  if (detected.emotions?.length > 0) return 2;
  return 3;
}

function detectScreenColor(detected) {
  if (detected.sceneType === 'battle') return '#ff3d00';
  if (detected.sceneType === 'special_attack') return '#ffff00';
  if (detected.sceneType === 'dance') return '#ff00ff';
  if (detected.emotions?.includes('悲しい')) return '#6699ff';
  if (detected.lightingKeywords?.includes('暗')) return '#000000';
  return '#ffffff';
}

function detectSFXType(detected) {
  if (detected.sceneType === 'battle') return 'sparkle';
  if (detected.sceneType === 'special_attack') return 'pyro';
  if (detected.sceneType === 'dance') return 'confetti';
  if (detected.effectKeywords?.includes('smoke')) return 'fog';
  return null;
}

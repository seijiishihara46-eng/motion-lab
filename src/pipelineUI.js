/* パイプラインUI — スクリプト → キュー → ステージング → エクスポート */

import { ScriptParser, generateCuesFromDetection } from './scriptParser.js';
import { loadPDFFile } from './pdfLoader.js';

export class PipelineUI {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.step = 1;
    this.parsedScript = null;
    this.generatedCues = [];
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
    this.render();
    this.container.style.display = 'flex';
  }

  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
  }

  render() {
    const steps = [
      { n: 1, label: 'スクリプト読込', icon: '📄' },
      { n: 2, label: 'キュー検出', icon: '🎯' },
      { n: 3, label: 'ステージング案', icon: '🎬' },
      { n: 4, label: 'アクター配置', icon: '👥' },
      { n: 5, label: 'プレビュー', icon: '▶' },
      { n: 6, label: 'エクスポート', icon: '📥' },
    ];

    let html = `<div class="pipeline-container">
      <div class="pipeline-header">
        <h2>ステージング ワークフロー</h2>
        <button class="close-btn">✕</button>
      </div>
      <div class="pipeline-steps">`;

    for (const s of steps) {
      const active = s.n === this.step ? 'active' : '';
      const done = s.n < this.step ? 'done' : '';
      html += `<div class="step-btn ${active} ${done}" data-step="${s.n}">
        <div class="step-icon">${s.icon}</div>
        <div class="step-label">${s.n}. ${s.label}</div>
      </div>`;
    }

    html += `</div><div class="pipeline-content">`;

    switch (this.step) {
      case 1:
        html += this._renderScriptImport();
        break;
      case 2:
        html += this._renderCueDetection();
        break;
      case 3:
        html += this._renderStagingDraft();
        break;
      case 4:
        html += this._renderActorBlocking();
        break;
      case 5:
        html += this._renderPreview();
        break;
      case 6:
        html += this._renderExport();
        break;
    }

    html += `</div></div>`;
    this.container.innerHTML = html;

    this.container.querySelector('.close-btn').onclick = () => this.close();
    this.container.querySelectorAll('.step-btn').forEach(btn => {
      btn.onclick = () => {
        const newStep = parseInt(btn.dataset.step);
        if (newStep <= this.step || this.parsedScript) {
          this.step = newStep;
          this.render();
        }
      };
    });
  }

  _renderScriptImport() {
    return `<div class="pipeline-panel">
      <h3>📄 ステップ 1: スクリプト読込</h3>
      <p>演出込み台本をテキストで貼り付けるか、PDFファイルをアップロードしてください。
      タイムコード、シーン指定、キャラクター、アクション、感情表現などから自動的にキューポイントを検出します。</p>

      <div style="margin-bottom:15px;">
        <label style="display:inline-block;margin-bottom:8px;font-weight:bold;">📎 PDFファイル読込:</label><br>
        <input type="file" id="pdf-input" accept=".pdf" style="margin-bottom:8px;">
        <button class="action-btn" id="load-pdf">PDFを読込 →</button>
        <div id="pdf-status" style="margin-top:6px;color:var(--text-dim);font-size:11px;"></div>
      </div>

      <div style="border-top:1px solid var(--border);padding-top:12px;">
        <label style="display:block;margin-bottom:8px;font-weight:bold;">📝 またはテキスト貼り付け:</label>
        <textarea id="script-input" placeholder="1:00 [OPENING]&#10;暗転から、温かい光が照らされる&#10;&#10;1:05 主人公が登場する&#10;悲しそうな表情&#10;涙がこぼれる&#10;&#10;1:30 [BATTLE]&#10;敵が襲ってくる&#10;激しい戦闘..."
          style="width:100%;height:250px;font-family:monospace;padding:8px;"></textarea>
        <button class="action-btn" id="parse-script">スクリプトを解析 →</button>
      </div>

      <div id="sample-scripts" style="margin-top:15px;">
        <button class="link-btn" id="load-sample-hero">📺 サンプル: ヒーローショー</button>
      </div>
    </div>`;
  }

  _renderCueDetection() {
    if (!this.parsedScript) return '<p>スクリプトをまず解析してください</p>';
    const cues = this.parsedScript.rawCues || [];
    return `<div class="pipeline-panel">
      <h3>🎯 ステップ 2: キュー検出</h3>
      <p>スクリプトから自動検出されたキューポイント:</p>
      <div style="max-height:400px;overflow-y:auto;border:1px solid var(--border);padding:8px;">
        ${cues.map((c, i) => `
          <div style="padding:6px;margin:4px 0;background:var(--panel2);border-radius:3px;">
            <strong>キュー ${i+1}</strong> (時間: ${c.time}s)<br>
            <small>${c.label}<br>
            🎭 ${c.sceneType}${c.emotions.length ? ' | 😢 ' + c.emotions.join(', ') : ''}
            ${c.actions.length ? '<br>⚔ ' + c.actions.join(', ') : ''}
            ${c.lightingKeywords.length ? '<br>💡 ' + c.lightingKeywords.join(', ') : ''}
            ${c.effectKeywords.length ? '<br>✨ ' + c.effectKeywords.join(', ') : ''}
            </small>
          </div>
        `).join('')}
      </div>
      <button class="action-btn" id="generate-staging">ステージング案を生成 →</button>
    </div>`;
  }

  _renderStagingDraft() {
    return `<div class="pipeline-panel">
      <h3>🎬 ステップ 3: ステージング案生成</h3>
      <p>検出されたキューにテンプレートを適用し、初期ステージングを作成します。</p>
      <div id="staging-status">
        <button class="action-btn" id="create-draft">ドラフトを作成 →</button>
      </div>
    </div>`;
  }

  _renderActorBlocking() {
    return `<div class="pipeline-panel">
      <h3>👥 ステップ 4: アクター配置</h3>
      <p>各シーンのアクター配置を編集します。3Dシーンでドラッグして移動できます。</p>
      <button class="action-btn" id="advance-preview">プレビューに進む →</button>
    </div>`;
  }

  _renderPreview() {
    return `<div class="pipeline-panel">
      <h3>▶ ステップ 5: プレビュー</h3>
      <p>生成されたステージングをシーンで再生します。右側のキューパネルで調整できます。</p>
      <button class="action-btn" id="play-preview">▶ 再生</button>
      <button class="action-btn" id="stop-preview">■ 停止</button>
      <p style="margin-top:10px;color:var(--text-dim);">手動で個別キューを編集したり、JSONで編集することもできます。</p>
      <button class="action-btn" id="advance-export">エクスポートに進む →</button>
    </div>`;
  }

  _renderExport() {
    return `<div class="pipeline-panel">
      <h3>📥 ステップ 6: AI動画エクスポート</h3>
      <p>ステージング情報をAI動画生成用のフォーマットでエクスポートします。</p>
      <button class="action-btn" id="export-video-brief">📋 AI動画ブリーフを生成</button>
      <button class="action-btn" id="export-json">💾 JSON形式でダウンロード</button>
      <div id="export-output" style="margin-top:10px;max-height:300px;overflow-y:auto;
        background:var(--bg);border:1px solid var(--border);padding:8px;border-radius:3px;
        font-size:11px;color:var(--text-dim);">
      </div>
    </div>`;
  }
}

export function setupPipelineHandlers(pipelineUI, app, engine, stageScene) {
  const cont = pipelineUI.container;

  cont.addEventListener('click', async e => {
    if (e.target.id === 'load-pdf') {
      try {
        const pdfInput = document.getElementById('pdf-input');
        const status = document.getElementById('pdf-status');
        status.textContent = '読み込み中...';
        const text = await loadPDFFile(pdfInput);
        if (text) {
          document.getElementById('script-input').value = text;
          status.textContent = '✅ PDFを読み込みました (' + Math.ceil(text.length / 1000) + 'KB)';
          setTimeout(() => { status.textContent = ''; }, 3000);
        }
      } catch (err) {
        document.getElementById('pdf-status').textContent = '❌ エラー: ' + err.message;
      }
    }

    if (e.target.id === 'parse-script') {
      const scriptText = document.getElementById('script-input')?.value || '';
      if (!scriptText.trim()) { alert('スクリプトを入力してください'); return; }
      const parser = new ScriptParser();
      pipelineUI.parsedScript = parser.parse(scriptText);
      pipelineUI.step = 2;
      pipelineUI.render();
      setupPipelineHandlers(pipelineUI, app, engine, stageScene);
    }

    if (e.target.id === 'load-sample-hero') {
      document.getElementById('script-input').value = SAMPLE_SCRIPT_HERO;
    }

    if (e.target.id === 'generate-staging') {
      pipelineUI.generatedCues = generateCuesFromDetection(pipelineUI.parsedScript, engine, stageScene);
      pipelineUI.step = 3;
      pipelineUI.render();
      setupPipelineHandlers(pipelineUI, app, engine, stageScene);
    }

    if (e.target.id === 'create-draft') {
      const output = document.getElementById('staging-status');
      output.innerHTML = `<div style="background:var(--panel2);padding:10px;border-radius:3px;margin:10px 0;">
        ✅ ${pipelineUI.generatedCues.length}個のキューを作成しました。<br>
        キューパネルで確認できます。
      </div>
      <button class="action-btn" id="advance-blocking">アクター配置に進む →</button>`;
      output.querySelector('#advance-blocking').onclick = () => { pipelineUI.step = 4; pipelineUI.render(); setupPipelineHandlers(pipelineUI, app, engine, stageScene); };
    }

    if (e.target.id === 'advance-preview')  { pipelineUI.step = 5; pipelineUI.render(); setupPipelineHandlers(pipelineUI, app, engine, stageScene); }
    if (e.target.id === 'advance-export')   { pipelineUI.step = 6; pipelineUI.render(); setupPipelineHandlers(pipelineUI, app, engine, stageScene); }

    if (e.target.id === 'play-preview') {
      engine.reset();
      const playLoop = () => { if (engine.next) { engine.go(); setTimeout(playLoop, 2000); } };
      playLoop();
    }

    if (e.target.id === 'stop-preview') { engine.stop(); }

    if (e.target.id === 'export-video-brief') {
      const brief = generateVideoBrief(pipelineUI.generatedCues, stageScene);
      const output = document.getElementById('export-output');
      output.innerHTML = `<pre style="white-space:pre-wrap;word-wrap:break-word;font-size:10px;margin:0;">${brief}</pre>
        <button class="action-btn" style="margin-top:8px;" onclick="navigator.clipboard.writeText(\`${brief.replace(/`/g, '\\`')}\`);alert('コピーしました')">
          📋 クリップボードへコピー
        </button>`;
    }

    if (e.target.id === 'export-json') {
      const json = JSON.stringify(pipelineUI.generatedCues.map(c => ({
        number: c.number, name: c.name, preWait: c.preWait, actions: c.actions,
      })), null, 2);
      downloadFile(json, 'staging-cues.json');
    }
  });
}

function generateVideoBrief(cues, stageScene) {
  let brief = '# ステージング AI動画生成ブリーフ\n\n';
  brief += `## 概要\n- 総キュー数: ${cues.length}\n\n`;
  brief += '## シーンバイシーン\n\n';
  for (let i = 0; i < cues.length; i++) {
    const c = cues[i];
    brief += `### シーン ${i+1}: ${c.name}\n`;
    brief += `- 待機時間: ${c.preWait}s\n`;
    brief += `- アクション数: ${c.actions.length}\n\n`;
  }
  brief += '## カメラ方向\n舞台正面、観客視点\n\n';
  brief += '## ステージレイアウト\n舞台幅: 22m / 奥行: 16m / 天高: 10m\n';
  return brief;
}

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const SAMPLE_SCRIPT_HERO = `[OPENING]
0:00 完全な暗闇
観客を静寂で包む

[LIGHT UP]
0:05 やさしい白い光が舞台奥を照らす
音楽が静かに始まる
主人公が立っている
悲しそうな表情

[DIALOGUE]
0:15 主人公、観客へ向かって話しかける
「これまで多くの試練を乗り越えてきた」

[VILLAIN ENTRANCE]
0:45 敵が登場
激しい赤い光が照らされる
レーザービームが交差する

[BATTLE]
1:15 戦闘音楽が激しくなる
黄色と赤のライトが激しく点滅
レーザーの数が増える

[SPECIAL ATTACK]
1:58 主人公が立ち上がる
全スポットライトが最大輝度
黄色のレーザービームが爆発的に増える

[VICTORY]
2:30 敵が倒れる
光が落ち着く
青と白の穏やかな光

[ENDING]
3:15 照明が消える
ゆっくり暗転
完全な闇`;

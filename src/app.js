import { StageScene } from './scene.js';
import { Person, StageLight, Screen, Laser, SpecialFX } from './elements.js';
import { CueEngine } from './cues.js';
import { Inspector, ElementListUI, CueListUI } from './ui.js';

class App {
  constructor() {
    this.stageScene = new StageScene(document.getElementById('stage-canvas'));
    this.engine     = new CueEngine(this.stageScene);
    this.inspector  = new Inspector(document.getElementById('inspector-content'));
    this.elListUI   = new ElementListUI(document.getElementById('element-list'));
    this.cueUI      = new CueListUI(
      document.getElementById('cue-list'),
      document.getElementById('cue-meta'),
      document.getElementById('cue-action-list'),
      this.engine
    );

    this._wireScene();
    this._wireToolbar();
    this._wireCuePanel();
    this._refreshElList();

    // Welcome: add a few starter elements
    this._addElement('light', -4, -3);
    this._addElement('light',  4, -3);
    this._addElement('screen',  0, -8);
    this._addElement('person', -2, 1);
    this.stageScene.select(null);
    this._refreshElList();
  }

  _wireScene() {
    this.stageScene.onSelect = el => {
      this.inspector.show(el);
      this._refreshElList();
    };
  }

  _wireToolbar() {
    document.getElementById('add-person').onclick = () => this._addElement('person');
    document.getElementById('add-light') .onclick = () => this._addElement('light');
    document.getElementById('add-screen').onclick = () => this._addElement('screen');
    document.getElementById('add-laser') .onclick = () => this._addElement('laser');
    document.getElementById('add-sfx')   .onclick = () => this._addElement('sfx');

    document.getElementById('delete-selected').onclick = () => {
      const el = this.stageScene.selectedElement;
      if (!el) return;
      this.stageScene.remove(el);
      this.inspector.show(null);
      this._refreshElList();
      this.cueUI.refreshList();
    };

    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.stageScene.setView(btn.dataset.view);
      };
    });
  }

  _addElement(type, xOverride, zOverride) {
    const x = xOverride ?? (Math.random() - 0.5) * 12;
    const z = zOverride ?? (Math.random() - 0.5) * 8;
    const sc = this.stageScene.scene;
    let el;
    switch (type) {
      case 'person': el = new Person(sc, x, z);       break;
      case 'light':  el = new StageLight(sc, x, z);   break;
      case 'screen': el = new Screen(sc, x, z);        break;
      case 'laser':  el = new Laser(sc, x, z);         break;
      case 'sfx':    el = new SpecialFX(sc, x, z);     break;
    }
    this.stageScene.add(el);
    this.stageScene.select(el);
    this.inspector.show(el);
    this._refreshElList();
    return el;
  }

  _wireCuePanel() {
    document.getElementById('btn-go').onclick    = () => { this.engine.go(); this.cueUI.refreshList(); };
    document.getElementById('btn-stop').onclick  = () => { this.engine.stop(); this.cueUI.refreshList(); };
    document.getElementById('btn-reset').onclick = () => { this.engine.reset(); this.cueUI.refreshList(); };

    document.getElementById('btn-add-cue').onclick = () => {
      const cue = this.engine.addCue();
      this.cueUI.selected = cue;
      this.cueUI.refreshList();
      this.cueUI.refreshEditor();
    };

    document.getElementById('btn-add-action').onclick = () => {
      const sel = this.stageScene.selectedElement ?? this.stageScene.elements[0];
      if (!sel) { alert('エレメントを先に追加してください'); return; }
      this.cueUI.addAction(sel.id);
    };

    this.engine.onStatus = msg => {
      document.getElementById('cue-status').textContent = msg;
    };

    this.engine.onCueChange = () => {
      const next = this.engine.next;
      document.getElementById('next-cue-label').textContent =
        next ? `NEXT: ${next.number} ${next.name}` : 'NEXT: —';
      this.cueUI.refreshList();
    };

    this.inspector.onChange = () => {
      this._refreshElList();
      this.cueUI.refreshList();
      this.cueUI.refreshEditor();
    };
  }

  _refreshElList() {
    this.elListUI.refresh(this.stageScene.elements, this.stageScene.selectedElement);
    this.elListUI.onSelect = id => {
      const el = this.stageScene.elements.find(e => e.id === id);
      if (el) { this.stageScene.select(el); this.inspector.show(el); }
    };
    this.elListUI.onToggleVis = id => {
      const el = this.stageScene.elements.find(e => e.id === id);
      if (el) { el.setProperty('visible', !el.visible); this._refreshElList(); }
    };
  }
}

document.addEventListener('DOMContentLoaded', () => new App());

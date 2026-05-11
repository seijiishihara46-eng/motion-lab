import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class StageScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.elements = [];
    this.selectedElement = null;
    this.onSelect = null;

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initControls();
    this._buildStage();
    this._initPick();
    this._bindEvents();
    this._lastTime = performance.now() / 1000;
    this._loop();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this._resize();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06060e);
    this.scene.fog = new THREE.FogExp2(0x06060e, 0.018);
    this.scene.add(new THREE.AmbientLight(0x111133, 0.5));
  }

  _initCamera() {
    const el = this.canvas.parentElement;
    this.camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 200);
    this.camera.position.set(0, 14, 24);
    this.camera.lookAt(0, 2, 0);
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 2, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 70;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15;
  }

  _buildStage() {
    const s = this.scene;

    // Floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.12, 18),
      new THREE.MeshLambertMaterial({ color: 0x151515 })
    );
    floor.position.set(0, -0.06, 0);
    s.add(floor);

    // Grid
    const grid = new THREE.GridHelper(22, 22, 0x1a1a30, 0x111120);
    grid.position.y = 0.02;
    s.add(grid);

    // Down-stage edge (yellow tape)
    const tape = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.025, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    tape.position.set(0, 0.01, 9);
    s.add(tape);

    // Wing walls
    const wingMat = new THREE.MeshLambertMaterial({ color: 0x0c0c0c });
    [-11, 11].forEach(x => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.25, 14, 18), wingMat);
      w.position.set(x, 7, 0);
      s.add(w);
    });

    // Back wall
    const bw = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 0.25), wingMat);
    bw.position.set(0, 7, -9);
    s.add(bw);

    // Lighting bars (truss)
    const trussMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
    [-5, 0, 5].forEach(z => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(22, 0.12, 0.12), trussMat);
      bar.position.set(0, 10.06, z);
      s.add(bar);
    });

    // Coordinate indicator
    s.add(Object.assign(new THREE.AxesHelper(1.5), { position: new THREE.Vector3(-10, 0.1, 8) }));
  }

  _initPick() {
    this.raycaster = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();
    this._floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this._mdPos = null;
  }

  _bindEvents() {
    window.addEventListener('resize', () => this._resize());
    this.canvas.addEventListener('mousedown', e => { this._mdPos = [e.clientX, e.clientY]; });
    this.canvas.addEventListener('click', e => {
      if (!this._mdPos) return;
      const dx = e.clientX - this._mdPos[0];
      const dy = e.clientY - this._mdPos[1];
      this._mdPos = null;
      if (Math.sqrt(dx*dx + dy*dy) < 5) this._pick(e);
    });
  }

  _pick(e) {
    const rect = this.canvas.getBoundingClientRect();
    this._mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    this._mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this._mouse, this.camera);

    const meshes = [];
    for (const el of this.elements) {
      if (el.mesh) el.mesh.traverse(c => { if (c.isMesh) meshes.push(c); });
    }

    const hits = this.raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) {
      let obj = hits[0].object;
      while (obj && !obj.userData.elementId) obj = obj.parent;
      if (obj?.userData?.elementId) {
        const el = this.elements.find(e => e.id === obj.userData.elementId);
        if (el) { this.select(el); return; }
      }
    }
    this.select(null);
  }

  select(el) {
    if (this.selectedElement) this.selectedElement.setSelected(false);
    this.selectedElement = el;
    if (el) el.setSelected(true);
    if (this.onSelect) this.onSelect(el);
  }

  add(el) { this.elements.push(el); }

  remove(el) {
    const i = this.elements.indexOf(el);
    if (i >= 0) this.elements.splice(i, 1);
    el.dispose();
    if (this.selectedElement === el) this.select(null);
  }

  setView(view) {
    const C = this.camera, ctrl = this.controls;
    switch (view) {
      case 'top':
        C.position.set(0, 32, 0.001); ctrl.target.set(0, 0, 0); break;
      case 'front':
        C.position.set(0, 7, 28); ctrl.target.set(0, 5, 0); break;
      case 'perspective':
        C.position.set(0, 14, 24); ctrl.target.set(0, 2, 0); break;
    }
    ctrl.update();
  }

  _resize() {
    const el = this.canvas.parentElement;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    this.renderer.setSize(w, h, false);
    if (this.camera) { this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    const now = performance.now() / 1000;
    const dt = Math.min(now - this._lastTime, 0.1);
    this._lastTime = now;
    this.controls.update();
    for (const el of this.elements) el.update(dt);
    this.renderer.render(this.scene, this.camera);
  }
}

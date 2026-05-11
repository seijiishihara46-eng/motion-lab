import * as THREE from 'three';

let _counter = 0;

const TYPE_NAMES = {
  person: '人物', light: '照明', screen: 'スクリーン', laser: 'レーザー', sfx: '特効',
};

export class StageElement {
  constructor(type, threeScene) {
    this.id = `${type}_${++_counter}`;
    this.type = type;
    this.name = `${TYPE_NAMES[type] || type} ${_counter}`;
    this._scene = threeScene;
    this.mesh = null;
    this.visible = true;
    this._ring = null;
  }

  setSelected(sel) {
    if (this._ring) this._ring.visible = sel;
  }

  _addRing(x, z, r = 0.55) {
    const geo = new THREE.RingGeometry(r, r + 0.07, 36);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00bcd4, side: THREE.DoubleSide, depthWrite: false });
    this._ring = new THREE.Mesh(geo, mat);
    this._ring.rotation.x = -Math.PI / 2;
    this._ring.position.set(x, 0.03, z);
    this._ring.visible = false;
    this._scene.add(this._ring);
  }

  setPosition(x, y, z) {
    if (this.mesh) {
      this.mesh.position.set(x, y, z);
      if (this._ring) this._ring.position.set(x, 0.03, z);
      this._onMove(x, y, z);
    }
  }

  _onMove(x, y, z) {}

  getPos() { return this.mesh ? this.mesh.position.clone() : new THREE.Vector3(); }

  getProperties() {
    const p = this.getPos();
    return [
      { group: '基本', props: [
        { key: 'name',    label: '名前',  type: 'text',     value: this.name },
        { key: 'visible', label: '表示',  type: 'checkbox', value: this.visible },
        { key: 'x',       label: 'X',     type: 'number',   value: +p.x.toFixed(2), step: 0.5 },
        { key: 'z',       label: 'Z(奥)', type: 'number',   value: +p.z.toFixed(2), step: 0.5 },
        { key: 'y',       label: 'Y(高)', type: 'number',   value: +p.y.toFixed(2), step: 0.5 },
      ]},
    ];
  }

  getPropertyValue(key) {
    for (const g of this.getProperties()) {
      for (const p of g.props) {
        if (p.key === key) return p.value;
      }
    }
    return null;
  }

  setProperty(key, value) {
    const p = this.getPos();
    switch (key) {
      case 'name':    this.name = String(value); break;
      case 'visible':
        this.visible = !!value;
        if (this.mesh) this.mesh.visible = this.visible;
        break;
      case 'x': this.setPosition(+value, p.y, p.z); break;
      case 'z': this.setPosition(p.x, p.y, +value); break;
      case 'y': this.setPosition(p.x, +value, p.z); break;
    }
  }

  update(_dt) {}

  dispose() {
    if (this.mesh) this._scene.remove(this.mesh);
    if (this._ring) this._scene.remove(this._ring);
  }
}

/* ─────────────────────────────── PERSON ─── */
export class Person extends StageElement {
  constructor(scene, x = 0, z = 0) {
    super('person', scene);
    this.color = '#4caf50';

    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
    this._mat = mat;

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.1, 10), mat);
    body.position.y = 0.55;
    group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), mat);
    head.position.y = 1.3;
    group.add(head);

    group.position.set(x, 0, z);
    group.userData.elementId = this.id;
    scene.add(group);
    this.mesh = group;
    this._addRing(x, z, 0.35);
  }

  getProperties() {
    const base = super.getProperties();
    base.push({ group: '外観', props: [
      { key: 'color', label: 'カラー', type: 'color', value: this.color },
    ]});
    return base;
  }

  setProperty(key, value) {
    super.setProperty(key, value);
    if (key === 'color') { this.color = value; this._mat.color.set(value); }
  }
}

/* ─────────────────────────────── STAGE LIGHT ─── */
export class StageLight extends StageElement {
  constructor(scene, x = 0, z = -3) {
    super('light', scene);
    this.color = '#ffffff';
    this.intensity = 3;
    this.angle = 25;
    this.targetX = 0;
    this.targetZ = 2;
    this.active = true;

    const group = new THREE.Group();

    // Fixture body
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.45), bodyMat);
    group.add(body);

    // Lens
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this._lensMat = lensMat;
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.13, 16), lensMat);
    lens.position.z = 0.23;
    group.add(lens);

    // SpotLight
    this._spot = new THREE.SpotLight(0xffffff, this.intensity, 35, THREE.MathUtils.degToRad(this.angle / 2), 0.35, 1);
    this._spot.position.set(0, 0, 0);
    group.add(this._spot);
    const target = new THREE.Object3D();
    target.position.set(this.targetX - x, -10, this.targetZ - z);
    group.add(target);
    this._spot.target = target;
    this._spotTarget = target;

    // Beam cone (visual)
    this._coneMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.055,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this._cone = new THREE.Mesh(this._makeConeGeo(), this._coneMat);
    this._cone.position.y = -6;
    group.add(this._cone);

    group.position.set(x, 10, z);
    group.userData.elementId = this.id;
    scene.add(group);
    this.mesh = group;
    this._addRing(x, z, 0.45);
  }

  _makeConeGeo() {
    const h = 12;
    const r = Math.tan(THREE.MathUtils.degToRad(this.angle / 2)) * h;
    return new THREE.ConeGeometry(r, h, 18, 1, true);
  }

  _onMove(x, _y, z) {
    this._spotTarget.position.set(this.targetX - x, -10, this.targetZ - z);
  }

  getProperties() {
    const base = super.getProperties();
    base.push({ group: '照明設定', props: [
      { key: 'active',    label: '点灯',    type: 'checkbox', value: this.active },
      { key: 'color',     label: 'カラー',  type: 'color',    value: this.color },
      { key: 'intensity', label: '輝度',    type: 'range',    value: this.intensity, min: 0, max: 12, step: 0.1 },
      { key: 'angle',     label: '角度(°)', type: 'range',    value: this.angle, min: 5, max: 80, step: 1 },
      { key: 'tx',        label: 'TgtX',    type: 'number',   value: +this.targetX.toFixed(1), step: 0.5 },
      { key: 'tz',        label: 'TgtZ',    type: 'number',   value: +this.targetZ.toFixed(1), step: 0.5 },
    ]});
    return base;
  }

  setProperty(key, value) {
    super.setProperty(key, value);
    const p = this.getPos();
    switch (key) {
      case 'active':
        this.active = !!value;
        this._spot.visible = this.active;
        this._cone.visible = this.active;
        this._lensMat.color.set(this.active ? this.color : '#111111');
        break;
      case 'color':
        this.color = value;
        this._spot.color.set(value);
        this._coneMat.color.set(value);
        if (this.active) this._lensMat.color.set(value);
        break;
      case 'intensity':
        this.intensity = +value;
        this._spot.intensity = this.intensity;
        this._coneMat.opacity = Math.min(0.14, this.intensity * 0.025);
        break;
      case 'angle':
        this.angle = +value;
        this._spot.angle = THREE.MathUtils.degToRad(this.angle / 2);
        this._cone.geometry.dispose();
        this._cone.geometry = this._makeConeGeo();
        break;
      case 'tx':
        this.targetX = +value;
        this._spotTarget.position.set(this.targetX - p.x, -10, this.targetZ - p.z);
        break;
      case 'tz':
        this.targetZ = +value;
        this._spotTarget.position.set(this.targetX - p.x, -10, this.targetZ - p.z);
        break;
    }
  }
}

/* ─────────────────────────────── SCREEN ─── */
export class Screen extends StageElement {
  constructor(scene, x = 0, z = -7.5) {
    super('screen', scene);
    this.color = '#1565c0';
    this.width = 6;
    this.height = 3;
    this.active = true;

    const group = new THREE.Group();
    this._mat = new THREE.MeshBasicMaterial({ color: 0x1565c0, side: THREE.DoubleSide });
    this._screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), this._mat);
    group.add(this._screenMesh);

    // Frame
    const fMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const fw = 0.12;
    const addBar = (w, h, px, py) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), fMat);
      m.position.set(px, py, -0.01);
      group.add(m);
    };
    addBar(this.width + fw * 2, fw, 0,  this.height / 2 + fw / 2);
    addBar(this.width + fw * 2, fw, 0, -this.height / 2 - fw / 2);
    addBar(fw, this.height, -this.width / 2 - fw / 2, 0);
    addBar(fw, this.height,  this.width / 2 + fw / 2, 0);

    group.position.set(x, this.height / 2 + 0.3, z);
    group.userData.elementId = this.id;
    scene.add(group);
    this.mesh = group;
    this._addRing(x, z, 1.2);
  }

  getProperties() {
    const base = super.getProperties();
    base.push({ group: 'スクリーン設定', props: [
      { key: 'active', label: '点灯',   type: 'checkbox', value: this.active },
      { key: 'color',  label: 'カラー', type: 'color',    value: this.color },
      { key: 'width',  label: '幅(m)',  type: 'number',   value: this.width,  step: 0.5 },
      { key: 'height', label: '高(m)',  type: 'number',   value: this.height, step: 0.5 },
    ]});
    return base;
  }

  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case 'active':
        this.active = !!value;
        this._mat.color.set(this.active ? this.color : '#050508');
        break;
      case 'color':
        this.color = value;
        if (this.active) this._mat.color.set(value);
        break;
      case 'width':
        this.width = Math.max(0.5, +value);
        this._screenMesh.geometry.dispose();
        this._screenMesh.geometry = new THREE.PlaneGeometry(this.width, this.height);
        break;
      case 'height':
        this.height = Math.max(0.5, +value);
        this._screenMesh.geometry.dispose();
        this._screenMesh.geometry = new THREE.PlaneGeometry(this.width, this.height);
        const p = this.getPos();
        this.mesh.position.y = this.height / 2 + 0.3;
        break;
    }
  }
}

/* ─────────────────────────────── LASER ─── */
export class Laser extends StageElement {
  constructor(scene, x = 0, z = -5) {
    super('laser', scene);
    this.color = '#e91e63';
    this.fanAngle = 50;
    this.beamCount = 7;
    this.rotY = 0;
    this.active = true;

    const group = new THREE.Group();
    this._beams = new THREE.Group();
    group.add(this._beams);

    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    group.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.35), bodyMat));

    group.position.set(x, 9, z);
    group.userData.elementId = this.id;
    scene.add(group);
    this.mesh = group;
    this._buildBeams();
    this._addRing(x, z, 0.4);
  }

  _buildBeams() {
    this._beams.clear();
    if (!this.active) return;

    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(this.color),
      transparent: true, opacity: 0.92,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const L = 18;
    const half = THREE.MathUtils.degToRad(this.fanAngle / 2);

    for (let i = 0; i < this.beamCount; i++) {
      const t = this.beamCount === 1 ? 0 : (i / (this.beamCount - 1) - 0.5) * 2;
      const a = t * half;
      const pts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.sin(a) * L, -L * Math.cos(a), 0),
      ];
      this._beams.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
  }

  getProperties() {
    const base = super.getProperties();
    base.push({ group: 'レーザー設定', props: [
      { key: 'active',    label: '点灯',  type: 'checkbox', value: this.active },
      { key: 'color',     label: 'カラー',type: 'color',    value: this.color },
      { key: 'fanAngle',  label: 'ファン角', type: 'range', value: this.fanAngle,  min: 0, max: 130, step: 1 },
      { key: 'beamCount', label: 'ビーム数', type: 'range', value: this.beamCount, min: 1, max: 24,  step: 1 },
      { key: 'rotY',      label: '回転Y',  type: 'range',   value: this.rotY, min: -180, max: 180, step: 1 },
    ]});
    return base;
  }

  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case 'active':    this.active    = !!value;  this._buildBeams(); break;
      case 'color':     this.color     = value;    this._buildBeams(); break;
      case 'fanAngle':  this.fanAngle  = +value;   this._buildBeams(); break;
      case 'beamCount': this.beamCount = +value;   this._buildBeams(); break;
      case 'rotY':
        this.rotY = +value;
        if (this.mesh) this.mesh.rotation.y = THREE.MathUtils.degToRad(this.rotY);
        break;
    }
  }
}

/* ─────────────────────────────── SPECIAL FX ─── */
export class SpecialFX extends StageElement {
  constructor(scene, x = 0, z = 0) {
    super('sfx', scene);
    this.color = '#ff5722';
    this.fxType = 'confetti';
    this.active = false;
    this._vels = [];
    this._pts = null;
    this._t = 0;

    const group = new THREE.Group();
    const mMat = new THREE.MeshLambertMaterial({ color: 0xff5722 });
    this._mMat = mMat;
    const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), mMat);
    group.add(marker);

    group.position.set(x, 0, z);
    group.userData.elementId = this.id;
    scene.add(group);
    this.mesh = group;
    this._addRing(x, z, 0.45);
    this._buildParticles();
  }

  _buildParticles() {
    if (this._pts) { this.mesh.remove(this._pts); this._pts.geometry.dispose(); this._pts.material.dispose(); }
    const N = 100;
    const pos = new Float32Array(N * 3);
    this._vels = [];
    for (let i = 0; i < N; i++) {
      pos[i * 3] = pos[i * 3 + 1] = pos[i * 3 + 2] = 0;
      this._vels.push({
        vx: (Math.random() - 0.5) * 2.5,
        vy: Math.random() * 6 + 2,
        vz: (Math.random() - 0.5) * 2.5,
        life: Math.random() * 2,
        maxLife: 1.8 + Math.random() * 0.8,
      });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(this.color), size: 0.14,
      transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this._pts = new THREE.Points(geo, mat);
    this._pts.visible = this.active;
    this.mesh.add(this._pts);
  }

  update(dt) {
    if (!this.active || !this._pts) return;
    const pos = this._pts.geometry.attributes.position.array;
    const G = -9;
    for (let i = 0; i < this._vels.length; i++) {
      const v = this._vels[i];
      v.life += dt;
      if (v.life > v.maxLife) {
        pos[i*3] = pos[i*3+1] = pos[i*3+2] = 0;
        v.life = 0;
        v.vx = (Math.random()-0.5)*2.5; v.vy = Math.random()*6+2; v.vz = (Math.random()-0.5)*2.5;
        v.maxLife = 1.8 + Math.random()*0.8;
      } else {
        const t = v.life;
        pos[i*3]   = v.vx * t;
        pos[i*3+1] = v.vy * t + 0.5 * G * t * t;
        pos[i*3+2] = v.vz * t;
      }
    }
    this._pts.geometry.attributes.position.needsUpdate = true;
  }

  getProperties() {
    const base = super.getProperties();
    base.push({ group: '特効設定', props: [
      { key: 'active', label: '起動',   type: 'checkbox', value: this.active },
      { key: 'color',  label: 'カラー', type: 'color',    value: this.color },
      { key: 'fxType', label: 'タイプ', type: 'select',   value: this.fxType,
        options: ['confetti', 'sparkle', 'pyro', 'snow'] },
    ]});
    return base;
  }

  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case 'active':
        this.active = !!value;
        if (this._pts) this._pts.visible = this.active;
        if (this.active) this._vels.forEach(v => { v.life = v.maxLife; });
        break;
      case 'color':
        this.color = value;
        if (this._pts) this._pts.material.color.set(value);
        this._mMat.color.set(value);
        break;
      case 'fxType':
        this.fxType = value;
        this._buildParticles();
        if (this.active && this._pts) this._pts.visible = true;
        break;
    }
  }
}

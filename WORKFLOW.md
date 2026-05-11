# Stage Lab Workflow — スタージングワークフロー

## Overview

Stage Lab is a web-based **stage production 3D pre-visualization tool** that transforms theatre scripts into 3D cue sequences using AI-assisted staging.

**Workflow: Script → Cues → 3D Scene → Export**

---

## 🎬 Workflow Pipeline

### Step 1: Script Import
**What:** Paste your staging script with timing and production notes
**Features:**
- Supports timestamps (0:00, 1:30, etc.)
- Scene type detection: opening, battle, dance, emotional, exit, transition
- Automatic keyword extraction
- Sample script included (hero show)

**Example:**
```
0:05 [OPENING]
やさしい白い光が舞台奥を照らす

0:15 [DIALOGUE]
主人公が観客へ向かって話しかける
悲しそうな表情

0:45 [VILLAIN ENTRANCE]
敵が上手から登場
激しい赤い光が照らされる
```

---

### Step 2: Cue Detection
**What:** System automatically detects timing and production elements from script
**Detects:**
- 📌 Cue points (timing, label)
- 🎭 Scene types (opening, battle, emotional, etc.)
- 😢 Emotions (sad, angry, joyful, intense, etc.)
- ⚔️ Actions (battle, dance, entrance, exit)
- 💡 Lighting keywords (bright, dark, intense, glow)
- 📺 Screen/video keywords (screen, video, display)
- ⚡ Laser/beam keywords
- ✨ Special effect keywords (smoke, fog, spark, confetti, explosion)

---

### Step 3: Staging Draft Generation
**What:** Converts detected cues into 3D playable cue sequences using templates
**Applies:**
- **Lighting Templates:**
  - `calm` — gentle, warm tones
  - `intense` — powerful, saturated colors
  - `battle` — red + yellow + blue clashing lights
  - `farewell` — pink, blue, emotional
  - `dance` — multicolor cycling
  - `special_attack` — maximum intensity golden + effects
  - `darkness` — blackout
  - `spotlight` — solo focus

- **Actor Templates:**
  - `center` — single actor center stage
  - `wide` — three actors spread left-center-right
  - `left_focus` / `right_focus` — solo on sides
  - `group` — close formation
  - `diagonal` — actors on diagonal line
  - `v_shape` — V-formation
  - `cross` — cross pattern
  - `surround` — actors at four corners
  - `entrance_left` / `entrance_right` — actors entering
  - `exit_left` / `exit_right` — actors exiting

---

### Step 4: Actor Blocking
**What:** Review and adjust actor placements for each scene
**Features:**
- Suggested placements from templates
- Visual editing in 3D viewport
- Drag-and-drop positioning
- Formation type indication

---

### Step 5: Preview
**What:** Play the generated staging in 3D scene
**Controls:**
- ▶ Play (auto-advances cues every 2 seconds)
- ■ Stop (pause playback)
- Manual cue editing via right panel
- JSON editing for power users
- Live property adjustment

---

### Step 6: AI Video Export
**What:** Generate structured brief for AI video generation
**Exports:**
1. **Video Brief (Markdown)**
   - Scene-by-scene breakdown
   - Action descriptions
   - Lighting summaries
   - Actor placement descriptions
   - Emotional tone per scene

2. **JSON Export**
   - All cues in standard format
   - All actions with timing
   - All element properties
   - Timing and transitions

---

## 📁 Implementation Files

### Core Application
- **`index.html`** — App shell, modal containers
- **`styles/stage.css`** — Unified dark theme, pipeline styles
- **`src/app.js`** — Main orchestration, all event wiring

### 3D Engine
- **`src/scene.js`** — Three.js scene, camera, controls, picking
- **`src/elements.js`** — Stage elements (Person, StageLight, Screen, Laser, SpecialFX)
  - Each element has position, properties, update() for animation

### Cue System
- **`src/cues.js`** — Cue class, CueEngine for playback
  - Supports pre-wait delays
  - Action-based property setting
  - Fade interpolation (ease-out quad)

### UI Components
- **`src/ui.js`** — Inspector, ElementListUI, CueListUI
  - Property editing forms
  - List selection
  - Action editor

### Workflow Pipeline
- **`src/pipelineUI.js`** — 6-step workflow modal
  - Script input panel
  - Cue detection display
  - Staging draft interface
  - Actor blocking helper
  - Preview controls
  - Export buttons

- **`src/scriptParser.js`** — Script parsing and cue generation
  - `ScriptParser.parse()` — extracts timing, keywords, scene types
  - `generateCuesFromDetection()` — creates playable cues from detection results
  - Keyword categories: emotional, battle, dance, special_attack, intense, entrance, exit, light, darkness, screen, laser, effect, group

- **`src/templates.js`** — Reusable lighting and actor arrangements
  - `LIGHTING_TEMPLATES` — 8 lighting looks with color, intensity, effects
  - `ACTOR_TEMPLATES` — 10+ actor placement patterns
  - `SCENE_TYPES` — mapping scene names to default templates

---

## 🎨 Key Features

### 1. 3D Stage Visualization
- Full stage with floor, wings, back wall, truss
- Four camera views: perspective, top, front
- Orbit controls
- Lighting grid reference

### 2. Stage Elements
- **Persons** — Humanoid silhouettes, colorable, draggable
- **Lights** — Three.js SpotLights with visible beam cones
  - Properties: intensity, color, angle, target position
  - Real-time visual feedback
- **Screens** — LED wall planes
  - Properties: color, size, active state
  - Glow and frame rendering
- **Lasers** — Additive-blended beam lines
  - Fan pattern with configurable angle, beam count, rotation
- **Special FX** — Particle systems (confetti, sparkle, snow, pyro)
  - Physics: gravity, velocity, life time
  - Triggered on/off

### 3. Cue Management
- **Cue List** — Browse all cues
- **Cue Editor** — Edit cue name, pre-wait time
- **Action Editor** — Add/remove/edit actions
  - Select: element, property, value, fade time
  - Supports all element properties
- **GO Button** — Execute next cue with fade interpolation
- **Transport Controls** — GO, STOP, RESET

### 4. Script-to-Stage Pipeline
- Paste script
- Auto-detect cues from timestamps, keywords, scene markers
- Generate initial staging using templates
- User review and edit in 3D
- Export for AI video generation

### 5. Templates System
- Pre-built lighting looks for each scene type
- Pre-built actor arrangements for formations
- Mix-and-match or fully custom
- Easy to extend

### 6. Export
- **AI Video Brief** — Markdown storyboard for AI generation
- **JSON** — Full cue data for import into other tools

---

## 🚀 How to Use

### Setup
```bash
cd motion-lab
python3 -m http.server 8080
# Open http://localhost:8080 in browser
```

### Basic Workflow
1. **Click "🎬 ワークフロー"** in toolbar
2. **Paste Script** into Step 1 textarea (or load sample)
3. **Click "スクリプトを解析"** to detect cues
4. **Review detected cues** in Step 2
5. **Click "ステージング案を生成"** to create draft
6. **Click "ドラフトを作成"** to apply to 3D scene
7. **Review in 3D** (center panel)
8. **Manually edit** cues via right panel
9. **Play preview** with ▶ button
10. **Export** as JSON or Video Brief in Step 6

### Manual Editing
- **Add elements:** Click buttons in toolbar (👤 人物, 💡 照明, etc.)
- **Select elements:** Click in 3D viewport
- **Move elements:** Edit X/Z in inspector (right panel)
- **Adjust properties:** All properties editable via inspector
- **Delete:** Select + 🗑 削除 button
- **Edit cues:** Click in cue list, modify name/wait/actions in right panel

---

## 🎭 Sample Script

Included: **Hero Show** (3:20 duration)
- Opening (calm light, protagonist alone)
- Dialogue (emotional moment)
- Villain entrance (intense red light, lasers)
- Battle sequence (multicolor combat lighting)
- Special attack (full intensity, maximum effects)
- Victory (cool-down lighting)
- Ending (curtain call, lights out)

---

## 🔧 Architecture

```
┌─────────────────────────────────────────────┐
│           Three.js 3D Scene                 │
│  (StageScene: camera, controls, renderer)   │
└──────────────────────┬──────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
   Stage          Elements         Cue Engine
   Geometry    (Person, Light,      Playback
   (floor,     Screen, Laser,     (GO/STOP)
    truss,     SpecialFX)
    walls)
                                      │
       ┌───────────────┬──────────────┤
       ▼               ▼              ▼
      UI          Templates       Pipeline
   (Inspector,   (Lighting,      (Script Parse,
    CueList,     Actor)          Generate,
    Element      Arrangements    Export)
    List)
```

---

## 📊 Property Reference

### Person
- Position: x, y, z
- Color: RGB hex
- Visible: boolean

### Light (SpotLight)
- Position: x, y (grid), z
- Active: boolean
- Color: RGB hex
- Intensity: 0-12
- Angle: 5-80 degrees
- Target: x, z (where it points)

### Screen
- Position: x, y, z
- Active: boolean
- Color: RGB hex
- Width, Height: meters

### Laser
- Position: x, y, z
- Active: boolean
- Color: RGB hex
- Fan Angle: 0-130 degrees
- Beam Count: 1-24
- Rotation Y: -180 to 180 degrees

### SpecialFX
- Position: x, z
- Active: boolean
- Color: RGB hex
- Type: confetti, sparkle, pyro, snow

---

## 🎯 Next Steps / Future Enhancements

1. **Audio sync** — Cue timing from audio file duration
2. **Video playback** — Show video content on screens
3. **More templates** — Genre-specific lighting/blocking sets
4. **Undo/redo** — Full transaction history
5. **Multi-user** — Real-time collaboration
6. **AI refinement** — Fine-tune generated cues with ML feedback
7. **Motion capture** — Import actor movement data
8. **Camera paths** — Pre-programmed camera movements
9. **Rendering** — Export as video via headless Three.js
10. **Mobile interface** — Touch-optimized tablet interface

---

## 📝 License & Credits

- Three.js (r160) — MIT
- Stage Lab — Custom implementation for stage production pre-visualization

**Author:** Claude (Anthropic)  
**Version:** 1.0  
**Date:** 2026-05-11

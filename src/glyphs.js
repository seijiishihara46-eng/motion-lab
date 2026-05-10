// Glyph system — one of seven Zyrko systems.
// Glyphs appear within the field as convergence pressure rises.
// The field withholds some intentionally; complete learnability is resisted.

const GLYPH_FORMS = [
  '⊹', '⋯', '∴', '⊿', '◈', '⌁', '⊕', '⋄', '∿', '⊶',
  '⌘', '⋰', '⊸', '⊙', '∾', '⌀', '⋮', '⊻', '∻', '⊣',
  '⊢', '⊥', '⊤', '⊦', '⊧', '⊨', '⊩', '⋀', '⋁', '⋆',
  '⋇', '⋈', '⊬', '⊭', '⊮', '⊯', '⋂', '⋃', '⊪', '⊫',
];

export class GlyphSystem {
  constructor(container, count = 22) {
    this.container = container;
    this.glyphs = [];
    this._spawn(count);
  }

  _spawn(count) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'glyph';
      el.textContent = GLYPH_FORMS[Math.floor(Math.random() * GLYPH_FORMS.length)];
      el.style.left = `${4 + Math.random() * 92}%`;
      el.style.top = `${4 + Math.random() * 92}%`;
      el.style.setProperty('--glyph-opacity', String((0.18 + Math.random() * 0.32).toFixed(2)));
      this.container.appendChild(el);
      this.glyphs.push({
        el,
        revealThreshold: 0.25 + Math.random() * 0.55,
        withholdBias: Math.random(),
      });
    }
  }

  update(coherence, convergencePressure) {
    for (const g of this.glyphs) {
      const shouldReveal = convergencePressure > g.revealThreshold;
      // Field resists full learnability: low-coherence glyphs may be withheld
      const withheld = coherence < 0.3 && g.withholdBias > 0.55;

      if (withheld) {
        g.el.classList.add('glyph--withheld');
        g.el.classList.remove('glyph--visible');
      } else if (shouldReveal) {
        g.el.classList.add('glyph--visible');
        g.el.classList.remove('glyph--withheld');
      } else {
        g.el.classList.remove('glyph--visible', 'glyph--withheld');
      }
    }
  }
}

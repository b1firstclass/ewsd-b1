## Contribution Card — Banner Footer Enhancement

### Current State

The card has: status stripe (top) → status badge + date → title → description → footer (edited date + action icons). Between the footer text and the bottom border, there is empty space — this is the opportunity zone.

### Recommended Approach: **Banner Strip in Footer Zone**

Rather than a transparent background overlay (which risks hurting text readability), place a **slim decorative banner image strip** between the footer content and the card bottom edge. This keeps text crisp while adding visual warmth.

```text
┌──────────────────────────────┐
│ ▓▓▓▓▓▓ status stripe ▓▓▓▓▓▓ │  ← 4px colored bar
│ ● SUBMITTED          Today   │
│                              │
│ Digital Transformation...    │  ← title + description
│ This research examines...    │
│                              │
│ Edited Today           👁    │  ← footer actions
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄│
│ ░░░░░ banner image strip ░░░ │  ← NEW: 40px tall, object-cover
│ ░░░░░ with gradient fade ░░░ │     fades from transparent → image
└──────────────────────────────┘
```

### Design Details

1. **Banner strip placement** — A `40px` tall image section at the card bottom, below the footer border. Uses `object-cover` + `object-bottom` for cinematic crop. A subtle top gradient overlay fades from card background → transparent so it blends smoothly.
2. **Randomized per card** — Use `contribution.id` to deterministically pick one of the 4 banners (`banner1.jpg` through `banner4.jpg`). This gives visual variety without randomness on re-render. Simple hash: `id.charCodeAt(0) % 4`.
3. **Low opacity approach** — The banner strip renders at `opacity-30` to `opacity-40`, keeping it decorative rather than dominant. On hover, it subtly increases to `opacity-50` for a living feel.
4. **No text overlap** — Unlike a full transparent background, this approach keeps all text on a clean `bg-card` surface. The banner is purely decorative in a dedicated zone.

### Alternative Considered (and why not)

- **Full card transparent background**: Risks readability issues with serif headings over complex images. Would need heavy overlay which defeats the purpose.
- **Verdict**: Footer strip is cleaner, more magazine-editorial, and safer.

### Technical Scope


| File                   | Change                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `ContributionCard.tsx` | Import `banner1-4.jpg`, add banner strip div after footer, deterministic selection via contribution ID |


Single file change, no new dependencies, uses existing banner assets.  
  
We should not have seperate  NEW: 40px tall, object-cover fades from transparent → image below footer actions because it will become taller card design and break card design UI.  
instead of having a new section for image under footer actions of card, i recommend you to use footer action to use as banner image  for cinematic crop. current footer action's Edited Today indicator should be next to Today indicator at the top of card and view details icon appear only when hover should be clickable to the card itself as well.
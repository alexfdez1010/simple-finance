---
name: Simple Finance
description: A precise personal portfolio with room to see the whole picture.
colors:
  perspective-blue: '#0066e5'
  gain: '#157b47'
  loss: '#ca3645'
  aluminum: '#f5f5f7'
  white: '#ffffff'
  graphite: '#1d1d1f'
  muted: '#666b76'
  secondary: '#f0f1f5'
  tertiary: '#e7eaf0'
  default: '#edeef2'
  border: '#e6e8ed'
  field-border: '#d8dbe3'
  field-placeholder: '#666b76'
  selection: '#d4e6ff'
  balance: '#20242d'
  balance-light: '#354664'
  chart-1: '#2375ee'
  chart-2: '#798fed'
  chart-3: '#d3a34b'
  chart-4: '#44a79b'
  chart-5: '#a6adbf'
typography:
  display:
    fontFamily: 'Geist, sans-serif'
    fontSize: 'clamp(2rem, 3.5vw, 3.25rem)'
    fontWeight: 500
    lineHeight: '1.25'
    letterSpacing: '-0.035em'
  headline:
    fontFamily: 'Geist, sans-serif'
    fontSize: '28px'
    fontWeight: 600
    lineHeight: '1.25'
    letterSpacing: '-0.035em'
  headline-wide:
    fontFamily: 'Geist, sans-serif'
    fontSize: '34px'
    fontWeight: 600
    lineHeight: '1.25'
    letterSpacing: '-0.035em'
  title:
    fontFamily: 'Geist, sans-serif'
    fontSize: '15px'
    fontWeight: 600
    letterSpacing: '-0.02em'
  body:
    fontFamily: 'Geist, sans-serif'
    fontSize: '0.875rem'
    lineHeight: '1.625'
  label:
    fontFamily: 'Geist, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: '1rem'
  metadata:
    fontFamily: 'Geist Mono, monospace'
    fontSize: '0.625rem'
    fontWeight: 500
    lineHeight: '1.25rem'
    letterSpacing: '0.025em'
rounded:
  surface: '1rem'
  control: '0.75rem'
  field: '0.75rem'
  input: '0.75rem'
  chip: '1rem'
spacing:
  control-gap: '0.5rem'
  card-gap: '1.25rem'
  compact-padding: '1.25rem'
  wide-padding: '1.5rem'
  workspace-gap: '2rem'
components:
  button-primary:
    backgroundColor: '{colors.perspective-blue}'
    textColor: '{colors.white}'
    rounded: '{rounded.control}'
    padding: '0 1rem'
    typography: '{typography.body}'
  button-outline:
    backgroundColor: 'transparent'
    textColor: '{colors.graphite}'
    rounded: '{rounded.control}'
    padding: '0 1rem'
  input:
    backgroundColor: '{colors.default}'
    textColor: '{colors.graphite}'
    rounded: '{rounded.input}'
    height: '2.5rem'
    padding: '0.5rem 0.75rem'
  navigation-active:
    textColor: '{colors.perspective-blue}'
    rounded: '{rounded.control}'
  card:
    backgroundColor: '{colors.white}'
    textColor: '{colors.graphite}'
    rounded: '{rounded.surface}'
    padding: '1.25rem'
  balance-panel:
    backgroundColor: '{colors.balance}'
    textColor: '{colors.white}'
    rounded: '{rounded.surface}'
    padding: '1.5rem'
  metadata-chip:
    backgroundColor: '{colors.default}'
    textColor: '{colors.graphite}'
    rounded: '{rounded.chip}'
    typography: '{typography.metadata}'
---

# Design System: Simple Finance

Token format: [DESIGN.md specification](https://raw.githubusercontent.com/google-labs-code/design.md/main/docs/spec.md).

## Overview

**Creative North Star: "Precision, in perspective"**

The interface gives a personal portfolio a clear center of gravity. Aluminum ground, white surfaces, graphite type, and precise blue controls frame the information; the dark balance panel makes the present valuation immediately recognizable. Generous spacing and a deliberate type hierarchy give financial detail room to be read.

The user authorized a complete visual and interaction redesign using the agent's judgment, with polished motion and review of the running application. This direction replaces the earlier forest notebook system. Existing financial meanings, English copy, portfolio capabilities, and independently loaded workspaces remain product constraints. The implementation uses CSS and the existing component adapters without adding dependencies or decorative raster assets.

**Key Characteristics:**

- A prominent balance, then comparable supporting figures and detailed evidence.
- Softly elevated white surfaces on an aluminum ground.
- Geist typography, tabular financial figures, and explicit units.
- Persistent desktop wayfinding and a safe-area-aware mobile dock.
- Short, bounded motion with complete reduced-motion behavior.

## Colors

Cool, nearly neutral surfaces give the blue interaction accent and categorical chart palette clear roles.

### Primary

- **Perspective Blue:** primary actions, selected routes, focus, links, and restrained icon backgrounds.
- **Gain / Loss:** signed financial results, always supported by a sign, label, or explicit state.

### Secondary

- **Chart 1–5:** blue, periwinkle, gold, teal, and cool gray identify series. Category allocation maps these to stocks, bonds/loans, commodities, real estate, and cash respectively.

### Neutral

- **Aluminum / White:** page ground and opaque content surfaces.
- **Graphite / Muted:** principal reading hierarchy and supporting explanations.
- **Secondary / Tertiary / Default:** grouped controls, supporting areas, and interaction fills.
- **Border / Field Border / Field Placeholder:** quiet separators, field strokes, and hints.
- **Balance / Balance Light:** the signature dark valuation panel and its restrained radial light.
- **Selection:** browser text selection, keeping graphite text legible over a pale blue highlight.

**The Meaningful Color Rule.** Keep interaction, series identity, and financial outcome separate; never use color as the only explanation of a value.

Sidecar tonal ramps are inspection aids; the frontmatter lists the shipped colors.

## Typography

**Display and Body Font:** Geist, with sans-serif fallback. The legacy serif alias also resolves to Geist.
**Metadata Font:** Geist Mono, with monospace fallback, for existing compact badges, contribution amounts, shared tooltip values, and technical content.

### Hierarchy

- **Display:** the principal balance uses the responsive display token; subordinate overview figures use a compact 22px size.
- **Headline:** workspace titles grow from the compact to the wide token at the small breakpoint; descriptions use a prose-width container.
- **Title:** card headings and section identity, with close tracking and semibold weight.
- **Body:** explanations and form content; heading descriptions use 13px before 14px on wider screens.
- **Label:** comparable summary labels, dates, and supporting text. Dense explanations may use 11px.
- **Metadata:** small, existing monospace identifiers rather than a competing display hierarchy.

The implemented hierarchy also uses 10–18px for compact navigation, identity, controls, and supporting copy; 20–30px for subordinate values; and 36px/48px for the desktop authentication statement. These are observed roles, not a requirement to use every step on each screen.

**The Clear Titles Rule.** Titles and subtitles have no final full stops or decorative dot separators, and brand compositions have no decorative dots. Keep functional chart/category markers and original user-supplied instrument names and symbols intact.

**The Comparable Figures Rule.** Use tabular numerals, explicit currency units, and stable alignment. Large values may wrap; mobile preview amounts may use compact notation.

## Layout

At the large breakpoint (1024px), a fixed white rail occupies 240px and content uses the same left offset. The centered content container has a 1480px maximum. Horizontal gutters step from 16px to 32px to 48px; vertical workspace insets step from 28px to 40px to 48px. Workspace gaps grow from 24px to 32px, and ordinary card grids use 20px gaps.

Below that breakpoint, the identity remains at the top while four navigation destinations form a fixed bottom dock inset 12px horizontally. Its bottom inset is the larger of 12px and the safe-area bottom. The main region reserves 104px plus the safe-area bottom so the dock cannot cover the last content. Touch destinations remain at least 48px high; page actions and analytics destinations use a 44px minimum.

Cards use 20px insets before 24px at the small breakpoint. The balance panel uses 24px before 32px. The home summary and chart proportions belong to its surface brief; future pages should follow the same spacing and shrinking-width discipline without copying its composition. Dense history regions may scroll inside their own labelled container.

## Elevation & Depth

White cards use a low, diffuse surface shadow; interactive holding cards rise slightly on hover-capable pointers. The dark balance panel uses a restrained radial light. The mobile dock alone adds translucency and backdrop blur; reduced-transparency preferences replace it with an opaque surface. Dialogs retain a stronger overlay shadow and dimming backdrop.

### Shadow Vocabulary

- **Surface:** `0 4px 24px rgb(25 36 60 / 0.035)` separates content from the ground.
- **Hover:** `0 12px 36px rgb(25 36 60 / 0.08)` accompanies the 3px lift on interactive cards.
- **Dock:** `0 8px 40px rgb(25 36 60 / 0.12)` separates the floating mobile navigation.
- **Overlay:** `0 24px 80px rgb(21 30 50 / 0.18)` identifies modal content.

**The Earned Depth Rule.** Apply depth to communicate a container or interaction level, with stronger elevation reserved for floating navigation and overlays.

## Shapes

Financial cards and the dock share gently curved surface corners; buttons, selected routes, icon tiles, and segmented controls share the tighter control corner. Keep the HeroUI base radius aligned with those frontmatter values: its extra-large radius is 1.5 times the base and its double-extra-large radius is twice the base. Native fields and the shared adapted input use the field/control radius. Metadata chips and outcome pills retain their rounded silhouette. Avoid introducing a second unrelated corner scale.

## Components

### Buttons

Primary actions use Perspective Blue and white. Outline and ghost variants retain graphite and quiet neutral hover fills; destructive actions use the loss/danger role. Existing HeroUI adapters preserve pending, disabled, and keyboard contracts. Shared buttons press to 98% scale; route actions keep a 44px minimum and authentication controls use 48px. Focus is a visible two-pixel blue outline with a three-pixel offset.

### Chips

Small monospace chips identify metadata. Outcome pills use a signed percentage with an icon and separate gain/loss treatments; they do not replace the underlying explanation. Neutral chips use the default fill, and outlined chips remain transparent.

### Cards / Containers

Opaque white surfaces use the shared surface radius and low shadow without a default border. Headers and bodies share responsive insets. Borders remain useful inside tables, projection bands, and grouped data. Grid children allow shrinking, and large values can wrap.

### Inputs / Fields

The shared adapted input remains a 40px-high secondary HeroUI field with tabular numerals. Authentication fields are 48px high with the control radius. HeroUI supplies hover, invalid, disabled, and pending states; labels remain explicit and failures remain recoverable. The field border is quiet at rest and focus stays visible.

### Navigation

Desktop links combine an icon and label, with selection conveyed by the fill and icon weight; the mobile dock stacks icons and labels in four equal columns. Current routes use an eight-percent blue fill and expose `aria-current`. Analytics uses a neutral segmented group with a white selected item. All navigation uses real links and preserves independent route loading.

### Balance and Charts

The dark balance panel anchors the overview; supporting capital, return, latest change, and forecast remain separate readable figures. Missing snapshot history displays an em dash and an explanation. The evolution area uses the first chart color and a unique gradient ID per instance. Its controls select observations, labelled “pts”. The category ring is accompanied by every category's value and percentage; signed or zero totals omit the ring and explain unavailable percentages.

### Motion and Dialogs

Workspace headings enter in 420ms; content enters in 560ms with bounded 45–120ms delays. Lists settle in 480ms with delays capped at 105ms. The balance light sweeps once in 1100ms; chart containers reveal once in 750ms. Currency values settle in 260ms, selected icons in 340ms, and authentication geometry in 900ms. The common easing is `cubic-bezier(0.16, 1, 0.3, 1)`; short color feedback uses ease. Recharts mark animation remains disabled so hydration and reduced motion cannot leave empty chart marks.

The global reduced-motion override suppresses animations and transitions, removes hover lifts, and exposes chart containers without clipping. Content-entry effects do not loop. Lazy management dialogs remember their opener, restore it on close, and fall back to the main workspace if deletion removed that control. Pending or failed writes keep dialog focus.

## Do's and Don'ts

### Do:

- **Do** use the shared aluminum, white, graphite, and blue hierarchy.
- **Do** preserve real financial values, explicit units, signs, and unavailable-data states.
- **Do** keep route navigation visible and reserve space for the mobile dock.
- **Do** keep titles and subtitles free of final full stops and decorative dot separators, and omit decorative dots from brands.
- **Do** retain visible focus, focus restoration, and reduced-motion and reduced-transparency behavior.
- **Do** keep animations short, bounded, and independent of chart mark rendering.

### Don't:

- **Don't** add fabricated portfolio values or illustrative chart histories to production.
- **Don't** use color alone to communicate financial outcomes or chart categories.
- **Don't** apply dock translucency to ordinary financial cards.
- **Don't** let motion delay interaction or conceal chart marks after hydration.
- **Don't** promote the home chart arrangement into a rule for every workspace.

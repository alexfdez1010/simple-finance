---
name: Simple Finance
description: A private investment notebook for portfolio review.
colors:
  forest: '#245c48'
  gain: '#246647'
  loss: '#b33d43'
  mist: '#f5f6f3'
  white: '#ffffff'
  graphite: '#202b28'
  muted: '#59665e'
  secondary: '#edf0eb'
  tertiary: '#e3e9e1'
  default: '#e4e9e1'
  border: '#dce2d8'
  field-border: '#cbd3c8'
  field-placeholder: '#647168'
  chart-1: '#39765d'
  chart-2: '#617dab'
  chart-3: '#a77d34'
  chart-4: '#7d739c'
  chart-5: '#a55f69'
typography:
  headline:
    fontFamily: 'Geist, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: '2rem'
    letterSpacing: '-0.025em'
  headline-wide:
    fontFamily: 'Geist, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 600
    lineHeight: '2.25rem'
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Geist, sans-serif'
    fontSize: '1rem'
    fontWeight: 600
    lineHeight: '1.5rem'
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
  surface: '0.75rem'
  button: '1.125rem'
  field: '0.5rem'
  navigation: '0.75rem'
  input: '0.5625rem'
  chip: '1.5rem'
spacing:
  control-gap: '0.5rem'
  content-gap: '1.25rem'
  compact-padding: '1.25rem'
  wide-padding: '1.5rem'
components:
  button-primary:
    backgroundColor: '{colors.forest}'
    textColor: '{colors.white}'
    rounded: '{rounded.button}'
    padding: '0 1rem'
    typography: '{typography.body}'
  button-outline:
    backgroundColor: 'transparent'
    textColor: '{colors.graphite}'
    rounded: '{rounded.button}'
    padding: '0 1rem'
  input:
    backgroundColor: '{colors.default}'
    textColor: '{colors.graphite}'
    rounded: '{rounded.input}'
    height: '2.5rem'
    padding: '0.5rem 0.75rem'
  navigation-active:
    textColor: '{colors.forest}'
    rounded: '{rounded.navigation}'
  card:
    backgroundColor: '{colors.white}'
    textColor: '{colors.graphite}'
    rounded: '{rounded.surface}'
    padding: '1.25rem'
  metadata-chip:
    backgroundColor: '{colors.default}'
    textColor: '{colors.graphite}'
    rounded: '{rounded.chip}'
    typography: '{typography.metadata}'
---

# Design System: Simple Finance

Token format: [DESIGN.md specification](https://raw.githubusercontent.com/google-labs-code/design.md/main/docs/spec.md).

## Overview

**Creative North Star: "The Investor Research Notebook"**

The interface organizes a private portfolio with calm surfaces, comparable figures, and persistent wayfinding. Mist ground and white containers keep dense financial information legible; forest identifies actions and selection while graphite carries the reading hierarchy.

The user confirmed a personal tool and its four workspaces, then requested code-led implementation and review. The notebook metaphor was inferred during that redesign rather than selected through a visual workshop. The notebook means disciplined alignment and focused workspaces, without stationery textures. These rules describe the implemented system; individual page compositions remain in the surface brief.

**Key Characteristics:**

- Opaque surfaces and quiet borders.
- One sans family for the main hierarchy and tabular financial figures.
- Focused routes with persistent desktop navigation and an unobscured mobile strip.
- Explicit data states and a separate visual language for gains and losses.

## Colors

A muted botanical neutral palette supports portfolio review without competing with charts.

### Primary

- **Forest:** primary actions, active navigation, focus, and link emphasis.
- **Gain / Loss:** signed financial outcomes; retain signs and labels alongside color.

### Secondary

- **Chart 1–5:** a recurring categorical sequence of green, blue, ochre, violet, and rose. Chart colors identify series rather than interaction state.

### Neutral

- **Mist / White:** page ground and opaque card or overlay surfaces.
- **Graphite / Muted:** primary reading and explanatory text.
- **Secondary / Tertiary / Default:** rail, projection bands, selection, and compact control fills.
- **Border / Field Border / Field Placeholder:** separators, control strokes, and hints.

**The Meaningful Color Rule.** Reserve gain and loss for financial meaning; chart series and selected navigation have their own roles.

## Typography

**Display and Body Font:** Geist, with sans-serif fallback. The legacy serif alias also resolves to Geist.
**Metadata Font:** Geist Mono, with monospace fallback, used by compact badges, contribution amounts, shared tooltip values, and technical material.

### Hierarchy

- **Headline:** compact workspace titles; the wide variant starts at the small breakpoint.
- **Title:** card headings and product identity.
- **Body:** explanations and controls; workspace descriptions use a prose-width container.
- **Label:** summary labels, dates, and supporting details.
- **Metadata:** small symbol/category badges, an incumbent exception to the main sans hierarchy.

**The Comparable Figures Rule.** Financial values use tabular numerals. Summary values share one baseline and use a compact responsive size rather than oversized display typography.

## Layout

The dashboard has a fixed desktop rail at the large breakpoint (224px) with an equal content offset. Below it, identity and four main links stay in normal document flow above the workspace. Main content is centered within a 1440px maximum; horizontal gutters step from 16px to 28px to 40px. Page actions wrap beside or beneath the heading.

Shared content gaps are 20px; card headers and bodies use 20px inset padding, with selected summary blocks increasing to 24px. The summary uses two columns before four at the extra-large breakpoint. Chart columns use shrinking minimum widths; dense visualizations can scroll within their own labelled region. These route-specific compositions are examples, not compulsory layouts for every future page.

## Elevation & Depth

Ordinary cards and fields are flat. White, secondary fills, and one-pixel borders supply separation. Floating overlays use the project's diffuse overlay shadow; chart tooltips retain a small library shadow. Focus is an outline, not decorative illumination. Global reduced-motion preferences suppress animation and transition durations.

**The Flat Surface Rule.** Use tonal separation and borders for workspace containers; reserve elevation for floating content.

## Shapes

Shared corners are controlled by the HeroUI radius scale and the local base radius. The emitted large, extra-large, and medium radii are recorded in frontmatter, rather than assuming Tailwind's unmodified defaults. Cards and route links use the restrained surface/navigation radius. Shared button adapters retain the larger button radius; compact adapted inputs use the input radius, while native fields use the field radius. Badges retain the more rounded chip silhouette.

## Components

### Buttons

Primary actions use forest and white; outline and ghost variants preserve graphite and quiet strokes or transparent fills. Shared adapters delegate hover, disabled, and pending states to HeroUI. Standard buttons are 40px high before 36px at the medium breakpoint; explicit route actions use a 44px minimum. Pressing a shared button scales it slightly. Keyboard focus uses a visible forest outline.

### Chips

Small monospace badges identify metadata. Default chips use the default neutral fill; outlined badges are transparent. Destructive metadata delegates its soft treatment to HeroUI. Badge typography is an observed incumbent pattern, not a new display hierarchy.

### Cards / Containers

White, opaque, one-pixel-bordered containers use no resting shadow. Headers have 20px padding with a 12px bottom inset; bodies have 20px horizontal and bottom padding. Grid children allow shrinking to prevent viewport overflow.

### Inputs / Fields

Shared inputs are full-width secondary HeroUI fields with a 40px height, quiet border, tabular numerals, and the input corner scale. HeroUI supplies hover, invalid, and disabled states. All interactive controls retain visible keyboard focus; labels remain available to assistive technology.

### Navigation

Desktop links pair icons and text; mobile links stack those elements in four equal columns. Active links use forest over a ten-percent forest fill and expose current-page state. Hover uses the default neutral fill. Analytics uses a separate four-link row with the same selection vocabulary.

### Ledger Summary

Comparable labels, values, and explanations share one card. A bordered secondary-fill projection band belongs to the same surface. Unavailable historical changes show an em dash and an explanatory state rather than a fabricated zero.

## Do's and Don'ts

### Do:

- **Do** use opaque white surfaces, quiet borders, and the shared corner scale.
- **Do** preserve tabular figures, explicit units, and meaningful gain/loss signs.
- **Do** keep navigation visible and allow controls and long values to wrap on small screens.
- **Do** retain visible keyboard focus and respect reduced-motion preferences.

### Don't:

- **Don't** substitute decorative transparency or ambient card shadows for the established flat surfaces.
- **Don't** use color alone to explain a financial state.
- **Don't** promote page-specific chart arrangements into a universal layout requirement.

Observed caveats: the larger shared-button and adapted-input corners remain incumbent variants, not reasons to enlarge future workspace cards. Tonal ramps in the sidecar are generated inspection aids, not additional shipped colors. The notebook metaphor remains an inferred visual direction.

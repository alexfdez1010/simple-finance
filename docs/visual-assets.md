# Visual assets

## Portfolio folio

`public/images/portfolio-folio.webp` is an original decorative illustration generated with the built-in ImageGen tool for Simple Finance. It depicts a physical organizer, not portfolio data, a fabricated product screenshot, or a company logo.

The image uses the existing graphite, aluminum, and cobalt visual language. It has a true alpha channel and a 960 × 960 canvas. The original PNG remains in the local ImageGen output; the project owns a WebP encoding with no external runtime dependency.

### Component usage

`PortfolioArtwork` from `@/components/visuals/portfolio-artwork` reserves a square aspect ratio and uses Next Image for responsive delivery. Its default variant is a compact 160px empty-state illustration. Use `<PortfolioArtwork />` beside first-holding guidance, or `<PortfolioArtwork variant="hero" />` for the larger auth composition. Optional `className` controls placement. The illustration is decorative and has an empty alternative text; keep all useful guidance and actions in semantic HTML beside it.

The hero entrance runs once on mount for 780ms and respects `prefers-reduced-motion`. The compact variant stays still. No financial value or control waits for this animation. Import `src/app/styles/illustrations.css` through the application stylesheet.

### Generation prompt

```text
Use case: stylized-concept
Asset type: original decorative brand illustration for a private investment portfolio web app, used at 450px on a dark login screen and 160px on white empty states
Create a compact, sculptural open portfolio folio holding three staggered unmarked investment cards, a recognizable physical organizer rather than a digital interface. Graphite satin exterior, fine brushed aluminum inner surfaces, one restrained cobalt-blue card edge. Quiet, precise industrial design and tactile editorial still-life rendering. Three-quarter view from slightly above, front open enough to read the layered cards. Cohesive grounded geometry, rounded fine edges, subtle contact shadow, soft studio side light. The whole object centered and fully visible with generous transparent margin, square composition, no cropping.
Background must be truly transparent with alpha. No lettering, no numbers, no UI, no logo, no watermark, no coins, no cash, no glowing orbs, no floating extraneous objects. Keep the entire object self-contained and legible at small sizes.
```

## Holding identities

`HoldingIdentity` keeps the existing focused `category` contract and Phosphor duotone icons. Shape identifies the asset class, and category-specific tones follow the allocation-chart palette. The icons are decorative because the holding name and category remain visible in HTML.

## Sources

Implementation follows [Next Image](https://nextjs.org/docs/app/api-reference/components/image) and the [Phosphor React API](https://github.com/phosphor-icons/react). No icon library or animation dependency was added.

import { ChartLineUp } from '@phosphor-icons/react';
import { PortfolioArtwork } from '@/components/visuals/portfolio-artwork';

/**
 * Composes the desktop password screen around the owned physical-folio artwork.
 * @returns Brand identity and decorative imagery, hidden below the desktop breakpoint.
 * Pure presentation; the artwork has no data meaning or interactive behavior.
 */
export function AuthBrand() {
  return (
    <aside className="relative hidden min-h-dvh overflow-hidden bg-[#1d1d1f] px-12 py-12 text-white lg:flex lg:flex-col xl:px-16">
      <div className="relative z-10 flex items-center gap-3 text-base font-medium tracking-tight">
        <span className="flex size-10 items-center justify-center rounded-xl bg-white/10">
          <ChartLineUp aria-hidden size={23} weight="duotone" />
        </span>
        Simple Finance
      </div>
      <div
        className="relative flex min-h-72 flex-1 items-center justify-center"
        aria-hidden
      >
        <PortfolioArtwork
          variant="hero"
          className="-my-6 max-w-[400px] xl:max-w-[460px]"
        />
      </div>
      <div className="relative z-10 max-w-md pb-8">
        <p className="text-4xl font-medium leading-[1.12] tracking-[-0.035em] xl:text-5xl">
          Your wealth
          <br />A clearer perspective
        </p>
        <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
          Every investment, contribution, and moment of progress, together in
          one personal space
        </p>
      </div>
      <p className="relative z-10 text-xs text-white/55">
        Your private portfolio
      </p>
    </aside>
  );
}

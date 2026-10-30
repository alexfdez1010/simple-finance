import { ChartLineUp } from '@phosphor-icons/react';

/**
 * Gives the desktop password screen its own restrained brand composition.
 * @returns Brand symbol and truthful product context, hidden on mobile.
 * Pure presentation; the symbol has no data meaning and no interactive behavior.
 */
export function AuthBrand() {
  return (
    <aside className="relative hidden min-h-dvh overflow-hidden bg-[#1d1d1f] px-12 py-12 text-white lg:flex lg:flex-col xl:px-16">
      <div className="relative z-10 flex items-center gap-3 text-base font-medium tracking-tight">
        <span className="flex size-10 items-center justify-center rounded-xl bg-white/10">
          <ChartLineUp aria-hidden size={23} />
        </span>
        Simple Finance
      </div>
      <div
        className="relative flex min-h-72 flex-1 items-center justify-center"
        aria-hidden
      >
        <div className="auth-orbit relative flex size-64 items-center justify-center rounded-full xl:size-80">
          <span className="flex size-20 items-center justify-center rounded-[1.25rem] bg-white/10">
            <ChartLineUp size={40} weight="light" />
          </span>
        </div>
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

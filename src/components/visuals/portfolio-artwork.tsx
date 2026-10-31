import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PortfolioArtworkProps {
  variant?: 'hero' | 'empty';
  className?: string;
}

/**
 * Presents the owned folio illustration without implying portfolio data.
 * @param props - Hero or compact empty-state treatment and optional layout classes.
 * @returns A decorative, responsive image with a reserved square footprint.
 * Has no side effects; its CSS entrance is omitted with reduced motion.
 */
export function PortfolioArtwork({
  variant = 'empty',
  className,
}: PortfolioArtworkProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'relative aspect-square shrink-0',
        variant === 'hero'
          ? 'portfolio-artwork-hero w-full max-w-[460px]'
          : 'w-40',
        className,
      )}
    >
      <Image
        alt=""
        src="/images/portfolio-folio.webp"
        fill
        sizes={variant === 'hero' ? '(min-width: 1280px) 460px, 40vw' : '160px'}
        className="object-contain"
      />
    </div>
  );
}

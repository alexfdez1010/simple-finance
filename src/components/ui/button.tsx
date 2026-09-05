'use client';

import {
  Button as HeroButton,
  type ButtonProps as HeroButtonProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

type ButtonVariant =
  'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize =
  'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';

interface ButtonProps extends Omit<
  HeroButtonProps,
  'children' | 'className' | 'isDisabled' | 'isIconOnly' | 'size' | 'variant'
> {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variantMap: Record<ButtonVariant, HeroButtonProps['variant']> = {
  default: 'primary',
  destructive: 'danger',
  outline: 'outline',
  secondary: 'secondary',
  ghost: 'ghost',
  link: 'tertiary',
};

const sizeMap: Record<ButtonSize, HeroButtonProps['size']> = {
  default: 'md',
  xs: 'sm',
  sm: 'sm',
  lg: 'lg',
  icon: 'md',
  'icon-xs': 'sm',
  'icon-sm': 'sm',
  'icon-lg': 'lg',
};

/**
 * Renders the shared HeroUI button while preserving domain-facing variants.
 *
 * @param props - HeroUI button props plus semantic size and variant names.
 * @returns An accessible HeroUI button using the finance design system.
 */
function Button({
  className,
  disabled,
  size = 'default',
  variant = 'default',
  ...props
}: ButtonProps) {
  const isIconOnly = size.startsWith('icon');

  return (
    <HeroButton
      className={cn(
        'rounded-xl font-medium transition-transform active:scale-[0.98]',
        isIconOnly && 'min-h-8 min-w-8',
        size === 'xs' && 'min-h-7 px-2 text-xs',
        className,
      )}
      isDisabled={disabled}
      isIconOnly={isIconOnly}
      size={sizeMap[size]}
      variant={variantMap[variant]}
      {...props}
    />
  );
}

export { Button };
export type { ButtonProps };

/**
 * Small clipboard-copy button with transient "Copied" feedback.
 * @module components/ui/copy-button
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CopyButtonProps {
  value: string;
  label?: string;
}

/**
 * Button that writes `value` to the clipboard and briefly shows "Copied".
 *
 * @param value - String to copy
 * @param label - Optional button label (default "Copy")
 */
export function CopyButton({ value, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked — silently ignore */
        }
      }}
    >
      {copied ? 'Copied' : label}
    </Button>
  );
}

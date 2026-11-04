'use client';

import { Checkbox, Description, Label } from '@heroui/react';

/** Controlled HeroUI reinvestment choice shared by creation and editing forms. */
export function ReinvestInterestField({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Checkbox isSelected={checked} onChange={onChange} className="gap-1.5">
      <Checkbox.Content className="items-center gap-2">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Label className="text-xs">Reinvest interest</Label>
      </Checkbox.Content>
      <Description className="text-xs text-muted-foreground">
        {checked
          ? 'Interest earns interest.'
          : 'Interest is calculated only on contributed capital.'}
      </Description>
    </Checkbox>
  );
}

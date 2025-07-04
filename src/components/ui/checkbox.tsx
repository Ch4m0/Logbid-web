'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  id?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, id, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          id={id}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className={cn(
            'peer h-4 w-4 shrink-0 rounded border border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            'checked:bg-blue-600 checked:border-blue-600',
            className
          )}
          {...props}
        />
        {checked && (
          <Check className="absolute top-0 left-0 h-4 w-4 text-white pointer-events-none" />
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox } 
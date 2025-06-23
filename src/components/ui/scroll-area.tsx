'use client'

import * as React from 'react'
import { cn } from '@/src/lib/utils'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
ScrollArea.displayName = 'ScrollArea'

export { ScrollArea } 
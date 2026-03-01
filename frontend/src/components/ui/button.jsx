import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5',
        destructive: 'bg-red-500/20 text-red-400 border-2 border-red-500/50 hover:bg-red-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]',
        success: 'bg-green-500/20 text-green-400 border-2 border-green-500/50 hover:bg-green-500/40 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]',
        outline: 'border border-white/20 bg-white/5 text-white/70 backdrop-blur-sm hover:bg-white/10 hover:text-white',
        ghost: 'bg-white/10 text-white/70 backdrop-blur-sm hover:bg-white/20 hover:text-white',
        activeGhost: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        pill: 'h-9 px-5 rounded-full text-[13px]',
        icon: 'h-14 w-14 rounded-full',
        iconLg: 'h-16 w-16 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }

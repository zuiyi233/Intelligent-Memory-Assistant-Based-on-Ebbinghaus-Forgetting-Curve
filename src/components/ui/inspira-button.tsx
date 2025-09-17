import React from 'react'
import { cn } from '@/lib/utils'
import { buttonEffects } from '@/lib/inspira-ui'

export interface InspiraButtonProps {
  className?: string
  children: React.ReactNode
  variant?: 'default' | 'gradient' | 'ripple' | 'glow' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  colors?: string[]
  glowColor?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export const InspiraButton: React.FC<InspiraButtonProps> = ({
  className,
  children,
  variant = 'default',
  size = 'md',
  colors = ['var(--primary)', 'var(--accent)'],
  glowColor = 'var(--primary)',
  disabled = false,
  onClick,
  type = 'button'
}) => {
  const getButtonStyle = () => {
    const baseStyle = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
    
    const sizeStyles = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 py-2 text-sm',
      lg: 'h-10 px-8 text-base'
    }
    
    switch (variant) {
      case 'gradient':
        return cn(baseStyle, sizeStyles[size], buttonEffects.gradient(colors))
      case 'ripple':
        return cn(baseStyle, sizeStyles[size], buttonEffects.ripple)
      case 'glow':
        return cn(baseStyle, sizeStyles[size], buttonEffects.glowBorder(glowColor))
      case 'outline':
        return cn(baseStyle, sizeStyles[size], 'border border-gray-200 dark:border-gray-800 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800')
      default:
        return cn(baseStyle, sizeStyles[size], 'apple-card text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800')
    }
  }

  return (
    <button
      type={type}
      className={cn(
        getButtonStyle(),
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default InspiraButton
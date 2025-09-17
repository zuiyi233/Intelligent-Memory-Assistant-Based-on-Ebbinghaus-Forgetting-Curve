import React from 'react'
import { cn } from '@/lib/utils'
import { cardEffects } from '@/lib/inspira-ui'

export interface InspiraCardProps {
  className?: string
  children: React.ReactNode
  variant?: 'default' | 'glass' | 'shimmer' | 'hover' | '3d' | 'glow'
  glowColor?: string
  onClick?: () => void
}

export const InspiraCard: React.FC<InspiraCardProps> = ({
  className,
  children,
  variant = 'default',
  glowColor = 'rgba(59, 130, 246, 0.5)',
  onClick
}) => {
  const getCardStyle = () => {
    const baseStyle = 'relative overflow-hidden rounded-xl border'
    
    switch (variant) {
      case 'glass':
        return cn(baseStyle, cardEffects.glass)
      case 'shimmer':
        return cn(baseStyle, cardEffects.shimmer(true))
      case 'hover':
        return cn(baseStyle, cardEffects.hover)
      case '3d':
        return cn(baseStyle, cardEffects['3d'])
      case 'glow':
        return cn(baseStyle, cardEffects.glowBorder(glowColor))
      default:
        return cn(baseStyle, 'apple-card')
    }
  }

  return (
    <div 
      className={cn(
        getCardStyle(),
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
      {variant === 'shimmer' && (
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(100vw) rotate(45deg); }
          }
        `}</style>
      )}
    </div>
  )
}

export const InspiraCardHeader: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ className, children }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
    {children}
  </div>
)

export const InspiraCardTitle: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ className, children }) => (
  <h3 className={cn('font-semibold leading-none tracking-tight', className)}>
    {children}
  </h3>
)

export const InspiraCardDescription: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ className, children }) => (
  <p className={cn('text-sm text-muted-foreground', className)}>
    {children}
  </p>
)

export const InspiraCardContent: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ className, children }) => (
  <div className={cn('p-6 pt-0', className)}>
    {children}
  </div>
)

export const InspiraCardFooter: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ className, children }) => (
  <div className={cn('flex items-center p-6 pt-0', className)}>
    {children}
  </div>
)

export default InspiraCard
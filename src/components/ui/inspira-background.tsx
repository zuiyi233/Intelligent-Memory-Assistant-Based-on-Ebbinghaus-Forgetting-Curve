import React from 'react'
import { cn } from '@/lib/utils'
import { backgroundEffects } from '@/lib/inspira-ui'

export interface InspiraBackgroundProps {
  type?: 'gradient' | 'particles' | 'grid' | 'waves' | 'aurora'
  colors?: string[]
  className?: string
  children?: React.ReactNode
}

export const InspiraBackground: React.FC<InspiraBackgroundProps> = ({
  type = 'gradient',
  colors = ['var(--primary)', 'var(--accent)'],
  className,
  children
}) => {
  const getBackgroundStyle = () => {
    switch (type) {
      case 'gradient':
        return backgroundEffects.gradient(colors)
      case 'grid':
        return backgroundEffects.grid
      case 'waves':
        return backgroundEffects.waves(colors[0])
      case 'particles':
        return backgroundEffects.particles
      case 'aurora':
        return {
          background: `radial-gradient(ellipse at top, ${colors[0]}, transparent 50%),
                      radial-gradient(ellipse at bottom, ${colors[1] || colors[0]}, transparent 50%)`,
          backgroundSize: '100% 100%',
          animation: 'gradient-shift 15s ease infinite'
        }
      default:
        return backgroundEffects.gradient(colors)
    }
  }

  return (
    <div 
      className={cn(
        'fixed inset-0 -z-10',
        type === 'particles' && 'pointer-events-none',
        className
      )}
      style={getBackgroundStyle()}
    >
      {children}
      {type === 'particles' && (
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default InspiraBackground
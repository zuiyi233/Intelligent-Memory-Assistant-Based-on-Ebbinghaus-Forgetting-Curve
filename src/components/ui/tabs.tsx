'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  children: React.ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const TabsContext = React.createContext<{
  activeTab: string
  setActiveTab: (value: string) => void
}>({
  activeTab: "",
  setActiveTab: () => {},
})

const Tabs: React.FC<TabsProps> = ({
  children,
  defaultValue = "",
  value,
  onValueChange
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue)
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (value === undefined) {
      setActiveTab(newValue)
    }
    onValueChange?.(newValue)
  }, [value, onValueChange])
  
  const currentValue = value !== undefined ? value : activeTab
  
  return (
    <TabsContext.Provider value={{ activeTab: currentValue, setActiveTab: handleValueChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400",
      className
    )}
    {...props}
  />
)

const TabsTrigger: React.FC<{
  value: string
  children: React.ReactNode
  className?: string
}> = ({ value, children, className, ...props }) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext)
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        activeTab === value
          ? "bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 shadow"
          : "hover:bg-gray-100 dark:hover:bg-gray-800",
        className
      )}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent: React.FC<{
  value: string
  children: React.ReactNode
  className?: string
}> = ({ value, children, className, ...props }) => {
  const { activeTab } = React.useContext(TabsContext)
  
  if (activeTab !== value) return null
  
  return (
    <div
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
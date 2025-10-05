'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SheetContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

interface SheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Sheet({ children, open: controlledOpen, onOpenChange }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

interface SheetTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function SheetTrigger({ children, asChild }: SheetTriggerProps) {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error("SheetTrigger must be used within Sheet")

  const handleClick = () => context.setOpen(true)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    } as React.HTMLAttributes<HTMLElement>)
  }

  return <button onClick={handleClick}>{children}</button>
}

interface SheetContentProps {
  children: React.ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  className?: string
}

export function SheetContent({ children, side = 'left', className }: SheetContentProps) {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error("SheetContent must be used within Sheet")

  if (!context.open) return null

  const sideClasses = {
    left: 'left-0 top-0 h-full w-80 border-r animate-in slide-in-from-left',
    right: 'right-0 top-0 h-full w-80 border-l animate-in slide-in-from-right',
    top: 'top-0 left-0 w-full h-80 border-b animate-in slide-in-from-top',
    bottom: 'bottom-0 left-0 w-full h-80 border-t animate-in slide-in-from-bottom',
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in"
        onClick={() => context.setOpen(false)}
      />

      {/* Content */}
      <div
        className={cn(
          'fixed z-50 bg-zinc-950 border-zinc-800 shadow-lg',
          sideClasses[side],
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

interface SheetCloseProps {
  children: React.ReactNode
  asChild?: boolean
}

export function SheetClose({ children, asChild }: SheetCloseProps) {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error("SheetClose must be used within Sheet")

  const handleClick = () => context.setOpen(false)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    } as React.HTMLAttributes<HTMLElement>)
  }

  return <button onClick={handleClick}>{children}</button>
}

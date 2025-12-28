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

  const handleClick = () => context.setOpen(!context.open)

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
    left: 'left-0 top-16 bottom-0 w-80 border-r animate-in slide-in-from-left duration-300',
    right: 'right-0 top-16 bottom-0 w-80 border-l animate-in slide-in-from-right duration-300',
    top: 'left-0 top-16 w-full h-80 border-b animate-in slide-in-from-top duration-300',
    bottom: 'bottom-0 left-0 w-full h-80 border-t animate-in slide-in-from-bottom duration-300',
  }

  return (
    <>
      {/* Blurred overlay - below navbar */}
      <div
        className="fixed inset-0 top-16 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => context.setOpen(false)}
      />

      {/* Content */}
      <div
        className={cn(
          'fixed z-50 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-y-auto',
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

interface SheetHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SheetHeader({ children, className }: SheetHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-2 text-center sm:text-left p-6', className)}>
      {children}
    </div>
  )
}

interface SheetTitleProps {
  children: React.ReactNode
  className?: string
}

export function SheetTitle({ children, className }: SheetTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-foreground', className)}>
      {children}
    </h2>
  )
}

interface SheetDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function SheetDescription({ children, className }: SheetDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  )
}

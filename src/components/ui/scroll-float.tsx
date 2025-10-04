'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollFloatProps {
  children: ReactNode
  offset?: number
}

export function ScrollFloat({ children, offset = 100 }: ScrollFloatProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const element = containerRef.current.querySelector('.scroll-float-item')
    if (!element) return

    const ctx = gsap.context(() => {
      gsap.to(element, {
        y: -offset,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [offset])

  return (
    <div ref={containerRef}>
      <div className="scroll-float-item">{children}</div>
    </div>
  )
}

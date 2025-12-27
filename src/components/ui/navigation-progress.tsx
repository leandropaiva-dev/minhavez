'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setLoading(true)
    setProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    // Complete after a short delay
    const timeout = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 200)
    }, 500)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-600 transition-all duration-200 ease-out z-[100]"
      style={{
        width: `${progress}%`,
        opacity: loading ? 1 : 0,
      }}
    />
  )
}

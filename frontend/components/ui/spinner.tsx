'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SpinnerProps {
  className?: string
  size?: number
  variant?: "bars"
}

export function Spinner({ className, size = 32 }: SpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} role="status" aria-live="polite">
      <style jsx global>{`
        @keyframes kd-spinner-bars {
          0%, 40%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          20% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
      <div className="flex items-end justify-center gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: size / 8,
              height: size,
              animation: "kd-spinner-bars 1s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
            className="rounded-full bg-orange-500"
          />
        ))}
      </div>
      <span className="sr-only">Loading</span>
    </div>
  )
}

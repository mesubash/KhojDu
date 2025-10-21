import { cn } from "@/lib/utils"
import Image from "next/image"

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  type?: "banner" | "icon"
  variant?: "contain" | "cover" | "fill"
  showTagline?: boolean
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", type = "banner", variant = "contain", showTagline = false, showText = false, className }: LogoProps) {
  const bannerDimensions = {
    xs: { width: 120, height: 36, className: "h-9" }, // Perfect for header (36px fits in 64px header)
    sm: { width: 200, height: 60, className: "h-15" },
    md: { width: 300, height: 80, className: "h-20" },
    lg: { width: 400, height: 100, className: "h-25" },
    xl: { width: 500, height: 120, className: "h-30" },
  }

  const iconDimensions = {
    xs: { width: 32, height: 32, className: "w-8 h-8" },
    sm: { width: 48, height: 48, className: "w-12 h-12" },
    md: { width: 64, height: 64, className: "w-16 h-16" },
    lg: { width: 80, height: 80, className: "w-20 h-20" },
    xl: { width: 96, height: 96, className: "w-24 h-24" },
  }

  if (type === "icon") {
    const iconConfig = iconDimensions[size]
    return (
      <div className={cn("flex items-center", className)}>
        <Image
          src="/logo_icon.png"
          alt="KhojDu Logo"
          width={iconConfig.width}
          height={iconConfig.height}
          className={cn("object-contain", iconConfig.className)}
          priority
        />
      </div>
    )
  }

  const bannerConfig = bannerDimensions[size]
  const objectFitClass = variant === "contain" ? "object-contain" : variant === "cover" ? "object-cover" : "object-fill"
  
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className={cn("relative overflow-hidden", bannerConfig.className)} style={{ width: bannerConfig.width }}>
        <Image
          src="/logo_banner.png"
          alt="KhojDu - Find Your Perfect Rental"
          width={bannerConfig.width}
          height={bannerConfig.height}
          className={cn(objectFitClass, "w-full h-full")}
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col items-start">
          <span className="text-2xl text-orange-500 leading-none" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>
            KhojDu
          </span>
          <span className="text-[10px] text-foreground font-bold tracking-wider leading-none mt-0.5" style={{ fontFamily: 'var(--font-delius)' }}>
            FIND YOUR ROOF
          </span>
        </div>
      )}
      {showTagline && (
        <span className="ml-3 text-sm font-medium text-muted-foreground">Find Your Perfect Rental</span>
      )}
    </div>
  )
}

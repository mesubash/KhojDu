"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/context/AuthContext"
import { UserRole } from "@/types/auth"
// import { useTranslation } from "@/lib/i18n"x
import { Menu, X, MessageSquare, User, LogOut, Settings } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  hideNavigation?: boolean
}

export function Header({ hideNavigation = false }: HeaderProps) {
  // const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Create user info from auth context
  const userInfo = user ? {
    name: user.fullName || user.email,
    email: user.email,
    avatar: user.avatar,
    initials: user.fullName
      ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
      : user.email.charAt(0).toUpperCase()
  } : undefined

  const navigation = isAuthenticated
    ? [
        {
          name: "Dashboard",
          href:
            user?.role === UserRole.ADMIN
              ? "/admin"
              : user?.role === UserRole.LANDLORD
                ? "/dashboard/landlord"
                : "/dashboard/tenant",
        },
        { name: "Search", href: "/search" },
        { name: "Profile", href: "/profile" },
      ]
    : [
        { name: "Home", href: "/" },
        { name: "Search", href: "/search" },
        { name: "How it Works", href: "/how-it-works" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
      ]

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    // Treat dashboard links as active if the current path is under them
    if (href.startsWith("/dashboard")) {
      return pathname === href || pathname.startsWith("/dashboard")
    }
    if (href === "/admin") {
      return pathname === "/admin" || pathname.startsWith("/admin")
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-orange-50/80 via-background/90 to-teal-50/80 dark:from-gray-900/80 dark:via-gray-900/90 dark:to-gray-800/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-responsive">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center -ml-4">
            <Link href="/" className="flex items-center">
              <Logo type="banner" size="xs" showText={true} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!hideNavigation && (
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 hover:text-orange-600 group ${isActiveRoute(item.href)
                      ? "text-orange-600"
                      : "text-muted-foreground"
                    }`}
                >
                  {item.name}
                  {/* Animated underline */}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 transform transition-all duration-300 ${isActiveRoute(item.href)
                        ? "scale-x-100 opacity-100"
                        : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70"
                      }`}
                  />
                </Link>
              ))}
              {/* Highlighted external link (text-highlighted, not background) */}
              <a
                href="https://rentle.subashsdhami.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-semibold transition-all duration-300 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90"
              >
                Other Renting
              </a>
            </nav>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <Link href="/messages">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-orange-600">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity">
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400 cursor-pointer">
                          {userInfo?.initials || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {userInfo?.name && <p className="font-medium">{userInfo.name}</p>}
                        {userInfo?.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {userInfo.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && !hideNavigation && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border rounded-lg mt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors rounded-md ${isActiveRoute(item.href)
                      ? "text-orange-600 bg-orange-50 dark:bg-orange-950/20"
                      : "text-muted-foreground hover:text-orange-600 hover:bg-muted"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {/* Mobile highlighted external link */}
              <a
                href="https://rentle.subashsdhami.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-base font-semibold transition-colors rounded-md text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Other Renting
              </a>
              <div className="border-t pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
                          {userInfo?.initials || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{userInfo?.name}</span>
                        <span className="text-xs text-muted-foreground">{userInfo?.email}</span>
                      </div>
                    </div>
                    <Link href="/messages" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Messages
                      </Button>
                    </Link>
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start mt-2 text-red-600 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full justify-start mt-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation for Dashboard (hideNavigation=true) */}
        {isMenuOpen && hideNavigation && isAuthenticated && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border rounded-lg mt-2">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
                  <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
                    {userInfo?.initials || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{userInfo?.name}</span>
                  <span className="text-xs text-muted-foreground">{userInfo?.email}</span>
                </div>
              </div>
              <Link href="/messages" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Button>
              </Link>
              <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start mt-2 text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

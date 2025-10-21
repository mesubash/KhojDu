import type React from "react"
import type { Metadata } from "next"
import { Inter, Nothing_You_Could_Do, Delius } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
// import { TranslationProvider } from "@/lib/i18n"

const inter = Inter({ subsets: ["latin"] })
const nothingYouCouldDo = Nothing_You_Could_Do({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-nothing-you-could-do"
})
const delius = Delius({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-delius"
})

export const metadata: Metadata = {
  title: "KhojDu - Find Your Perfect Rental in Nepal",
  description: "Discover amazing properties, connect with verified landlords, and find your dream home with KhojDu.",
  generator: 'v0.app',
  icons: {
    icon: '/logo_icon.png',
    shortcut: '/logo_icon.png',
    apple: '/logo_icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo_icon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} ${nothingYouCouldDo.variable} ${delius.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

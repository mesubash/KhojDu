// "use client"

// import { Button } from "@/components/ui/button"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// // import { useTranslation } from "@/lib/i18n"

// export function LanguageSwitcher() {
//   // const { language, setLanguage } = useTranslation()

//   const languages = [
//     { code: "en", name: "English" },
//     { code: "ne", name: "नेपाली" },
//   ]

//   const currentLanguage = languages.find((lang) => lang.code === language)

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" size="sm">
//           <span className="text-sm">{currentLanguage?.name || "English"}</span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         {languages.map((lang) => (
//           <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code as "en" | "ne")}>
//             <span>{lang.name}</span>
//           </DropdownMenuItem>
//         ))}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }

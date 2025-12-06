import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { UserRole } from "@/types/auth"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Map user roles to their dashboard entry points
export function getDashboardRouteForRole(role?: UserRole) {
  switch (role) {
    case UserRole.ADMIN:
      return "/admin"
    case UserRole.LANDLORD:
      return "/dashboard/landlord"
    case UserRole.TENANT:
      return "/dashboard/tenant"
    default:
      return "/dashboard"
  }
}

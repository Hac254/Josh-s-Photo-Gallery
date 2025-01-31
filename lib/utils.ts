import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileName(name: string): string {
  return name
    .replace(/\.[^/.]+$/, "") // Remove file extension
    .split(/[-_]/) // Split by hyphens or underscores
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter
    .join(" ")
}


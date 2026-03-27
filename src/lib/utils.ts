import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fixMalformedUTF8(str: string): string {
  if (!str) return str
  try {
    // Automatically attempts to fix strings that were wrongly interpreted as ISO-8859-1
    // e.g. "SÃ£o Paulo" -> "São Paulo".
    // If it's already correct UTF-8, decodeURIComponent will throw a URIError
    // and we gracefully return the original string.
    return decodeURIComponent(escape(str))
  } catch (e) {
    return str
  }
}
